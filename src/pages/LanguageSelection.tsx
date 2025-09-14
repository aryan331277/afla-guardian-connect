import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '@/lib/database';
import { I18nService, t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { Globe } from 'lucide-react';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isPlaying, setIsPlaying] = useState<Language | null>(null);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: 'GB', greeting: 'English' },
    { code: 'sw' as Language, name: 'Kiswahili', flag: 'KE', greeting: 'Kiswahili' },
    { code: 'ki' as Language, name: 'Gĩkũyũ', flag: 'KE', greeting: 'Gĩkũyũ' }
  ];

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    I18nService.setLanguage(language);
  };

  const handleTestVoice = async (language: Language) => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(null);
      return;
    }

    setIsPlaying(language);
    try {
      const greeting = languages.find(l => l.code === language)?.greeting || 'Hello';
      await ttsService.speak(greeting, language);
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setIsPlaying(null);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('verdan-language', selectedLanguage);
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to Verdan
          </h1>
          
          <p className="text-muted-foreground text-lg">
            Professional Agricultural Intelligence Platform
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-foreground">
              Select Your Language
              <button
                onClick={() => handleTestVoice(selectedLanguage)}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                </svg>
              </button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {languages.map((language) => (
              <div
                key={language.code}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md
                  ${selectedLanguage === language.code 
                    ? 'bg-primary/5 border-primary shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-primary/30'
                  }
                `}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-bold text-primary text-sm">
                  {language.flag}
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{language.name}</div>
                  <div className="text-sm text-primary">{language.greeting}</div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(language.code);
                  }}
                  className={`
                    p-2 rounded-full transition-all
                    ${isPlaying === language.code 
                      ? 'bg-accent text-accent-foreground animate-pulse' 
                      : 'hover:bg-accent'
                    }
                  `}
                >
                  <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                </button>
              </div>
            ))}
            
            <Button 
              onClick={handleContinue}
              className="w-full mt-8 h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
              size="lg"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LanguageSelection;