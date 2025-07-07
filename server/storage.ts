import { db } from './db';
import { tasks, contextEntries, categories } from '../shared/schema';
import type { Task, InsertTask, ContextEntry, InsertContextEntry, Category, InsertCategory } from '../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | null>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Context operations
  getContextEntries(): Promise<ContextEntry[]>;
  createContextEntry(entry: InsertContextEntry): Promise<ContextEntry>;
  updateContextEntry(id: number, updates: Partial<ContextEntry>): Promise<ContextEntry>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategoryUsage(name: string): Promise<void>;
}

export class Storage implements IStorage {
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: number): Promise<Task | null> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0] || null;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values({
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // Update category usage count
    if (task.category) {
      await this.updateCategoryUsage(task.category);
    }
    
    return result[0];
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const result = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteTask(id: number): Promise<void> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (result.length === 0) {
      throw new Error(`Task with id ${id} not found`);
    }
  }

  async getContextEntries(): Promise<ContextEntry[]> {
    return await db.select().from(contextEntries).orderBy(desc(contextEntries.createdAt));
  }

  async createContextEntry(entry: InsertContextEntry): Promise<ContextEntry> {
    const result = await db.insert(contextEntries).values(entry).returning();
    return result[0];
  }

  async updateContextEntry(id: number, updates: Partial<ContextEntry>): Promise<ContextEntry> {
    const result = await db
      .update(contextEntries)
      .set(updates)
      .where(eq(contextEntries.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Context entry with id ${id} not found`);
    }
    
    return result[0];
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(desc(categories.usageCount));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategoryUsage(name: string): Promise<void> {
    await db
      .update(categories)
      .set({
        usageCount: sql`${categories.usageCount} + 1`,
      })
      .where(eq(categories.name, name));
  }
}

export const storage = new Storage();
