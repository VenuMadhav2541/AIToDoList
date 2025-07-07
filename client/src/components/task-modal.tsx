// task-modal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Lightbulb } from 'lucide-react';

// taskFormSchema remains z.string().optional() because HTML input[type=date] returns string
const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['high', 'medium', 'low']),
  deadline: z.string().optional(), 
  estimatedTime: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface Task {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  deadline?: Date | ''; // Changed from string to Date | ''
  estimatedTime?: string;
  aiEnhanced?: boolean;
}

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const defaultCategories = [
  { name: 'Work', color: 'blue' },
  { name: 'Personal', color: 'green' },
  { name: 'Learning', 'color': 'purple' },
  { name: 'Health', 'color': 'red' },
  { name: 'Shopping', 'color': 'orange' },
];

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      // Format the existing deadline for the date input field
      deadline: task.deadline instanceof Date
        ? task.deadline.toISOString().split('T')[0]
        : '', // If it's a Date object, format it for input type="date". Otherwise, it's an empty string.
      estimatedTime: task.estimatedTime || '',
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', details: null }));
        throw new Error(errorData.error || 'Failed to update task', { cause: errorData.details });
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onClose();
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}. Details: ${JSON.stringify(error.cause)}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    const dataToSend: { [key: string]: any } = { ...data };

    // Convert deadline string from form input to a Date object or undefined for backend
    if (dataToSend.deadline === '') {
      dataToSend.deadline = undefined; // Send undefined if no deadline
    } else {
      const parsedDate = new Date(dataToSend.deadline);
      if (!isNaN(parsedDate.getTime())) {
        dataToSend.deadline = parsedDate; // Send as Date object (JSON.stringify will convert to ISO string)
      } else {
        dataToSend.deadline = undefined; // Invalid date string
      }
    }

    console.log("\n\n\nData being sent to backend (from TaskModal):", JSON.stringify(dataToSend, null, 2));

    updateTaskMutation.mutate(dataToSend as TaskFormData);
  };

  const formatDateForDisplay = (dateValue: Date | string) => { // Updated to accept Date or string
    if (dateValue === '') {
      return 'N/A'; // Or handle as desired for no deadline
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultCategories.map((category) => (
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
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* AI Suggestion Card */}
            {task.aiEnhanced && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">AI Suggestion</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Based on your schedule and context, I recommend completing this task
                      {task.deadline && ` by ${formatDateForDisplay(task.deadline)}`}
                      {task.priority === 'high' && ' as soon as possible due to its high priority'}
                      {task.priority === 'medium' && ' during your next available time slot'}
                      {task.priority === 'low' && ' when you have some free time'}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateTaskMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateTaskMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}