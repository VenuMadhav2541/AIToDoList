# Smart Todo List API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required. Session management is implemented for future use.

## Response Format
All API responses follow a consistent JSON format:

**Success Response:**
```json
{
  "data": "response_data_here"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

---

## Tasks API

### GET /api/tasks
Retrieve all tasks from the database, ordered by creation date (newest first).

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project presentation",
    "description": "Based on your email context, this presentation for the Q1 review is crucial for the upcoming meeting on Friday.",
    "category": "Work",
    "priority": "high",
    "priority_score": 9,
    "status": "pending",
    "deadline": "2025-07-05T00:00:00.000Z",
    "estimated_time": "2 hours",
    "ai_enhanced": true,
    "ai_suggestions": {
      "reasoning": "High priority due to upcoming deadline",
      "confidence": 0.95
    },
    "tags": ["presentation", "quarterly", "urgent"],
    "created_at": "2025-07-04T10:30:00.000Z",
    "updated_at": "2025-07-04T11:45:00.000Z"
  }
]
```

### GET /api/tasks/:id
Retrieve a specific task by ID.

**Parameters:**
- `id` (number): Task ID

**Response:** Single task object (same format as above)

**Error Responses:**
- `404`: Task not found

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete quarterly report",
  "description": "Prepare financial summary for Q1",
  "category": "Work",
  "priority": "high",
  "deadline": "2025-07-10",
  "estimated_time": "3 hours",
  "tags": ["finance", "quarterly"]
}
```

**Required Fields:**
- `title` (string): Task title
- `category` (string): Task category
- `priority` (string): One of "high", "medium", "low"

**Optional Fields:**
- `description` (string): Task description
- `deadline` (string): ISO date string
- `estimated_time` (string): Time estimate
- `tags` (array): Array of tag strings

**Response:** Created task object with generated ID and timestamps

### PATCH /api/tasks/:id
Update an existing task.

**Parameters:**
- `id` (number): Task ID

**Request Body:** Partial task object with fields to update

**Response:** Updated task object

**Error Responses:**
- `404`: Task not found

### DELETE /api/tasks/:id
Delete a task.

**Parameters:**
- `id` (number): Task ID

**Response:** 
- `204`: No content (success)

**Error Responses:**
- `404`: Task not found

---

## AI Enhancement API

### POST /api/tasks/ai-enhance
Get AI-powered task suggestions and enhancements.

**Request Body:**
```json
{
  "title": "Prepare quarterly report",
  "description": "Financial summary needed",
  "category": "Work"
}
```

**Response:**
```json
{
  "enhancedDescription": "Complete quarterly financial report including revenue analysis, expense breakdown, profit margins, and comparative metrics from previous quarters. Include visual charts and executive summary.",
  "suggestedCategory": "Work",
  "suggestedPriority": "high",
  "suggestedDeadline": "2025-07-15",
  "estimatedTime": "4-6 hours",
  "reasoning": "Based on your recent context about quarterly reviews and the complexity of financial reporting, this task requires high priority and substantial time allocation."
}
```

### POST /api/tasks/prioritize
Get AI-optimized task prioritization based on current context.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project presentation",
    "priority": "high",
    "priority_score": 9,
    // ... other task fields
  },
  {
    "id": 2,
    "title": "Buy groceries",
    "priority": "medium",
    "priority_score": 5,
    // ... other task fields
  }
]
```

**Note:** Returns tasks reordered by AI-calculated priority

---

## Context Processing API

### GET /api/context
Retrieve daily context entries, ordered by creation date (newest first).

**Response:**
```json
[
  {
    "id": 1,
    "content": "Email from manager about quarterly review meeting. Need to prepare presentation by Friday.",
    "source_type": "email",
    "processed_insights": {
      "urgency_level": "high",
      "extracted_deadlines": ["2025-07-05"],
      "key_topics": ["presentation", "quarterly review"]
    },
    "extracted_tasks": [
      {
        "title": "Prepare quarterly presentation",
        "priority": "high",
        "deadline": "2025-07-05"
      }
    ],
    "is_processed": true,
    "created_at": "2025-07-04T09:15:00.000Z"
  }
]
```

### POST /api/context
Create a new context entry.

**Request Body:**
```json
{
  "content": "Meeting notes from project planning session...",
  "source_type": "note"
}
```

