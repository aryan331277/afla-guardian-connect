import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/database';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { Volume2 } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  const roles = [
    {
      role: 'farmer' as UserRole,
      icon: '🌾',
      title: t('role.farmer', 'Farmer'),
      description: 'Scan crops for aflatoxin risk, get AI recommendations, and join the farming community.',
      features: ['15-feature scanning wizard', 'AI chat assistant', 'Community forum', 'Gamification rewards']
    },
    {
      role: 'buyer' as UserRole,
      icon: '🏪',
      title: t('role.buyer', 'Buyer'),
      description: 'Quickly assess corn quality and contamination levels before purchase.',
      features: ['Camera-based detection', 'Quality assessment', 'Resell bad corn to NGOs', 'Quick verification']
    },
    {
      role: 'government' as UserRole,
      icon: '🏛️',
      title: t('role.government', 'Government'),
      description: 'Monitor regional contamination levels and track agricultural data.',
      features: ['Analytics dashboard', 'Regional insights', 'Export reports', 'Resource allocation']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    localStorage.setItem('aflaguard-role', selectedRole);
    
    // Speak the role confirmation
    const roleText = roles.find(r => r.role === selectedRole)?.title || selectedRole;
    await ttsService.speak(`You selected ${roleText}. Proceeding to authentication.`, 'en');
    
    navigate('/phone-auth');
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 pt-8 animate-slide-up">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
            <div className="text-4xl font-bold text-white">AG</div>
          </div>
          <h1 className="text-5xl font-bold text-gradient mb-4 flex items-center justify-center gap-4">
            {t('role.select', 'Choose Your Role')}
            <Button
              variant="ghost"
              onClick={() => handleSpeak(t('role.select', 'Choose Your Role'))}
              className="p-3 rounded-full hover:bg-primary/10 transition-colors"
            >
              <Volume2 className="w-6 h-6 text-primary" />
            </Button>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Select your role to access specialized features designed for your agricultural needs
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role, index) => (
            <Card
              key={role.role}
              className={`
                cursor-pointer transition-all duration-500 hover:scale-105 group
                ${selectedRole === role.role 
                  ? 'ring-4 ring-primary ring-opacity-50 shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30' 
                  : 'hover:shadow-xl hover:border-primary/30 bg-white/50 backdrop-blur-sm'
                }
                border-2 rounded-2xl overflow-hidden animate-scale-in
              `}
              style={{animationDelay: `${index * 0.2}s`}}
              onClick={() => handleRoleSelect(role.role)}
            >
              <CardHeader className="text-center pb-4 pt-8">
                <div className={`
                  text-6xl mb-6 transition-transform duration-300 group-hover:scale-110
                  ${selectedRole === role.role ? 'animate-bounce' : ''}
                `}>
                  {role.icon}
                </div>
                <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
                  <span className={selectedRole === role.role ? 'text-primary' : 'text-foreground'}>
                    {role.title}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(role.title + '. ' + role.description);
                    }}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {role.description}
                </p>
                <ul className="space-y-3">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-sm">
                      <div className={`
                        w-2 h-2 rounded-full transition-colors
                        ${selectedRole === role.role ? 'bg-primary' : 'bg-muted-foreground/50'}
                      `}></div>
                      <span className={`
                        transition-colors font-medium
                        ${selectedRole === role.role ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center animate-slide-up" style={{animationDelay: '0.8s'}}>
          <Button 
            onClick={handleContinue}
            className="px-12 py-4 text-lg font-semibold bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl"
            size="lg"
          >
            {t('action.continue', 'Continue')} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;