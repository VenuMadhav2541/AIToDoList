# Smart Todo List with AI

A full-stack web application with AI-powered task management features built with React, Express.js, PostgreSQL, and OpenAI integration.

![Smart Todo App](screenshots/dashboard.png)

## 🌟 Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- 🏷️ **Smart Categories**: AI-powered automatic categorization
- ⚡ **Priority Management**: AI-driven priority scoring and recommendations
- 📅 **Deadline Tracking**: Smart deadline suggestions based on context
- ✨ **AI Enhancement**: Context-aware task descriptions and suggestions

### AI-Powered Features
- 🧠 **Context Processing**: Analyze daily context (emails, messages, notes)
- 🎯 **Task Prioritization**: AI ranks tasks based on urgency and context
- 📊 **Smart Suggestions**: Personalized productivity recommendations
- 🔄 **Dynamic Updates**: Real-time priority adjustments based on new context
- 💡 **Enhanced Descriptions**: AI improves task details with contextual information

### User Interface
- 🎨 **Modern Design**: Clean, responsive interface with Tailwind CSS
- 🌙 **Dark Mode Support**: Toggle between light and dark themes
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- ⚡ **Real-time Updates**: Instant UI updates with optimistic rendering

## 🖼️ Screenshots

### Dashboard View
![Dashboard](screenshots/dashboard.png)
*Main dashboard showing AI-powered task prioritization and suggestions*

### Task Creation with AI
![Task Creation](screenshots/task-creation.png)
*AI-enhanced task creation with smart suggestions*

### Context Input Page
![Context Input](screenshots/context-input.png)
*Daily context processing for better task management*

### AI Suggestions Panel
![AI Suggestions](screenshots/ai-suggestions.png)
*Personalized productivity recommendations*

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database (Supabase recommended)
- OpenAI API key

### 1. Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd smart-todo-ai
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Create a `.env` file in the root directory:

