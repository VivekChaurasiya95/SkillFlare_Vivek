# MITS SkillFlare 🎓

A comprehensive student talent marketplace and mentorship platform for MITS. It empowers students and teachers to collaborate seamlessly through a task-based economy, professional mentorships, real-time messaging, and intelligent AI assistance.

![MITS SkillFlare](https://via.placeholder.com/800x200/F57C00/FFFFFF?text=MITS+SkillFlare)

## 🌟 Key Features

### For Students

- **Browse Tasks:** Discover tasks posted by teachers, mentors, and peers.
- **Take & Complete Tasks:** Gain hands-on experience and earn credit points for valid submissions.
- **Mentorship:** Connect with experienced developers and mentors or apply to become one.
- **Build Portfolio:** Showcase completed work and earn badges on your profile.
- **Leaderboard:** Compete with peers and climb the ranks using gamified credit points.

### For Mentors

- **Become a Mentor:** Apply by detailing skills, coding profiles, and professional links.
- **Manage Profile:** Update your availability dynamically and adjust technical skillsets.
- **Guide Students:** Accept mentorship requests and conduct 1-on-1 sessions.

### For Teachers

- **Post Tasks:** Create assignments with descriptions, deadlines, and credit point rewards.
- **Review Submissions:** Approve completed tasks or request revisions with direct feedback.
- **Rate Students:** Provide constructive ratings to boost student portfolios.
- **Monitor Progress:** Track the completion pipeline of posted tasks through the dashboard.

### 🤖 Buddy AI Assistant (Powered by Ollama)

SkillFlare comes with an embedded, context-aware AI named **Buddy AI**.

- Built on a dynamic backend architecture connected to **Ollama** (Mistral/Llama backend)
- Trained specifically on the internal architecture of **MITS SkillFlare**.
- Highly moderated to ensure completely safe, educational, and relevant outputs.
- Acts as a real-time guide to navigating tasks, finding mentors, or general platform query solving.

### Platform Features

- 🔒 **Secure Authorization:** JWT-based robust authentication with distinct Role-Based Access Controls.
- 💬 **Real-Time Communication:** Live web sockets using `Socket.io` for instant messaging.
- 👨‍💻 **Developer Hub:** Easily explore the passionate student team building SkillFlare.
- 🌙 **Dark-Mode First UI:** A modernized, sleek, and glow-textured interface.
- 📱 **Mobile Responsive:** Fluid layout that operates gracefully on phones, tablets, and desktops.

---

## 🛠️ Tech Stack

### Frontend

- **React 18** (Vite build system)
- **Tailwind CSS** (Custom theme presets and glassmorphic designs)
- **React Router DOM v6**
- **Socket.IO-Client** for real-time live chats
- **Lucide React** & **React Icons** for beautiful UI iconography
- **Axios** for API data fetching
- **React Hot Toast** for sleek user notifications

### Backend

- **Node.js & Express.js**
- **MongoDB & Mongoose** for the database schema
- **JWT** (JSON Web Tokens) for security layers
- **Bcrypt.js** for password hashing and salting
- **Socket.IO** for event-driven asynchronous chat
- **Ollama / Axios** for LLM handling and prompt optimization
- **Express Rate Limit & Helmet** for robust web security

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed on your local environment:

- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas instance)
- **Ollama** (Only necessary if you intend to run the Buddy AI local server capabilities)

### General Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/KD2303/MITS-CampusSkill.git
   cd MITS-CampusSkill
   ```

2. **Configure Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   **Update your `.env` to include:**
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secure random encryption string
   - `OLLAMA_API_URL` - Default: `http://localhost:11434/api/generate` (If utilizing Buddy AI)

3. **Configure Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running a local DB)

   ```bash
   mongod
   ```

2. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Backend defaults to: `http://localhost:5000`

3. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend defaults to: `http://localhost:5173`

_(Note: Run `ollama serve` if you are using AI functionalities)_

---

## 📁 Project Structure

```
MITS-CampusSkill/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment & Local DB mapping
│   │   ├── controllers/  # API business logic
│   │   ├── middleware/   # Custom Auth, Security & Upload middlewares
│   │   ├── models/       # Mongoose DB Schemas
│   │   ├── routes/       # Express route mapping
│   │   ├── services/     # Standalone services (e.g. AI Prompt logic)
│   │   ├── utils/        # Generic formatting tools
│   │   └── server.js     # Entry point
│   └── package.json
└── frontend/
    ├── public/           # Static assets, branding, vectors
    ├── src/
    │   ├── components/   # Reusable UI (Nav, Modals, AIChat)
    │   ├── context/      # React Context (Auth, Theme, Sockets)
    │   ├── hooks/        # Custom React Hooks
    │   ├── pages/        # Fully rendered React app routes
    │   ├── services/     # Axios API integrations
    │   ├── App.jsx       # Root Router Mapping
    │   └── main.jsx      # React DOM Render target
    ├── tailwind.config.js
    └── package.json
```

---

## 📡 Essential Core Endpoints

### Authentication

- `POST /api/auth/register` - Create An Account
- `POST /api/auth/login` - Authenticate & Retrieve Token
- `GET /api/auth/me` - Fetch Secure User Model

### Tasks & Progression

- `GET /api/tasks` - Browse Available Tasks
- `POST /api/tasks` - Teacher Task Creation
- `POST /api/tasks/:id/take` - Student Accepting Task
- `POST /api/tasks/:id/submit` - Task Evaluation Submit

### Buddy AI & Messaging

- `POST /api/ai/chat` - Interact with Platform's Assistant
- `POST /api/chat/room` - Private User-to-User Threading
- `POST /api/chat/message` - Live dispatch transmission

---

## 👨‍💻 Meet The Team

**MITS SkillFlare Development Team:**

- **Project Mentor:** Dr. Devesh Kumar Lal
- **Full Stack:** Krish Dargar
- **Frontend:** Sheetal Gourh
- **Backend:** Arin Gupta, Anurag Mishra, Vivek Chaurasiya
- **QA & Testing:** Ashish Garg

Explore their visual profiles inside the `/developers` tab!

---

## 📚 Documentation

For more detailed documentation, please refer to:

- [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) - Buddy AI architecture and usage
- [Architecture Overview](./ARCHITECTURE.md) - Full system design
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Feature implementation details

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and licensed under PRIVATE license.

---

_Made with ❤️ by MITS Students for MITS Students._
