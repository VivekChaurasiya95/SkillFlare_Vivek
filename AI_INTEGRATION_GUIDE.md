# AI-Assisted Intelligence System Integration Guide

## Overview

The AI-Assisted Intelligence System for SkillFlare is a comprehensive, multi-layered architecture designed to provide intelligent assistance while maintaining academic integrity. The system uses Ollama's Mistral model as the AI backbone with role-specific response adaptation (student, mentor, teacher).

## Architecture

### Backend Layers (Top to Bottom)

1. **Orchestration Layer** (`aiService.js`) - Coordinates all services
2. **Controller Layer** (`aiController.js`) - HTTP request handling
3. **Service Layer** - 6 specialized services:
   - Intent Detection (`intentDetection.js`)
   - Context Builder (`contextBuilder.js`)
   - Moderation (`moderationService.js`)
   - Prompt Construction (`promptConstructor.js`)
   - Role Behavior (`roleBehavior.js`)
   - AI Config (`aiConfig.js`)

### Frontend Components

- **AIChat Component** (`AIChat.jsx`) - Main chat UI
- **AI Context** (`AIContext.jsx`) - State management
- **AI Service** (`aiService.js`) - API communication

### Database Model

- **AIConversation** - Stores conversation history and metadata

## Integration Steps

### Step 1: Update Backend Server Configuration

In `backend/src/server.js`, register the AI routes:

```javascript
import aiRoutes from "./routes/aiRoutes.js";

// Add after other route registrations
app.use("/api/ai", aiRoutes);
```

### Step 2: Update Frontend App Configuration

In `frontend/src/main.jsx` or `frontend/src/App.jsx`, wrap your app with the AIProvider:

```javascript
import { AIProvider } from "./context";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <AIProvider>{/* Your app content */}</AIProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Step 3: Integrate AIChat Component

#### Option A: Dashboard Page

In `frontend/src/pages/Dashboard.jsx`:

```javascript
import { AIChat } from "../components";
import { useState } from "react";

export default function Dashboard() {
  const [showAI, setShowAI] = useState(true);

  return (
    <div className="dashboard-container">
      {/* Existing dashboard content */}

      {showAI && (
        <div className="ai-panel">
          <AIChat onClose={() => setShowAI(false)} />
        </div>
      )}

      {!showAI && (
        <button onClick={() => setShowAI(true)}>💬 Open AI Assistant</button>
      )}
    </div>
  );
}
```

#### Option B: TaskDetails Page

In `frontend/src/pages/TaskDetails.jsx`:

```javascript
import { AIChat } from "../components";
import { useParams } from "react-router-dom";

export default function TaskDetails() {
  const { taskId } = useParams();

  return (
    <div className="task-details-container">
      {/* Existing task details content */}

      <div className="task-sidebar">
        <AIChat
          taskId={taskId}
          onClose={() => {
            /* handle close */
          }}
        />
      </div>
    </div>
  );
}
```

#### Option C: Submission Page with AIChat

In `frontend/src/pages/SubmissionReview.jsx`:

```javascript
import { AIChat } from "../components";

export default function SubmissionReview() {
  const { taskId, submissionId } = useParams();

  return (
    <div className="submission-container">
      {/* Existing submission content */}

      <AIChat taskId={taskId} submissionId={submissionId} />
    </div>
  );
}
```

## API Endpoints

### POST /api/ai/chat

Process a message and get AI response.

**Request:**

```json
{
  "message": "How do I approach this task?",
  "taskId": "task_123",
  "submissionId": "sub_456",
  "conversationHistory": []
}
```

**Response:**

```json
{
  "success": true,
  "response": "Here's a suggested approach...",
  "metadata": {
    "intent": "task_help",
    "confidence": 0.95,
    "role": "student",
    "warnings": []
  }
}
```

### GET /api/ai/history

Get conversation history for current user.

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "sender": "user",
      "content": "...",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "sender": "assistant",
      "content": "...",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "count": 2
}
```

### DELETE /api/ai/history

Clear conversation history.

### GET /api/ai/status

Get AI system status.

**Response:**

```json
{
  "success": true,
  "status": {
    "healthy": true,
    "ollama": {
      "status": "running",
      "model": "mistral"
    },
    "activeConversations": 5
  }
}
```

### GET /api/ai/health

Check if AI service is operational (returns 200 if healthy, 503 if not).

## Intent Types

The system recognizes 8 intent types:

1. **task_help** - "How do I solve this task?"
2. **submission_feedback** - "Can you review my code?"
3. **mentorship_inquiry** - "Can you mentor me?"
4. **learning_explanation** - "Explain this concept"
5. **platform_help** - "How do I use this feature?"
6. **code_explanation** - "What does this code do?"
7. **task_recommendation** - "What task should I do next?"
8. **general_inquiry** - "General questions"

## Configuration

### Ollama Configuration

In `backend/src/utils/aiConfig.js`, adjust as needed:

```javascript
const OLLAMA_CONFIG = {
  OLLAMA_HOST: process.env.OLLAMA_HOST || "http://localhost:11434",
  MODEL: process.env.AI_MODEL || "mistral",
  TIMEOUT: 30000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 1024,
};
```

