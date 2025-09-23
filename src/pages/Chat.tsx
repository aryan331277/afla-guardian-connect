import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, ExternalLink, MessageCircle } from 'lucide-react';

// Declare Voiceflow types
declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (config: {
          verify: { projectID: string };
          url: string;
          versionID: string;
          voice: { url: string };
        }) => void;
      };
    };
  }
}

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI farming assistant. How can I help you today?' }
  ]);

  useEffect(() => {
    // Load Voiceflow chatbot script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() {
      if (window.voiceflow) {
        window.voiceflow.chat.load({
          verify: { projectID: '688a3d27d04cee16daed63b8' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
      }
    };
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      const existingScript = document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, 
      { role: 'user', content: message },
      { role: 'assistant', content: 'I understand your concern. Based on your location and crop type, I recommend...' }
    ]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col">
      <div className="flex items-center gap-4 p-4 bg-card border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-primary">AI Assistant</h1>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="hover-scale" onClick={() => window.open('https://google.com', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-1" />
            AI Chatbot
          </Button>
          <Button variant="outline" size="sm" className="hover-scale" onClick={() => navigate('/community')}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Discussion
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <Card key={index} className={`animate-fade-in ${msg.role === 'assistant' ? 'bg-primary/5' : 'bg-accent/5 ml-8'}`} style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-1 text-primary animate-float" />}
                <p className="text-sm">{msg.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-card border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about farming, aflatoxin, or crop management..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;