**Required Fields:**
- `content` (string): Context content
- `source_type` (string): One of "email", "message", "note"

**Response:** Created context entry object

### POST /api/context/process
Process multiple context entries with AI to extract tasks and insights.

**Request Body:**
```json
{
  "entries": [
    {
      "content": "Email about project deadline...",
      "source_type": "email"
    },
    {
      "content": "WhatsApp message about family dinner...",
      "source_type": "message"
    }
  ]
}
```

**Response:**
```json
{
  "extractedTasks": [
    {
      "title": "Complete project deliverables",
      "description": "Based on email context about upcoming deadline",
      "category": "Work",
      "priority": "high",
      "urgency": 9
    }
  ],
  "priorityUpdates": [
    {
      "taskId": 3,
      "newPriority": "high",
      "reasoning": "Deadline moved up based on email context"
    }
  ],
  "suggestions": [
    {
      "type": "schedule",
      "message": "Block morning hours for high-priority work when you're most productive",
      "actionable": true
    }
  ]
}
```

---

## AI Suggestions API

### GET /api/ai/suggestions
Get personalized AI suggestions based on current tasks and context.

**Response:**
```json
[
  {
    "type": "schedule",
    "message": "Consider batching similar tasks together to minimize context switching",
    "actionable": true
  },
  {
    "type": "optimize",
    "message": "Break down large tasks into smaller, manageable chunks",
    "actionable": true
  },
  {
    "type": "delegate",
    "message": "This task could be shared with team members based on your recent collaboration patterns",
    "actionable": false
  },
  {
    "type": "break",
    "message": "Take a 15-minute break after completing your current high-priority task",
    "actionable": true
  }
]
```

**Suggestion Types:**
- `schedule`: Time management and scheduling recommendations
- `optimize`: Task optimization and workflow improvements
- `delegate`: Collaboration and delegation opportunities
- `break`: Rest and productivity recommendations

---

## Categories API

### GET /api/categories
Get task categories with usage statistics.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Work",
    "color": "blue",
    "usage_count": 15,
    "created_at": "2025-07-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Personal",
    "color": "green",
    "usage_count": 8,
    "created_at": "2025-07-01T00:00:00.000Z"
  }
]
```

**Note:** Categories are ordered by usage count (most used first)

### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Learning",
  "color": "purple"
}
```

**Required Fields:**
- `name` (string): Category name (must be unique)
- `color` (string): Color identifier

**Response:** Created category object

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid request body or parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |

## Rate Limiting
Currently no rate limiting implemented. Consider implementing for production use.

## Pagination
Not currently implemented. All endpoints return complete datasets. Consider implementing for large datasets.

## Data Validation
All request bodies are validated using Zod schemas:
- Task data validation ensures required fields and proper data types
- Context data validation ensures proper source types
- Category data validation prevents duplicate names

## AI Integration Notes
- AI features require valid OpenAI API key
- AI processing may take 2-30 seconds depending on context complexity
- AI suggestions are cached for 5 minutes to improve performance
- Context processing is asynchronous and updates database with insights

## Example Usage

### Creating a Task with AI Enhancement
```javascript
// Step 1: Get AI suggestions
const aiResponse = await fetch('/api/tasks/ai-enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Plan team meeting',
    description: 'Quarterly review discussion',
    category: 'Work'
  })
});
const aiSuggestions = await aiResponse.json();

// Step 2: Create task with AI suggestions
const taskResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Plan team meeting',
    description: aiSuggestions.enhancedDescription,
    category: aiSuggestions.suggestedCategory,
    priority: aiSuggestions.suggestedPriority,
    deadline: aiSuggestions.suggestedDeadline,
    estimated_time: aiSuggestions.estimatedTime,
    ai_enhanced: true
  })
});
```

### Processing Daily Context
```javascript
const contextResponse = await fetch('/api/context/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entries: [
      {
        content: 'Email from client about urgent bug fix needed',
        source_type: 'email'
      },
      {
        content: 'Calendar reminder: Doctor appointment tomorrow 3 PM',
        source_type: 'note'
      }
    ]
  })
});
const insights = await contextResponse.json();

// insights.extractedTasks contains new tasks to create
// insights.priorityUpdates contains existing tasks to update
// insights.suggestions contains productivity recommendations
```