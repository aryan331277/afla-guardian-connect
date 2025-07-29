import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/database';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';

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
    await ttsService.speak(`You selected ${roleText}. Proceeding to phone verification.`, 'en');
    
    navigate('/auth');
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            {t('role.select', 'Choose Your Role')}
            <button
              onClick={() => handleSpeak(t('role.select', 'Choose Your Role'))}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
              </svg>
            </button>
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <Card
              key={role.role}
              className={`
                cursor-pointer transition-all hover:shadow-lg
                ${selectedRole === role.role 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleRoleSelect(role.role)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{role.icon}</div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {role.title}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(role.title + '. ' + role.description);
                    }}
                    className="p-1 rounded-full hover:bg-accent transition-colors"
                  >
                    <svg className="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
                    </svg>
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="px-8"
          >
            {t('action.continue', 'Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;