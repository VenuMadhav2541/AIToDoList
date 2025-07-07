# 🧠 Smart Todo List with AI

A full-stack productivity app powered by AI — organize, enhance, and prioritize your tasks intelligently using context, deadlines, and smart suggestions.

Built with **React + Express + PostgreSQL + Tailwind CSS** and enhanced using **local LLM (LM Studio)** or **Gemini/OpenAI** APIs.

---

## 🌟 Features

### ✅ Core Functionality

* 📝 **Task Management** – Create, edit, delete, and organize tasks easily
* 🏷️ **Smart Categories** – AI auto-suggests categories
* ⚡ **Priority Management** – Assign or get AI-suggested priority levels
* 📅 **Deadline Tracking** – AI can suggest smart deadlines
* ✨ **AI Enhance** – Get improved task descriptions & time estimates
* 🔍 **Search Tasks** – Real-time fuzzy search by task title
* 🧮 **Filter & Sort** – Filter by priority/status and sort by deadline, category, etc.

### 🤖 AI-Powered Features

* 💬 **Context Processing** – Input messages, notes, emails to extract tasks
* 🧠 **AI Optimization** – Suggest schedule improvements, estimate effort
* 🎯 **Task Prioritization** – AI ranks tasks dynamically
* 🗒️ **Enhanced Task Details** – AI rewrites titles/descriptions contextually
* 📌 **Suggestions Panel** – Get daily tips (optimize, schedule, delegate, break)

### 📅 Calendar View

* 📆 **Visual Task Layout** – Tasks mapped across a monthly grid
* 🔁 Navigate by month (next/prev)
* 📌 Click tasks to view detailed popup
* ✅ Color-coded by priority & status
* 🔔 **Today Button** – Quick view of today’s tasks via bell icon

### 🌓 Dark Mode

* 🌙 Toggle light/dark mode from the top bar
* 🖤 All components themed using Tailwind + shadcn/ui

---

## 📷 Screenshots
All schreenshorts are avalable in the **Screenshorts_project** Folder. **Please consider them**.

## 🛠️ Tech Stack

| Layer     | Tech                                                                |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React + TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query |
| Backend   | Express.js, TypeScript, REST APIs, Zod validation                   |
| Database  | PostgreSQL + Drizzle ORM                                            |
| AI Engine | LM Studio (local), Gemini API (fallback), OpenAI API (optional)     |

---

## 🚀 Getting Started

### ⚙️ Prerequisites

* Node.js 20+
* PostgreSQL database (Supabase recommended)
* LM Studio (or Gemini/OpenAI API key)

### 🔧 Setup Instructions

```bash
git clone https://github.com/your-username/smart-todo-ai.git
cd smart-todo-ai
npm install
```

### 📦 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# AI config
LM_STUDIO_API=http://127.0.0.1:1234

# App
NODE_ENV=development
```

> 💡 **Note**: If LM Studio is not running locally, app can fall back in AI features.

---

### 🗃️ Database Setup

```bash
npx tsx setup-db.ts         # One-time init with dummy data
# OR
npm run db:push             # Push schema using Drizzle
```

---

### ▶️ Start the App

```bash
npm run dev    # Runs both backend and frontend
```

App is available at: **[http://localhost:5000](http://localhost:5000)**

---

## 📚 API Overview

### 🔹 Tasks

* `GET /api/tasks` – Get all tasks
* `POST /api/tasks` – Create task
* `PATCH /api/tasks/:id` – Update task
* `DELETE /api/tasks/:id` – Delete task
* `POST /api/tasks/ai-enhance` – AI-enhanced task details
* `POST /api/tasks/prioritize` – AI-powered task reordering

### 🔹 Context

* `GET /api/context` – Fetch all context entries
* `POST /api/context/process` – AI extracts tasks & suggestions

### 🔹 Suggestions

* `GET /api/ai/suggestions` – General productivity advice

---

## 🧪 Sample Context

### Email

```
From: manager@company.com
We need to prepare the Q3 report and schedule a team review next Monday.
```

### Notes

```
- Buy groceries for Saturday dinner
- Dentist check-up at 4 PM
```

---

## 🧬 Architecture

* `TaskList` handles all CRUD & AI badges
* `ContextPage` manages context input & AI extraction
* `CalendarPage` displays task deadline overview
* `aiService.ts` handles AI prompt + parsing
* `routes.ts` defines REST endpoints for all operations
* `storage.ts` handles all DB interaction using Drizzle

---

## 🔁 AI Engine Switch Logic

By default:

* Uses **LM Studio** (`http://127.0.0.1:1234`)


> You can configure this in `server/services/ai.ts`

---

## ✨ Highlights

✅ LM Studio + React full-stack
✅ Real-time search, sort, filter
✅ Calendar View + popup
✅ AI-enhanced descriptions
✅ Context → tasks using GPT
✅ Dark/light toggle
✅ Today’s task bell widget
✅ Fully TypeScript + typed DB

---

## 🤝 Contributing

```bash
git checkout -b feature/awesome-feature
git commit -m "Add awesome-feature"
git push origin feature/awesome-feature
```

PRs welcome! 🙌

---

## 📜 License

MIT © 2025 \Venu Madhav Bandarupalli

---

Let me know if you want:

* `.env.example`
* GitHub Actions for CI
* Dockerfile for deployment
* or GitHub Pages frontend-only deployment option.
