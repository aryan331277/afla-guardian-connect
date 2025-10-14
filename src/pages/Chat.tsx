import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Message = { role: 'user' | 'assistant'; content: string };

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI farming assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isRecording, isProcessing, startRecording, stopRecording, speakText } = useVoiceChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agricultural-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }],
          language 
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: 'Rate Limit',
            description: 'Too many requests. Please wait a moment.',
            variant: 'destructive',
          });
          return;
        }
        if (resp.status === 402) {
          toast({
            title: 'Service Unavailable',
            description: 'AI service requires payment. Please contact support.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error('Failed to start stream');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantMessage = '';

      // Add empty assistant message to start streaming into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      const transcript = await stopRecording(language);
      if (transcript) {
        setMessage(transcript);
      }
    } else {
      await startRecording();
    }
  };

  const handleSpeak = (text: string) => {
    speakText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col">
      <div className="flex items-center gap-4 p-4 bg-card border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-primary">AI Agricultural Assistant</h1>
        
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-32 ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="sw">Swahili</SelectItem>
            <SelectItem value="ki">Kikuyu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <Card 
            key={index} 
            className={`animate-fade-in ${msg.role === 'assistant' ? 'bg-primary/5' : 'bg-accent/5 ml-8'}`} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {msg.role === 'assistant' && (
                  <>
                    <Bot className="w-4 h-4 mt-1 text-primary animate-float" />
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.content && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSpeak(msg.content)}
                        className="ml-2"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                {msg.role === 'user' && <p className="text-sm">{msg.content}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {isLoading && (
          <Card className="bg-primary/5 animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </CardContent>
          </Card>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-card border-t space-y-2">
        {isProcessing && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing voice...
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceInput}
            disabled={isProcessing || isLoading}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about farming, aflatoxin, or crop management..."
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;