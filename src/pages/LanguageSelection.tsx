import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ttsService } from '@/lib/tts';
import { Volume2, Globe } from 'lucide-react';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to AflaGuard' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', greeting: 'Karibu kwa AflaGuard' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue à AflaGuard' },
    { code: 'es', name: 'Español', flag: '🇪🇸', greeting: 'Bienvenido a AflaGuard' }
  ];

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleContinue = async () => {
    localStorage.setItem('aflaguard-language', selectedLanguage);
    
    // Speak confirmation in selected language
    const selectedLang = languages.find(lang => lang.code === selectedLanguage);
    if (selectedLang) {
      await ttsService.speak(selectedLang.greeting, selectedLanguage as any);
    }
    
    navigate('/privacy-agreement');
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, selectedLanguage as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 pt-16 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl animate-glow">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4 flex items-center justify-center gap-3">
            Select Your Language
            <Button
              variant="ghost"
              onClick={() => handleSpeak('Select your preferred language')}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </Button>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Choose your preferred language for the best experience
          </p>
        </div>

        {/* Language Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {languages.map((language, index) => (
            <Card
              key={language.code}
              className={`
                cursor-pointer transition-all duration-300 hover:scale-105 group
                ${selectedLanguage === language.code 
                  ? 'ring-4 ring-primary ring-opacity-50 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/50' 
                  : 'hover:shadow-lg hover:border-primary/30 bg-white/50 backdrop-blur-sm'
                }
                border-2 rounded-xl overflow-hidden animate-scale-in
              `}
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <CardContent className="p-6 text-center">
                <div className={`
                  text-4xl mb-4 transition-transform duration-300 group-hover:scale-110
                  ${selectedLanguage === language.code ? 'animate-bounce' : ''}
                `}>
                  {language.flag}
                </div>
                <h3 className={`
                  text-xl font-bold mb-3 transition-colors
                  ${selectedLanguage === language.code ? 'text-primary' : 'text-foreground'}
                `}>
                  {language.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <p className={`
                    text-sm transition-colors
                    ${selectedLanguage === language.code ? 'text-primary/80' : 'text-muted-foreground'}
                  `}>
                    {language.greeting}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(language.greeting);
                    }}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center animate-slide-up" style={{animationDelay: '0.6s'}}>
          <Button 
            onClick={handleContinue}
            className="px-10 py-3 text-lg font-semibold bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl"
            size="lg"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;