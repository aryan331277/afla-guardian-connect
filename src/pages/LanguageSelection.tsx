import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '@/lib/database';
import { I18nService, t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isPlaying, setIsPlaying] = useState<Language | null>(null);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧', greeting: 'Welcome to AflaGuard' },
    { code: 'sw' as Language, name: 'Kiswahili', flag: '🇰🇪', greeting: 'Karibu AflaGuard' },
    { code: 'ki' as Language, name: 'Gĩkũyũ', flag: '🇰🇪', greeting: 'Wamũkĩra AflaGuard' }
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
    localStorage.setItem('aflaguard-language', selectedLanguage);
    navigate('/role');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">
            {t('language.select', 'Select Your Language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedLanguage === language.code 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(language.code);
                  }}
                  className={`
                    p-2 rounded-full transition-colors
                    ${isPlaying === language.code 
                      ? 'bg-accent text-accent-foreground voice-active' 
                      : 'hover:bg-muted'
                    }
                  `}
                  aria-label={`Test ${language.name} voice`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{language.greeting}</p>
            </div>
          ))}
          
          <Button 
            onClick={handleContinue}
            className="w-full mt-6"
            size="lg"
          >
            {t('action.continue', 'Continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelection;