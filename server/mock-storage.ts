import type { Task, InsertTask, ContextEntry, InsertContextEntry, Category, InsertCategory } from '../shared/schema';
import type { IStorage } from './storage';

/**
 * Mock Storage Implementation for Development and Testing
 * 
 * This class provides a complete in-memory implementation of the storage interface
 * for demonstration purposes when the database is not available.
 * 
 * Features:
 * - Complete CRUD operations for tasks, context entries, and categories
 * - Sample data pre-loaded for demonstration
 * - AI-enhanced tasks with proper metadata
 * - Usage statistics tracking for categories
 */
export class MockStorage implements IStorage {
  private tasks: Task[] = [];
  private contextEntries: ContextEntry[] = [];
  private categories: Category[] = [];
  private nextTaskId = 1;
  private nextContextId = 1;
  private nextCategoryId = 1;

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize the storage with comprehensive sample data
   * that demonstrates all features of the application
   */
  private initializeSampleData() {
    // Initialize categories
    this.categories = [
      { id: 1, name: 'Work', color: 'blue', usageCount: 5, createdAt: new Date('2025-07-01') },
      { id: 2, name: 'Personal', color: 'green', usageCount: 3, createdAt: new Date('2025-07-01') },
      { id: 3, name: 'Learning', color: 'purple', usageCount: 2, createdAt: new Date('2025-07-01') },
      { id: 4, name: 'Health', color: 'red', usageCount: 1, createdAt: new Date('2025-07-01') },
      { id: 5, name: 'Shopping', color: 'orange', usageCount: 1, createdAt: new Date('2025-07-01') },
    ];
    this.nextCategoryId = 6;

    // Initialize sample tasks with AI enhancements
    this.tasks = [
      {
        id: 1,
        title: 'Complete project presentation',
        description: 'Based on your email context, this presentation for the Q1 review is crucial for the upcoming meeting on Friday. Include revenue metrics, project status, and Q2 planning overview.',
        category: 'Work',
        priority: 'high',
        priorityScore: 9,
        status: 'pending',
        deadline: new Date('2025-07-05'),
        estimatedTime: '2-3 hours',
        aiEnhanced: true,
        aiSuggestions: {
          reasoning: 'High priority due to board meeting deadline and manager emphasis',
          confidence: 0.95,
          suggestedActions: ['Block morning hours for focused work', 'Prepare backup slides']
        },
        tags: ['presentation', 'quarterly', 'urgent'],
        createdAt: new Date('2025-07-04T10:30:00'),
        updatedAt: new Date('2025-07-04T11:45:00')
      },
      {
        id: 2,
        title: 'Buy groceries for family dinner',
        description: 'Purchase pasta ingredients, Caesar salad components, and wine for Saturday family dinner. Shopping list optimized based on dietary preferences.',
        category: 'Personal',
        priority: 'medium',
        priorityScore: 5,
        status: 'pending',
        deadline: new Date('2025-07-05'),
        estimatedTime: '1 hour',
        aiEnhanced: true,
        aiSuggestions: {
          reasoning: 'Medium priority family obligation with flexible timing',
          confidence: 0.8,
          suggestedActions: ['Combine with other errands', 'Check store hours']
        },
        tags: ['family', 'groceries', 'weekend'],
        createdAt: new Date('2025-07-04T09:15:00'),
        updatedAt: new Date('2025-07-04T09:15:00')
      },
      {
        id: 3,
        title: 'Read "The Lean Startup" book',
        description: 'Continue reading progress for learning goals. Currently 30% complete. AI suggests reading 20 pages daily to finish within 2 weeks.',
        category: 'Learning',
        priority: 'low',
        priorityScore: 3,
        status: 'pending',
        deadline: new Date('2025-08-01'),
        estimatedTime: 'Flexible - 30 min daily',
        aiEnhanced: true,
        aiSuggestions: {
          reasoning: 'Learning goal with flexible timeline, good for filling gaps between high-priority tasks',
          confidence: 0.7,
          suggestedActions: ['Schedule consistent reading time', 'Take notes for better retention']
        },
        tags: ['reading', 'entrepreneurship', 'self-improvement'],
        createdAt: new Date('2025-07-03T14:20:00'),
        updatedAt: new Date('2025-07-04T08:30:00')
      },
      {
        id: 4,
        title: 'Schedule dentist appointment',
        description: 'Completed dental cleaning appointment at HealthCare Plus Dental. Great job staying on top of health maintenance!',
        category: 'Health',
        priority: 'medium',
        priorityScore: 4,
        status: 'completed',
        deadline: new Date('2025-07-04'),
        estimatedTime: '30 minutes',
        aiEnhanced: false,
        aiSuggestions: null,
        tags: ['health', 'appointment', 'routine'],
        createdAt: new Date('2025-07-02T11:00:00'),
        updatedAt: new Date('2025-07-04T14:00:00')
      },
      {
        id: 5,
        title: 'Create project roadmap',
        description: 'Develop detailed roadmap for new mobile app features based on team meeting discussions. Include timeline, resource allocation, and milestone definitions.',
        category: 'Work',
        priority: 'high',
        priorityScore: 8,
        status: 'pending',
        deadline: new Date('2025-07-07'),
        estimatedTime: '4-5 hours',
        aiEnhanced: true,
        aiSuggestions: {
          reasoning: 'Critical deliverable for team coordination and project success',
          confidence: 0.9,
          suggestedActions: ['Break into phases', 'Involve team leads in planning', 'Use project management tools']
        },
        tags: ['planning', 'mobile', 'team', 'roadmap'],
        createdAt: new Date('2025-07-04T15:30:00'),
        updatedAt: new Date('2025-07-04T15:30:00')
      }
    ];
    this.nextTaskId = 6;

    // Initialize sample context entries
    this.contextEntries = [
      {
        id: 1,
        content: 'Email from manager about quarterly review meeting. Need to prepare presentation by Friday with revenue metrics and project status.',
        sourceType: 'email',
        processedInsights: {
          urgency_level: 'high',
          extracted_deadlines: ['2025-07-05'],
          key_topics: ['presentation', 'quarterly review', 'revenue'],
          sentiment: 'urgent'
        },
        extractedTasks: [
          {
            title: 'Prepare quarterly presentation',
            description: 'Create comprehensive presentation for board meeting',
            category: 'Work',
            priority: 'high',
            urgency: 9
          }
        ],
        isProcessed: true,
        createdAt: new Date('2025-07-04T09:15:00')
      },
      {
        id: 2,
        content: 'WhatsApp message from family about weekend plans. Family dinner Saturday 6 PM, need groceries for pasta and salad.',
        sourceType: 'message',
        processedInsights: {
          urgency_level: 'medium',
          extracted_deadlines: ['2025-07-05'],
          key_topics: ['family dinner', 'groceries', 'weekend'],
          sentiment: 'positive'
        },
        extractedTasks: [
          {
            title: 'Buy groceries for family dinner',
            description: 'Purchase ingredients for pasta and salad',
            category: 'Personal',
            priority: 'medium',
            urgency: 5
          }
        ],
        isProcessed: true,
        createdAt: new Date('2025-07-04T11:30:00')
      },
      {
        id: 3,
        content: 'Meeting notes: Discussed new project requirements and timeline. Need to create roadmap by Monday and set up development environment.',
        sourceType: 'note',
        processedInsights: null,
        extractedTasks: null,
        isProcessed: false,
        createdAt: new Date('2025-07-04T16:45:00')
      }
    ];
    this.nextContextId = 4;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    // Sort by creation date, newest first
    return [...this.tasks].sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.tasks.find(task => task.id === id) || null;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.nextTaskId++,
      title: task.title,
      description: task.description || null,
      category: task.category,
      priority: task.priority,
      priorityScore: task.priorityScore || this.calculatePriorityScore(task.priority),
      status: task.status || 'pending',
      deadline: task.deadline || null,
      estimatedTime: task.estimatedTime || null,
      aiEnhanced: task.aiEnhanced || false,
      aiSuggestions: task.aiSuggestions || null,
      tags: task.tags || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.push(newTask);
    
    // Update category usage count
    if (task.category) {
      await this.updateCategoryUsage(task.category);
    }
    
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.tasks[taskIndex];
  }

