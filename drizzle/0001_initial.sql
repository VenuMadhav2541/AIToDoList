-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"priority" text NOT NULL,
	"priority_score" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"deadline" timestamp,
	"estimated_time" text,
	"ai_enhanced" boolean DEFAULT false,
	"ai_suggestions" jsonb,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create context_entries table
CREATE TABLE IF NOT EXISTS "context_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"source_type" text NOT NULL,
	"processed_insights" jsonb,
	"extracted_tasks" jsonb,
	"is_processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "category_idx" ON "tasks" ("category");
CREATE INDEX IF NOT EXISTS "priority_idx" ON "tasks" ("priority");
CREATE INDEX IF NOT EXISTS "status_idx" ON "tasks" ("status");
CREATE INDEX IF NOT EXISTS "source_type_idx" ON "context_entries" ("source_type");
CREATE INDEX IF NOT EXISTS "processed_idx" ON "context_entries" ("is_processed");

-- Insert default categories
INSERT INTO "categories" ("name", "color") VALUES
('Work', 'blue'),
('Personal', 'green'),
('Learning', 'purple'),
('Health', 'red'),
('Shopping', 'orange')
ON CONFLICT ("name") DO NOTHING;

-- Insert sample tasks for demonstration
INSERT INTO "tasks" ("title", "description", "category", "priority", "priority_score", "status", "deadline", "estimated_time", "ai_enhanced") VALUES
('Complete project presentation', 'Based on your email context, this presentation for the Q1 review is crucial for the upcoming meeting on Friday.', 'Work', 'high', 9, 'pending', '2025-07-05', '2 hours', true),
('Buy groceries for the week', 'Your shopping list has been optimized based on your recent preferences and dietary requirements.', 'Personal', 'medium', 5, 'pending', '2025-07-06', '1 hour', true),
('Read "The Lean Startup" book', 'Perfect for your learning goals. AI suggests reading 20 pages daily to complete in 2 weeks.', 'Learning', 'low', 3, 'pending', '2025-08-01', 'Flexible', true),
('Schedule dentist appointment', 'Completed 2 hours ago. Great job staying on top of your health!', 'Health', 'medium', 4, 'completed', '2025-07-04', '30 minutes', false);

-- Insert sample context entries for demonstration
INSERT INTO "context_entries" ("content", "source_type", "is_processed") VALUES
('Email from manager about quarterly review meeting. Need to prepare presentation by Friday.', 'email', true),
('WhatsApp message from family about weekend plans. Should buy groceries before Saturday.', 'message', true),
('Meeting notes: Discussed new project requirements and timeline. Action items noted.', 'note', false);
