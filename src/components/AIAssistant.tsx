import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ttsService } from '@/lib/tts';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  MessageCircle, 
  Sparkles,
  Volume2,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI agricultural assistant. I can help you with farming advice, crop management, pest control, and weather planning. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What's the best time to plant maize?",
    "How do I prevent aflatoxin contamination?",
    "What fertilizer should I use?",
    "How to identify pest damage?"
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response - In production, this would call OpenAI or similar
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responses = [
        "Based on your question about maize planting, the optimal time is usually at the beginning of the rainy season. For Kenya, this is typically March-May for long rains and October-December for short rains.",
        "To prevent aflatoxin contamination: 1) Ensure proper drying (moisture below 14%), 2) Store in clean, dry conditions, 3) Use aflatoxin-resistant varieties, 4) Avoid physical damage during harvest.",
        "For maize cultivation, I recommend a balanced NPK fertilizer (e.g., 23:23:0) at planting, followed by nitrogen top-dressing at 6-8 weeks. Organic compost also improves soil health.",
        "Common pest damage signs include: 1) Holes in leaves (army worms), 2) Tunnels in stalks (stem borers), 3) Chewed ears (weevils), 4) Wilting plants (root damage). Early detection is key!"
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Optional: Speak the response
      await ttsService.speak(aiResponse.content, 'en');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice input error:', error);
      setIsListening(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await ttsService.speak(text, 'en');
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Assistant Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Agricultural Assistant
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Questions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Quick Questions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(question)}
                className="text-left justify-start h-auto p-2 text-xs hover:scale-105 transition-transform"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="h-64">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeak(message.content)}
                            className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about farming..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={startVoiceInput}
              disabled={isListening}
              className="hover:scale-105 transition-transform"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;