\`\`\`env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application Configuration
NODE_ENV=development
\`\`\`

### 4. Database Setup

#### Using Supabase (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string from "Connection string" → "Transaction pooler"
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Use this URL as your `DATABASE_URL`

#### Run Database Migrations
\`\`\`bash
# Setup database tables and sample data
npx tsx setup-db.ts

# Or use Drizzle migrations
npm run db:push
\`\`\`

### 5. Start the Application
\`\`\`bash
# Development mode (starts both frontend and backend)
npm run dev

# The application will be available at http://localhost:5000
\`\`\`

## 📚 API Documentation

### Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

### Tasks Endpoints

#### GET /api/tasks
Retrieve all tasks from the database.

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "title": "Complete project presentation",
    "description": "Based on your email context...",
    "category": "Work",
    "priority": "high",
    "priority_score": 9,
    "status": "pending",
    "deadline": "2025-07-05T00:00:00.000Z",
    "estimated_time": "2 hours",
    "ai_enhanced": true,
    "created_at": "2025-07-04T..."
  }
]
\`\`\`

#### POST /api/tasks
Create a new task.

**Request Body:**
\`\`\`json
{
  "title": "Task title",
  "description": "Task description",
  "category": "Work",
  "priority": "medium",
  "deadline": "2025-07-10",
  "estimated_time": "1 hour"
}
\`\`\`

#### PATCH /api/tasks/:id
Update an existing task.

#### DELETE /api/tasks/:id
Delete a task.

### AI Enhancement Endpoints

#### POST /api/tasks/ai-enhance
Get AI-powered task suggestions.

**Request Body:**
\`\`\`json
{
  "title": "Prepare quarterly report",
  "description": "Financial summary needed",
  "category": "Work"
}
\`\`\`

**Response:**
\`\`\`json
{
  "enhancedDescription": "Complete quarterly financial report...",
  "suggestedCategory": "Work",
  "suggestedPriority": "high",
  "suggestedDeadline": "2025-07-15",
  "estimatedTime": "3 hours",
  "reasoning": "Based on your context..."
}
\`\`\`

#### POST /api/tasks/prioritize
Get AI-optimized task prioritization.

### Context Processing Endpoints

#### GET /api/context
Retrieve daily context entries.

#### POST /api/context/process
Process context with AI for task extraction.

**Request Body:**
\`\`\`json
{
  "entries": [
    {
      "content": "Email about project deadline...",
      "sourceType": "email"
    }
  ]
}
\`\`\`

#### GET /api/ai/suggestions
Get personalized AI suggestions.

### Categories Endpoints

#### GET /api/categories
Get task categories with usage statistics.

#### POST /api/categories
Create a new category.

## 🧪 Sample Data

### Sample Tasks
The application comes with pre-loaded sample tasks demonstrating AI features:

1. **High Priority**: "Complete project presentation" - AI-enhanced with context awareness
2. **Medium Priority**: "Buy groceries for the week" - Optimized based on preferences
3. **Low Priority**: "Read 'The Lean Startup' book" - Learning goal with time suggestions
4. **Completed**: "Schedule dentist appointment" - Health category example

### Sample Context Data for Testing

#### Email Context
\`\`\`
From: manager@company.com
Subject: Q1 Review Meeting

Hi Team,

We need to prepare our quarterly presentation for the board meeting this Friday. 
Please ensure all deliverables are ready and the financial summary is included.

Best regards,
Sarah
\`\`\`

#### Message Context
\`\`\`
WhatsApp - Family Group:
"Hey everyone! Planning a family dinner this Saturday. Can someone pick up groceries? 
We need ingredients for pasta and salad. Let me know who can help!"
\`\`\`

#### Notes Context
\`\`\`
Meeting Notes - Project Planning:
- Discussed new feature requirements
- Timeline: 2 weeks for implementation
- Need to schedule team reviews
- Action item: Create project roadmap by Monday
\`\`\`

### AI Suggestions Examples

The AI provides suggestions like:
- **Schedule Optimization**: "Block 2-3 hours tomorrow morning for presentation work when you're most productive"
- **Task Delegation**: "Consider delegating grocery shopping to family members this weekend"
- **Break Recommendations**: "Take a 15-minute break after completing each task section"

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Backend (Express.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o model
- **API Design**: RESTful APIs with Zod validation

### Database Schema
- **tasks**: Core task management with AI fields
- **context_entries**: Daily context processing
- **categories**: Dynamic categorization system

### AI Integration
- **Task Enhancement**: Context-aware improvements
- **Priority Scoring**: Intelligent ranking system
- **Context Processing**: Extract actionable insights
- **Smart Suggestions**: Personalized recommendations

## 🧬 Object-Oriented Implementation

### AI Service Class
\`\`\`typescript
export class AIService {
  async enhanceTask(taskData: TaskInput): Promise<AITaskSuggestion>
  async processContext(entries: ContextEntry[]): Promise<AIContextInsights>
  async prioritizeTasks(tasks: Task[], context: ContextEntry[]): Promise<Task[]>
  async generateSuggestions(tasks: Task[], context: ContextEntry[]): Promise<Suggestion[]>
}
\`\`\`

### Storage Interface
\`\`\`typescript
export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>
  createTask(task: InsertTask): Promise<Task>
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>
  deleteTask(id: number): Promise<void>
  
  // Context operations
  getContextEntries(): Promise<ContextEntry[]>
  createContextEntry(entry: InsertContextEntry): Promise<ContextEntry>
  
  // Category operations
  getCategories(): Promise<Category[]>
  createCategory(category: InsertCategory): Promise<Category>
}
\`\`\`

## 🛠️ Development

### Available Scripts
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run db:push\` - Push schema changes to database
- \`npm run db:generate\` - Generate migrations
- \`npm run check\` - TypeScript type checking

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Drizzle**: Type-safe database operations

## 🚀 Deployment

### Production Build
\`\`\`bash
npm run build
\`\`\`

### Environment Variables (Production)
\`\`\`env
NODE_ENV=production
DATABASE_URL=your-production-database-url
OPENAI_API_KEY=your-openai-api-key
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add some amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing powerful AI capabilities
- Supabase for reliable database hosting
- The open-source community for excellent tools and libraries

---

**Built with ❤️ by [Your Name]**

*Empowering productivity through intelligent task management*