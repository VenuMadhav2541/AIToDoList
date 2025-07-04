import { pgTable, text, integer, boolean, timestamp, serial, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  priority: text('priority').notNull(), // 'high', 'medium', 'low'
  priorityScore: integer('priority_score').default(0),
  status: text('status').notNull().default('pending'), // 'pending', 'completed'
  deadline: timestamp('deadline'),
  estimatedTime: text('estimated_time'),
  aiEnhanced: boolean('ai_enhanced').default(false),
  aiSuggestions: jsonb('ai_suggestions'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  priorityIdx: index('priority_idx').on(table.priority),
  statusIdx: index('status_idx').on(table.status),
}));

export const contextEntries = pgTable('context_entries', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  sourceType: text('source_type').notNull(), // 'email', 'message', 'note'
  processedInsights: jsonb('processed_insights'),
  extractedTasks: jsonb('extracted_tasks'),
  isProcessed: boolean('is_processed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sourceTypeIdx: index('source_type_idx').on(table.sourceType),
  processedIdx: index('processed_idx').on(table.isProcessed),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContextEntrySchema = createInsertSchema(contextEntries).omit({
  id: true,
  createdAt: true,
  processedInsights: true,
  extractedTasks: true,
  isProcessed: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

// Types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type ContextEntry = typeof contextEntries.$inferSelect;
export type InsertContextEntry = z.infer<typeof insertContextEntrySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// AI Types
export type AITaskSuggestion = {
  enhancedDescription: string;
  suggestedCategory: string;
  suggestedPriority: 'high' | 'medium' | 'low';
  suggestedDeadline: string;
  estimatedTime: string;
  reasoning: string;
};

export type AIContextInsights = {
  extractedTasks: Array<{
    title: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    urgency: number;
  }>;
  priorityUpdates: Array<{
    taskId: number;
    newPriority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  suggestions: Array<{
    type: 'schedule' | 'optimize' | 'delegate';
    message: string;
    actionable: boolean;
  }>;
};
