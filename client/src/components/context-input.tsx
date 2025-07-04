import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, MessageSquare, StickyNote, Upload, Mic, Sparkles } from 'lucide-react';

interface ContextInput {
  email: string;
  messages: string;
  notes: string;
}

export default function ContextInput() {
  const [contextInput, setContextInput] = useState<ContextInput>({
    email: '',
    messages: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processContextMutation = useMutation({
    mutationFn: async (entries: any[]) => {
      const response = await fetch('/api/context/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process context');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Context Processed Successfully",
        description: `AI identified ${data.extractedTasks?.length || 0} new tasks and ${data.suggestions?.length || 0} suggestions.`,
      });
      
      // Clear form
      setContextInput({
        email: '',
        messages: '',
        notes: ''
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/context'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: "Failed to process context with AI. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    const entries = [];
    
    if (contextInput.email.trim()) {
      entries.push({
        content: contextInput.email,
        sourceType: 'email'
      });
    }
    
    if (contextInput.messages.trim()) {
      entries.push({
        content: contextInput.messages,
        sourceType: 'message'
      });
    }
    
    if (contextInput.notes.trim()) {
      entries.push({
        content: contextInput.notes,
        sourceType: 'note'
      });
    }
    
    if (entries.length === 0) {
      toast({
        title: "No Content",
        description: "Please add some context content before processing.",
        variant: "destructive",
      });
      return;
    }
    
    processContextMutation.mutate(entries);
  };

  const handleInputChange = (field: keyof ContextInput, value: string) => {
    setContextInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Daily Context Input</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Brain className="w-4 h-4" />
            <span>AI Context Analysis</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900 dark:text-blue-200">Email Context</h3>
            </div>
            <Textarea
              placeholder="Paste important emails or summaries..."
              value={contextInput.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-32 resize-none border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900 dark:text-green-200">Messages</h3>
            </div>
            <Textarea
              placeholder="WhatsApp, Slack, or other messages..."
              value={contextInput.messages}
              onChange={(e) => handleInputChange('messages', e.target.value)}
              className="h-32 resize-none border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <StickyNote className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900 dark:text-purple-200">Notes</h3>
            </div>
            <Textarea
              placeholder="Meeting notes, ideas, reminders..."
              value={contextInput.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="h-32 resize-none border-purple-200 dark:border-purple-800 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button variant="outline" size="sm">
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={processContextMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processContextMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Process with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
