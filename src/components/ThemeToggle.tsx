import { Sun, Moon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { ttsService } from '@/lib/tts';
import { t } from '@/lib/i18n';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'colorblind':
        return <Eye className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return t('theme.day', 'Day Mode');
      case 'dark':
        return t('theme.night', 'Night Mode');
      case 'colorblind':
        return t('theme.colorblind', 'High Contrast');
      default:
        return t('theme.day', 'Day Mode');
    }
  };

  const handleToggle = async () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'colorblind' : 'light';
    const nextLabel = nextTheme === 'light' ? 'Day Mode' : nextTheme === 'dark' ? 'Night Mode' : 'High Contrast';
    
    toggleTheme();
    
    // Provide audio feedback for accessibility
    try {
      const currentLanguage = localStorage.getItem('aflaguard-language') as 'en' | 'sw' | 'ki' || 'en';
      await ttsService.speak(`${t('theme.switched', 'Switched to')} ${nextLabel}`, currentLanguage);
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="flex items-center gap-2 hover-scale hover-glow transition-all duration-300 
                 border-2 border-primary/20 hover:border-primary/50 
                 bg-background/80 backdrop-blur-sm
                 shadow-lg hover:shadow-xl"
      aria-label={`Current theme: ${getThemeLabel()}. Click to switch.`}
    >
      <span className="animate-scale-up">
        {getThemeIcon()}
      </span>
      <span className="hidden sm:inline font-medium">
        {getThemeLabel()}
      </span>
    </Button>
  );
}