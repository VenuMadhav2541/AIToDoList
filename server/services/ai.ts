import OpenAI from 'openai';
import type { AITaskSuggestion, AIContextInsights, Task, ContextEntry } from '../../shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

Consider:
- Urgency based on context
- Task complexity
- Dependencies mentioned in context
- Deadlines mentioned in context
- User's workload patterns
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI task management assistant. Analyze tasks and provide intelligent enhancements based on context. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
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

Focus on:
- Extracting new tasks from emails, messages, and notes
- Identifying urgent matters that need immediate attention
- Suggesting schedule optimizations
- Recommending task prioritization changes
- Providing time management insights
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI context analysis assistant. Extract actionable task management insights from daily context. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
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

Please provide a JSON response with an array of task IDs ordered by priority (most urgent first):
{
  "prioritizedTaskIds": [1, 3, 2, 4],
  "reasoning": "Brief explanation of the prioritization logic"
}

Consider:
- Deadlines mentioned in context
- Business impact
- Dependencies
- User's schedule and commitments
- External pressures and requirements
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI task prioritization assistant. Analyze tasks and context to determine optimal priority order. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const prioritizedIds = result.prioritizedTaskIds || [];
      
      // Reorder tasks based on AI prioritization
      const prioritizedTasks = prioritizedIds
        .map((id: number) => tasks.find(t => t.id === id))
        .filter(Boolean);
      
      // Add any tasks that weren't included in the prioritization
      const remainingTasks = tasks.filter(t => !prioritizedIds.includes(t.id));
      
      return [...prioritizedTasks, ...remainingTasks];
    } catch (error) {
      console.error('AI prioritization error:', error);
      return tasks; // Return original order if AI fails
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

Please provide a JSON response with suggestions:
{
  "suggestions": [
    {
      "type": "schedule|optimize|delegate|break",
      "message": "Specific actionable suggestion",
      "actionable": true
    }
  ]
}

Focus on:
- Schedule optimization based on energy patterns
- Task batching opportunities
- Break recommendations for productivity
- Delegation opportunities
- Context-based insights
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI productivity assistant. Provide actionable suggestions for better task management. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.suggestions || [];
    } catch (error) {
      console.error('AI suggestions error:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