  async deleteTask(id: number): Promise<void> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.tasks.splice(taskIndex, 1);
  }

  // Context operations
  async getContextEntries(): Promise<ContextEntry[]> {
    return [...this.contextEntries].sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createContextEntry(entry: InsertContextEntry): Promise<ContextEntry> {
    const newEntry: ContextEntry = {
      id: this.nextContextId++,
      ...entry,
      processedInsights: null,
      extractedTasks: null,
      isProcessed: false,
      createdAt: new Date()
    };

    this.contextEntries.push(newEntry);
    return newEntry;
  }

  async updateContextEntry(id: number, updates: Partial<ContextEntry>): Promise<ContextEntry> {
    const entryIndex = this.contextEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
      throw new Error(`Context entry with id ${id} not found`);
    }

    this.contextEntries[entryIndex] = {
      ...this.contextEntries[entryIndex],
      ...updates
    };

    return this.contextEntries[entryIndex];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => 
      (b.usageCount || 0) - (a.usageCount || 0)
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    // Check for duplicate names
    const existing = this.categories.find(cat => cat.name === category.name);
    if (existing) {
      throw new Error(`Category with name "${category.name}" already exists`);
    }

    const newCategory: Category = {
      id: this.nextCategoryId++,
      ...category,
      usageCount: 0,
      createdAt: new Date()
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategoryUsage(name: string): Promise<void> {
    const category = this.categories.find(cat => cat.name === name);
    if (category && category.usageCount !== null) {
      category.usageCount += 1;
    } else if (category && category.usageCount === null) {
      category.usageCount = 1;
    } else {
      // Create category if it doesn't exist
      await this.createCategory({ name, color: 'gray' });
    }
  }

  /**
   * Calculate priority score based on priority level
   * Used for AI-powered task ranking
   */
  private calculatePriorityScore(priority: string): number {
    switch (priority) {
      case 'high': return 7 + Math.floor(Math.random() * 3); // 7-9
      case 'medium': return 4 + Math.floor(Math.random() * 3); // 4-6
      case 'low': return 1 + Math.floor(Math.random() * 3); // 1-3
      default: return 5;
    }
  }

  /**
   * Get statistics about the current data
   * Useful for debugging and monitoring
   */
  getStats() {
    return {
      totalTasks: this.tasks.length,
      pendingTasks: this.tasks.filter(t => t.status === 'pending').length,
      completedTasks: this.tasks.filter(t => t.status === 'completed').length,
      aiEnhancedTasks: this.tasks.filter(t => t.aiEnhanced).length,
      totalContextEntries: this.contextEntries.length,
      processedContextEntries: this.contextEntries.filter(c => c.isProcessed).length,
      totalCategories: this.categories.length
    };
  }
}