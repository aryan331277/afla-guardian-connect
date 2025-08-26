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
      // Use the localized greeting for that specific language
      const greeting = languages.find(l => l.code === language)?.greeting || 'Hello';
      console.log(`Testing voice for ${language}: "${greeting}"`);
      
      // The TTS service already handles language-specific voices
      await ttsService.speak(greeting, language);
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setIsPlaying(null);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('aflaguard-language', selectedLanguage);
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-bounce-in hover-scale hover-glow">
        <CardHeader className="text-center animate-slide-in">
          <CardTitle className="text-2xl text-primary animate-pulse">
            {t('language.select', 'Select Your Language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.map((language, index) => (
            <div
              key={language.code}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 transform hover:scale-105
                animate-slide-in-right hover-glow
                ${selectedLanguage === language.code 
                  ? 'border-primary bg-primary/10 animate-wiggle shadow-lg' 
                  : 'border-border hover:border-primary/50 hover:shadow-md'
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    {language.flag}
                  </span>
                  <span className="font-medium transition-colors duration-200">
                    {language.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(language.code);
                  }}
                  className={`
                    p-2 rounded-full transition-all duration-300 transform hover:scale-110
                    ${isPlaying === language.code 
                      ? 'bg-accent text-accent-foreground voice-active animate-pulse shadow-lg' 
                      : 'hover:bg-muted hover:shadow-md'
                    }
                  `}
                  aria-label={`Test ${language.name} voice`}
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isPlaying === language.code ? 'animate-bounce' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
                {language.greeting}
              </p>
            </div>
          ))}
          
          <Button 
            onClick={handleContinue}
            className="w-full mt-6 animate-scale-up hover:animate-wiggle"
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