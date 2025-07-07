import { Router } from 'express';
import { z, ZodError } from 'zod';
import { storageManager } from './storage-manager';
import { aiService } from './services/ai';
import { insertTaskSchema, insertContextEntrySchema, insertCategorySchema } from '../shared/schema';
import { date } from 'drizzle-orm/mysql-core';


const router = Router();

// Validation middleware
const validateBody = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues,
      });
    }
    console.error("Unexpected error in validateBody:", error);
    res.status(500).json({ error: 'An unexpected validation error occurred' });
  }
};

// Health check endpoint with storage info
router.get('/api/health', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const storageInfo = storageManager.getStorageInfo();
    res.json({
      status: 'healthy',
      storage: storageInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Storage initialization failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Task routes
router.get('/api/tasks', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const tasks = await storage.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/api/tasks/:id', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const id = parseInt(req.params.id);
    const task = await storage.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/api/tasks', validateBody(insertTaskSchema), async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const task = await storage.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/api/tasks/:id', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const id = parseInt(req.params.id);
    const updates = req.body;
    const x = new Date(req.body.deadline)
    updates.deadline = x;
    const task = await storage.updateTask(id, updates);
    res.json(task);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    console.log(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/api/tasks/:id', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// AI-powered task creation
router.post('/api/tasks/ai-enhance', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const storage = await storageManager.getStorage();
    const contextEntries = await storage.getContextEntries();
    const recentContext = contextEntries.slice(0, 5);

    const aiSuggestion = await aiService.enhanceTask({
      title,
      description,
      category,
      contextEntries: recentContext,
    });

    res.json(aiSuggestion);
  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance task with AI' });
  }
});

// Context routes
router.get('/api/context', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const entries = await storage.getContextEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch context entries' });
  }
});

router.post('/api/context', validateBody(insertContextEntrySchema), async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const entry = await storage.createContextEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create context entry' });
  }
});

// AI context processing
router.post('/api/context/process', async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries array is required' });
    }

    const storage = await storageManager.getStorage();

    // 1. Store the submitted context entries
    const contextEntries = await Promise.all(
      entries.map((entry: any) => storage.createContextEntry(entry))
    );

    // 2. Send to AI service to extract insights
    const insights = await aiService.processContext(contextEntries);

    // 3. Update the context entries with AI insights
    await Promise.all(
      contextEntries.map(entry =>
        storage.updateContextEntry(entry.id, {
          processedInsights: insights,
          extractedTasks: insights.extractedTasks,
          isProcessed: true,
        })
      )
    );

    // ✅ 4. Create new tasks from extractedTasks with aiEnhanced flag
    if (insights.extractedTasks && insights.extractedTasks.length > 0) {
      await Promise.all(
        insights.extractedTasks.map(task =>
          storage.createTask({
            ...task,
            status: 'pending',
            aiEnhanced: true,
          })
        )
      );
    }

    // 5. Return the insights
    res.json(insights);
  } catch (error) {
    console.error('Context processing error:', error);
    res.status(500).json({ error: 'Failed to process context with AI' });
  }
});


// Task prioritization
router.post('/api/tasks/prioritize', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const tasks = await storage.getTasks();
    const contextEntries = await storage.getContextEntries();
    const recentContext = contextEntries.slice(0, 10);

    const prioritizedTasks = await aiService.prioritizeTasks(tasks, recentContext);
    res.json(prioritizedTasks);
  } catch (error) {
    console.error('Task prioritization error:', error);
    res.status(500).json({ error: 'Failed to prioritize tasks' });
  }
});

// AI suggestions
router.get('/api/ai/suggestions', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const tasks = await storage.getTasks();
    const contextEntries = await storage.getContextEntries();
    const recentContext = contextEntries.slice(0, 5);

    const suggestions = await aiService.generateSuggestions(tasks, recentContext);
    res.json(suggestions);
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.json([]);
  }
});

// Category routes
router.get('/api/categories', async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/api/categories', validateBody(insertCategorySchema), async (req, res) => {
  try {
    const storage = await storageManager.getStorage();
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;