### Role Rate Limits

In `backend/src/services/ai/roleBehavior.js`:

```javascript
export const ROLE_CAPABILITIES = {
  student: {
    rateLimit: 50, // requests per hour
    // ...
  },
  mentor: {
    rateLimit: 100,
    // ...
  },
  teacher: {
    rateLimit: 150,
    // ...
  },
};
```

## Safety Features

### Input Moderation

- Detects cheating attempt phrases
- Filters abusive content
- Validates message length
- Rate limits requests

### Output Moderation

- Prevents complete solutions
- Filters code blocks if solution detected
- Validates policy compliance

### Context Awareness

- Builds rich context from platform
- Sanitizes sensitive data
- Includes role-specific guidelines

## Frontend Hooks

### useAI() Hook

```javascript
import { useAI } from "../context";

function MyComponent() {
  const { messages, loading, error, handleSendMessage, clearMessages } =
    useAI();

  const sendMsg = async () => {
    try {
      await handleSendMessage("Help me understand this");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={sendMsg} disabled={loading}>
        {loading ? "Sending..." : "Ask"}
      </button>
    </div>
  );
}
```

## Database Setup

### Add AIConversation Model to Index

In `backend/src/models/index.js`:

```javascript
export { default as AIConversation } from "./AIConversation.js";
```

### Store Conversations (Optional)

To persist conversations to MongoDB, update `aiService.js`:

```javascript
import AIConversation from "../models/AIConversation.js";

// In processAIRequest function, after successful response:
await AIConversation.findOneAndUpdate(
  { userId, _id: sessionId },
  {
    $push: {
      messages: {
        sender: "user",
        content: message,
        intent: intentResult.intent,
      },
    },
  },
  { upsert: true, new: true },
);
```

## Testing

### Test Intent Detection

```javascript
import { detectIntent } from "./services/ai/intentDetection.js";

const result = detectIntent("How do I solve this task?", { role: "student" });
console.log(result); // { intent: 'task_help', confidence: 0.95, ... }
```

### Test Moderation

```javascript
import { moderateMessage } from "./services/ai/moderationService.js";

const result = moderateMessage("Can you solve this for me?");
console.log(result); // { approved: false, reason: 'Cheating attempt detected', ... }
```

### Test AI Connection

```javascript
import { checkOllamaHealth } from "./utils/aiConfig.js";

const isHealthy = await checkOllamaHealth();
console.log("Ollama status:", isHealthy ? "running" : "offline");
```

## Environment Variables

Create a `.env` file in backend directory:

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
AI_MODEL=mistral

# Database
MONGODB_URI=mongodb://localhost:27017/skillflare

# API Configuration
API_PORT=5000
NODE_ENV=development
```

## Troubleshooting

### "Connection refused" error

- Ensure Ollama is running: `ollama serve`
- Check OLLAMA_HOST configuration
- Verify port 11434 is accessible

### Rate limit errors

- Check user role rate limits
- Clear conversation history if needed
- Verify rate limiting logic in roleB behavior.js

### Intent not detected correctly

- Check keyword patterns in intentDetection.js
- Add more keywords for specific intents
- Adjust confidence thresholds

### Responses too long or abbreviated

- Adjust MAX_TOKENS in aiConfig.js
- Modify DEFAULT_TEMPERATURE for creativity control
- Check prompt construction in promptConstructor.js

## Best Practices

1. **Always check health before using AI**: Call `/api/ai/health` before showing AI chat
2. **Show loading states**: Use `loading` flag from useAI hook
3. **Handle errors gracefully**: Display user-friendly error messages
4. **Limit context**: Only pass necessary context to reduce latency
5. **Respect rate limits**: Show friendly message when rate limit hit
6. **Sanitize inputs**: Frontend should validate before sending
7. **Cache conversations**: Store in session/local storage for performance

## Security Considerations

1. **Authentication Required**: All AI endpoints require user authentication
2. **Authorization**: Role-based access control for intents
3. **Data Privacy**: Sensitive data is sanitized before AI processing
4. **Input Validation**: All inputs validated before processing
5. **Output Filtering**: Responses checked for policy violations
6. **Rate Limiting**: Prevents abuse and excessive API usage

## Performance Optimization

1. **Conversation Caching**: Keep last 50 messages in memory
2. **Intent Caching**: Cache frequently detected intents
3. **Streaming Responses**: Use `streamAIResponse()` for real-time display
4. **Lazy Loading**: Load AI component only when needed
5. **Message Batching**: Process multiple messages efficiently

## Future Enhancements

1. Add conversation analytics dashboard
2. Implement AI response caching
3. Add multi-language support
4. Implement user feedback loop for model improvement
5. Add visual code block rendering
6. Implement response follow-up suggestions
7. Add conversation export functionality
8. Implement AI model switching capability

## Support

For issues or questions:

1. Check system health: `GET /api/ai/health`
2. Review logs in console
3. Verify Ollama is running
4. Check environment variables
5. Test with direct curl/Postman requests

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready
