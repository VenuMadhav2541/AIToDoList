import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Mail,
  MessageSquare,
  StickyNote,
  Upload,
  Mic,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  type ContextEntry as DBContextEntry,
  type AIContextInsights,
} from '@shared/schema';


type FrontendContextEntry = Omit<
  DBContextEntry,
  'processedInsights' | 'extractedTasks'
> & {
  processedInsights?: AIContextInsights | null;
  extractedTasks?: AIContextInsights['extractedTasks'] | null;
};

interface ContextInput {
  email: string;
  messages: string;
  notes: string;
}


export default function ContextPage() {
  const [contextInput, setContextInput] = useState<ContextInput>({
    email: '',
    messages: '',
    notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result?.toString() ?? '';
    setContextInput((prev) => ({
      ...prev,
      notes: prev.notes + '\n\n' + text,
    }));
    toast({ title: "File uploaded", description: `Content added to notes.` });
  };
  reader.readAsText(file);
};

const handleVoiceInput = async () => {
  try {
    if (isRecording) {
      // Stop logic handled by event listener
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      // OPTIONAL: Upload to your own /api/transcribe or use a third-party STT API
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { text } = await response.json();
        setContextInput((prev) => ({
          ...prev,
          notes: prev.notes + '\n\n' + text,
        }));
        toast({ title: "Voice Transcribed", description: "Audio converted to text and added to notes." });
      } else {
        toast({ title: "Transcription failed", description: "Could not process audio.", variant: "destructive" });
      }
    };

    mediaRecorder.start();
    toast({ title: "Recording...", description: "Recording started. Click again to stop." });
    setIsRecording(true);

    setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
    }, 5000); // Stop after 5 seconds
  } catch (err) {
    toast({ title: "Microphone error", description: "Permission denied or device error.", variant: "destructive" });
  }
};


  const {
    data: contextHistory = [],
    isLoading,
  } = useQuery<FrontendContextEntry[]>({
    queryKey: ['/api/context'],
  });

 
  const processContextMutation = useMutation({
    mutationFn: async (entries: { content: string; sourceType: string }[]) => {
      const response = await fetch('/api/context/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      if (!response.ok) throw new Error('Failed to process context');
      return response.json() as {
        extractedTasks?: AIContextInsights['extractedTasks'];
        suggestions?: AIContextInsights['suggestions'];
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Context processed',
        description: `AI identified ${data.extractedTasks?.length ?? 0} task(s) and ${data.suggestions?.length ?? 0} suggestion(s).`,
      });
      setContextInput({ email: '', messages: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/context'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
    },
    onError: (e) =>
      toast({
        title: 'Processing failed',
        description:
          e instanceof Error ? e.message : 'Unknown error occurred.',
        variant: 'destructive',
      }),
  });


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = (Date.now() - date.getTime()) / 36e5;
    if (diffHours >= 24) return `${Math.floor(diffHours / 24)} day(s) ago`;
    if (diffHours >= 1) return `${Math.floor(diffHours)} hour(s) ago`;
    return 'Just now';
  };

  const handleInput = (k: keyof ContextInput) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setContextInput((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = () => {
    const entries = [
      contextInput.email && { content: contextInput.email, sourceType: 'email' },
      contextInput.messages && {
        content: contextInput.messages,
        sourceType: 'message',
      },
      contextInput.notes && { content: contextInput.notes, sourceType: 'note' },
    ].filter(Boolean) as { content: string; sourceType: string }[];

    if (!entries.length)
      return toast({
        title: 'No content',
        description: 'Please add some context before processing.',
        variant: 'destructive',
      });

    processContextMutation.mutate(entries);
  };

  return (
    <div className="space-y-6">
      {/* Input card */}
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
          {/* 3‑column inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Email */}
            <InputColumn
              color="blue"
              icon={Mail}
              title="Email Context"
              value={contextInput.email}
              onChange={handleInput('email')}
              placeholder="Paste important emails or summaries…"
            />
            {/* Messages */}
            <InputColumn
              color="green"
              icon={MessageSquare}
              title="Messages"
              value={contextInput.messages}
              onChange={handleInput('messages')}
              placeholder="WhatsApp, Slack, or other messages…"
            />
            {/* Notes */}
            <InputColumn
              color="purple"
              icon={StickyNote}
              title="Notes"
              value={contextInput.notes}
              onChange={handleInput('notes')}
              placeholder="Meeting notes, ideas, reminders…"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-y-2">
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </span>
                </Button>
              </label>

              <Button variant="outline" size="sm" onClick={handleVoiceInput}>
                <Mic className="w-4 h-4 mr-2" />
                {isRecording ? 'Recording...' : 'Voice Input'}
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={processContextMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto mt-4 sm:mt-0"
            >
              {processContextMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing…
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

      {/* History card */}
      <Card>
        <CardHeader>
          <CardTitle>Context History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader />
          ) : contextHistory.length === 0 ? (
            <EmptyState />
          ) : (
            <HistoryList entries={contextHistory} timeAgo={formatTimeAgo} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * ──────────────────────────────────────────────────────────────
 * Reusable sub‑components
 * ──────────────────────────────────────────────────────────────
 */
const Loader = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
    <p>No context entries yet. Add your first context above to get started!</p>
  </div>
);

function InputColumn({
  color,
  icon: Icon,
  title,
  value,
  onChange,
  placeholder,
}: {
  color: 'blue' | 'green' | 'purple';
  icon: typeof Mail;
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  const base = {
    blue: ['blue-50', 'blue-900/20', 'blue-600', 'blue-200', 'blue-800'],
    green: ['green-50', 'green-900/20', 'green-600', 'green-200', 'green-800'],
    purple: ['purple-50', 'purple-900/20', 'purple-600', 'purple-200', 'purple-800'],
  }[color];

  return (
    <div className={`bg-${base[0]} dark:bg-${base[1]} p-4 rounded-lg`}>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-5 h-5 text-${base[2]}`} />
        <h3 className={`font-medium text-${base[2]} dark:text-${base[2]}-200`}>{title}</h3>
      </div>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-32 resize-none border-${base[3]} dark:border-${base[4]}
                   focus:ring-${color}-500 focus:border-${color}-500`}
      />
    </div>
  );
}

function HistoryList({
  entries,
  timeAgo,
}: {
  entries: FrontendContextEntry[];
  timeAgo: (d: string) => string;
}) {
  return (
    <div className="space-y-4">
      {entries.map((e) => (
        <div
          key={e.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {timeAgo(e.createdAt?.toString() || new Date().toISOString())}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                e.isProcessed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {e.isProcessed ? 'Processed' : 'Pending'}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {e.content}
          </p>
          {e.isProcessed && e.extractedTasks?.length ? (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              AI identified {e.extractedTasks.length} task
              {e.extractedTasks.length > 1 && 's'} and updated priorities.
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
