import OpenAI from 'openai';
import type { AITaskSuggestion, AIContextInsights, Task, ContextEntry } from '../../shared/schema';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'lm-studio',
  baseURL: process.env.LM_STUDIO_API || 'http://127.0.0.1:1234/v1',
});

function sanitizeJSON(raw: string): string {
  try {
    // Remove code blocks like ```json ... ```
    raw = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    return raw.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
  } catch (e) {
    return raw;
  }
}

export class AIService {
  async enhanceTask(taskData: {
    title: string;
    description?: string;
    category?: string;
    contextEntries?: ContextEntry[];
  }): Promise<AITaskSuggestion> {
    const contextText = taskData.contextEntries?.map(c => c.content).join('\n\n') || '';

    const prompt = `
Analyze this task and provide AI-powered enhancements based on the context provided.

Task Details:
- Title: ${taskData.title}
- Description: ${taskData.description || 'No description provided'}
- Category: ${taskData.category || 'Not specified'}

Context Information:
${contextText}

Please provide a JSON response with the following structure:
{
  "enhancedDescription": "Enhanced task description with context-aware details",
  "suggestedCategory": "Most appropriate category",
  "suggestedPriority": "high|medium|low",
  "suggestedDeadline": "YYYY-MM-DD format or relative time",
  "estimatedTime": "Time estimate with unit",
  "reasoning": "Brief explanation of the suggestions"
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct-v0.3',
        messages: [
          {
            role: 'user',
            content: `You are an AI task management assistant. Always respond with valid JSON.\n\n${prompt}`,
          },
        ],
        temperature: 0.7,
      });

      const raw = sanitizeJSON(response.choices[0].message.content || '{}');
      const result = JSON.parse(raw);
      return result as AITaskSuggestion;
    } catch (error) {
      console.error('AI enhancement error:', error);
      throw new Error('Failed to enhance task with AI');
    }
  }

  async processContext(contextEntries: ContextEntry[]): Promise<AIContextInsights> {
    const contextText = contextEntries.map(entry =>
      `[${entry.sourceType.toUpperCase()}] ${entry.content}`
    ).join('\n\n');

    const prompt = `
Analyze the following daily context and extract actionable insights for task management.

Context Data:
${contextText}

Please provide a JSON response with the following structure:
{
  "extractedTasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "category": "Suggested category",
      "priority": "high|medium|low",
      "urgency": 1-10
    }
  ],
  "priorityUpdates": [
    {
      "taskId": 0,
      "newPriority": "high|medium|low",
      "reasoning": "Why priority should change"
    }
  ],
  "suggestions": [
    {
      "type": "schedule|optimize|delegate",
      "message": "Actionable suggestion",
      "actionable": true
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct-v0.3',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const raw = sanitizeJSON(response.choices[0].message.content || '{}');
      const result = JSON.parse(raw);
      return result as AIContextInsights;
    } catch (error) {
      console.error('AI context processing error:', error);
      throw new Error('Failed to process context with AI');
    }
  }

  async prioritizeTasks(tasks: Task[], contextEntries: ContextEntry[]): Promise<Task[]> {
    const contextText = contextEntries.map(c => c.content).join('\n\n');
    const tasksText = tasks.map(t =>
      `ID: ${t.id}, Title: ${t.title}, Category: ${t.category}, Current Priority: ${t.priority}`
    ).join('\n');

    const prompt = `
Analyze these tasks and reorder them by priority based on the provided context.

Current Tasks:
${tasksText}

Context:
${contextText}

Please provide a JSON response:
{
  "prioritizedTaskIds": [1, 3, 2, 4],
  "reasoning": "Brief explanation of the prioritization logic"
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct-v0.3',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const raw = sanitizeJSON(response.choices[0].message.content || '{}');
      const result = JSON.parse(raw);
      const prioritizedIds = result.prioritizedTaskIds || [];

      const prioritizedTasks = prioritizedIds
        .map((id: number) => tasks.find(t => t.id === id))
        .filter(Boolean) as Task[];

      const remainingTasks = tasks.filter(t => !prioritizedIds.includes(t.id));
      return [...prioritizedTasks, ...remainingTasks];
    } catch (error) {
      console.error('AI prioritization error:', error);
      return tasks;
    }
  }

  async generateSuggestions(tasks: Task[], contextEntries: ContextEntry[]): Promise<Array<{
    type: 'schedule' | 'optimize' | 'delegate' | 'break';
    message: string;
    actionable: boolean;
  }>> {
    const contextText = contextEntries.slice(0, 5).map(c => c.content).join('\n\n');
    const tasksText = tasks.slice(0, 10).map(t =>
      `${t.title} (${t.priority} priority, ${t.category})`
    ).join('\n');

    const prompt = `
Based on the user's current tasks and recent context, provide 3-5 actionable suggestions for better task management.

Current Tasks:
${tasksText}

Recent Context:
${contextText}

Please provide a JSON response:
{
  "suggestions": [
    {
      "type": "schedule|optimize|delegate|break",
      "message": "Specific actionable suggestion",
      "actionable": true
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct-v0.3',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
      });

      const raw = sanitizeJSON(response.choices[0].message.content || '{}');
      const result = JSON.parse(raw);
      return result.suggestions || [];
    } catch (error) {
      console.error('AI suggestions error:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
