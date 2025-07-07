import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '../../../shared/schema';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Sparkles, Lightbulb } from 'lucide-react';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['high', 'medium', 'low']),
  deadline: z.string().optional(), // Frontend schema still expects string from input[type=date]
  estimatedTime: z.string().optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const defaultCategories = [
  { name: 'Work', color: 'blue' },
  { name: 'Personal', color: 'green' },
  { name: 'Learning', color: 'purple' },
  { name: 'Health', color: 'red' },
  { name: 'Shopping', color: 'orange' },
];

export default function TaskForm() {
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      deadline: '',
      estimatedTime: '',
      status: 'pending',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', details: null }));
        throw new Error(errorData.error || 'Failed to create task', { cause: errorData.details });
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Task Created',
        description: 'Your task has been created successfully.',
      });
      form.reset();
      setAiSuggestion(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast({
        title: 'Error',
        description: `Failed to create task: ${error.message}. Details: ${JSON.stringify(error.cause)}`,
        variant: 'destructive',
      });
    },
  });

  const enhanceTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; category?: string }) => {
      const response = await fetch('/api/tasks/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance task');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestion(data);
      toast({
        title: 'AI Enhancement Complete',
        description: 'Task has been enhanced with AI suggestions.',
      });
    },
    onError: () => {
      toast({
        title: 'Enhancement Failed',
        description: 'Failed to enhance task with AI. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAiEnhance = () => {
    const title = form.getValues('title');
    const description = form.getValues('description');
    const category = form.getValues('category');

    if (!title) {
      toast({
        title: 'Title Required',
        description: 'Please enter a task title first.',
        variant: 'destructive',
      });
      return;
    }

    setIsEnhancing(true);
    enhanceTaskMutation.mutate({ title, description, category });
    setIsEnhancing(false);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      form.setValue('description', aiSuggestion.enhancedDescription);
      form.setValue('category', aiSuggestion.suggestedCategory);
      form.setValue('priority', aiSuggestion.suggestedPriority);
      form.setValue('estimatedTime', aiSuggestion.estimatedTime);

      if (aiSuggestion.suggestedDeadline) {
        const deadlineDate = new Date(aiSuggestion.suggestedDeadline);
        if (!isNaN(deadlineDate.getTime())) {
          // Keep this as YYYY-MM-DD for the HTML input type="date" field display
          form.setValue('deadline', deadlineDate.toISOString().split('T')[0]);
        }
      }
    }
  };

  const onSubmit = (data: TaskFormData) => {
    const dataToSend: { [key: string]: any } = { ...data };

    // Simply ensure empty string becomes undefined for optional fields
    if (dataToSend.deadline === '') {
      dataToSend.deadline = undefined;
    }
    // No need for toISOString() here, z.coerce.date() on backend will handle it.

    // Log the dataToSend object as a string for reliable output
    console.log("\n\n\nData being sent to backend (from TaskForm):", JSON.stringify(dataToSend, null, 2));

    createTaskMutation.mutate(dataToSend as TaskFormData);
  };

  const availableCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="What needs to be done?" className="pr-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleAiEnhance}
              disabled={isEnhancing || enhanceTaskMutation.isPending}
            >
              {isEnhancing || enhanceTaskMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600" />
              )}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Add description..." className="min-h-[60px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[120px]">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category: any) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[120px]">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[120px]">
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Task with AI
              </>
            )}
          </Button>
        </form>
      </Form>

      {aiSuggestion && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-200">AI Suggestion</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {aiSuggestion.reasoning}
                </p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <strong>Category:</strong> {aiSuggestion.suggestedCategory} •
                  <strong> Priority:</strong> {aiSuggestion.suggestedPriority} •
                  <strong> Time:</strong> {aiSuggestion.estimatedTime}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={applyAiSuggestion}
                >
                  Apply Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}