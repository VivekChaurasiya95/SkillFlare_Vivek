import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenResponse } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken";

// Configuration for roles
const DOMAIN_ROLE_MAP = {
  "mitsgwalior.in": "teacher",
  "mitsgwl.ac.in": "student",
};

const isEmailDomainRestrictionEnabled =
  process.env.RESTRICT_EMAIL_DOMAIN === "true" ||
  process.env.NODE_ENV === "production";

const getRoleFromEmail = (email) => {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@").pop().toLowerCase();
  return DOMAIN_ROLE_MAP[domain] || null;
};

const resolveUserRole = (email, requestedRole) => {
  const derivedRole = getRoleFromEmail(email);
  if (derivedRole) return derivedRole;

  // If restriction is ON and domain doesn't match, block registration
  if (isEmailDomainRestrictionEnabled) return null;

  // If restriction is OFF (Dev mode), fallback to requested role or student
  return requestedRole === "teacher" ? "teacher" : "student";
};

// @desc    Register user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, role: requestedRole } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  const role = resolveUserRole(normalizedEmail, requestedRole);
  if (!role) {
    return res.status(400).json({
      success: false,
      message:
        "Please use your institutional email (@mitsgwalior.in or @mitsgwl.ac.in)",
    });
  }

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      skills: skills || [],
    });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    throw err;
  }
});

// @desc    Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get Session (Non-blocking)
export const getSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token)
    return res
      .status(200)
      .json({ success: true, authenticated: false, user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(200)
        .json({ success: true, authenticated: false, user: null });

    res.status(200).json({ success: true, authenticated: true, user });
  } catch {
    res.status(200).json({ success: true, authenticated: false, user: null });
  }
});

// @desc    Logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res
      .status(401)
      .json({ success: false, message: "Current password incorrect" });
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password - Send Reset Token
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide an email" });
  }

  const user = await User.findOne({ email: normalizedEmail });

  // Generic response to prevent user enumeration (always return 200)
  const genericResponse = {
    success: true,
    message:
      "If an account with this email exists, a password reset link has been sent.",
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Generate reset token (JWT)
  const resetToken = jwt.sign(
    { id: user._id },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: process.env.RESET_TOKEN_EXPIRE || "15m" },
  );

  // Store token and expiry in database
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  user.resetToken = resetToken;
  user.resetTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send email with reset link
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email will be sent using the email service
    const { sendEmail } = await import("../utils/emailService.js");
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>SkillFlare Team</p>
      `,
    });

    res.status(200).json(genericResponse);
  } catch (error) {
    // If email fails, still send generic response but log the error
    console.error("Failed to send reset email:", error);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(genericResponse);
  }
});

// @desc    Reset Password - Verify Token & Update Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing reset token",
    });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide password and confirm password",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token must not be expired
    }).select("+resetToken +resetTokenExpiry");

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset link. Please request a new one.",
      });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send confirmation email
    try {
      const { sendEmail } = await import("../utils/emailService.js");
      await sendEmail({
        to: user.email,
        subject: "Password Reset Successful",
        html: `
          <h2>Password Reset Successful</h2>
          <p>Hello ${user.name},</p>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Best regards,<br>SkillFlare Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message:
          "Reset token has expired. Please request a new password reset.",
      });
    }

    throw error;
  }
});
