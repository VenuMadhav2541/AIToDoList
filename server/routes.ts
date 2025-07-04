import { Router } from 'express';
import { z } from 'zod';
import { MockStorage } from './mock-storage';
import { aiService } from './services/ai';
import { insertTaskSchema, insertContextEntrySchema, insertCategorySchema } from '../shared/schema';

// Use mock storage for demonstration while database connection is being set up
const storage = new MockStorage();

const router = Router();

// Validation middleware
const validateBody = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body', details: error });
  }
};

// Task routes
router.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await storage.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/api/tasks/:id', async (req, res) => {
  try {
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
    const task = await storage.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/api/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const task = await storage.updateTask(id, updates);
    res.json(task);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/api/tasks/:id', async (req, res) => {
  try {
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

    // Get recent context for AI enhancement
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
    const entries = await storage.getContextEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch context entries' });
  }
});

router.post('/api/context', validateBody(insertContextEntrySchema), async (req, res) => {
  try {
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

    // Create context entries
    const contextEntries = await Promise.all(
      entries.map((entry: any) => storage.createContextEntry(entry))
    );

    // Process with AI
    const insights = await aiService.processContext(contextEntries);

    // Update context entries with processed insights
    await Promise.all(
      contextEntries.map(entry => 
        storage.updateContextEntry(entry.id, {
          processedInsights: insights,
          extractedTasks: insights.extractedTasks,
          isProcessed: true,
        })
      )
    );

    res.json(insights);
  } catch (error) {
    console.error('Context processing error:', error);
    res.status(500).json({ error: 'Failed to process context with AI' });
  }
});

// Task prioritization
router.post('/api/tasks/prioritize', async (req, res) => {
  try {
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
    const tasks = await storage.getTasks();
    const contextEntries = await storage.getContextEntries();
    const recentContext = contextEntries.slice(0, 5);

    const suggestions = await aiService.generateSuggestions(tasks, recentContext);
    res.json(suggestions);
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate AI suggestions' });
  }
});

// Category routes
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/api/categories', validateBody(insertCategorySchema), async (req, res) => {
  try {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
