"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { legalAssistantChatbot, LegalAssistantChatbotOutput } from '@/ai/flows/legal-assistant-chatbot';
import { Bot, User, Loader2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const formSchema = z.object({
  question: z.string().min(10, {
    message: "Please enter a question with at least 10 characters.",
  }),
});

type Message = {
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const AssistantResponse = ({ response }: { response: LegalAssistantChatbotOutput }) => (
    <div className="space-y-4">
      <p>{response.answer}</p>
      
      {response.relevantPracticeAreas && response.relevantPracticeAreas.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Relevant Practice Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {response.relevantPracticeAreas.map((area) => (
              <Badge key={area} variant="secondary">{area}</Badge>
            ))}
          </div>
        </div>
      )}

      {response.contactSuggestion && (
        <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
          <p className="text-sm">{response.contactSuggestion} <Link href="#contact" className="underline font-semibold hover:text-accent">Contact us today</Link>.</p>
        </div>
      )}
    </div>
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: values.question }]);
    form.reset();

    try {
      const response = await legalAssistantChatbot({ question: values.question });
      setMessages(prev => [...prev, { role: 'assistant', content: <AssistantResponse response={response} /> }]);
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not get a response from the AI assistant. Please try again later.",
      });
      // Remove the user's message if AI fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Bot className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                I am an AI assistant for Delfin Law. Ask me a general legal question to get started.
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />}
              <div
                className={cn(
                  "p-3 rounded-lg max-w-[85%]",
                  message.role === 'user'
                    ? 'bg-accent/80 text-accent-foreground'
                    : 'bg-muted/50'
                )}
              >
                {message.content}
              </div>
              {message.role === 'user' && <User className="h-6 w-6 text-accent flex-shrink-0 mt-1" />}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
               <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
               <div className="p-3 rounded-lg bg-muted/50">
                  <Loader2 className="h-5 w-5 animate-spin" />
               </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'What are the first steps in starting a business?'"
                    className="resize-none"
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
