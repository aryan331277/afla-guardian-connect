import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/database';
import { t } from '@/lib/i18n';
import { ttsService } from '@/lib/tts';
import { Wheat, Building2, Building } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  const roles = [
    {
      role: 'farmer' as UserRole,
      icon: <Wheat className="w-8 h-8 text-white" />,
      iconBg: 'bg-primary',
      title: t('role.farmer', 'Farmer'),
      description: 'Advanced crop health monitoring and AI-powered recommendations',
      features: ['Crop Health Monitoring', 'AI Risk Analysis', 'Weather Insights', 'Expert Consultations']
    },
    {
      role: 'buyer' as UserRole,
      icon: <Building2 className="w-8 h-8 text-white" />,
      iconBg: 'bg-blue-500',
      title: t('role.buyer', 'Buyer'),
      description: 'Quality assessment and supply chain management tools',
      features: ['Quality Assessment', 'Supply Chain Tracking', 'Market Analytics', 'NGO Network']
    },
    {
      role: 'government' as UserRole,
      icon: <Building className="w-8 h-8 text-white" />,
      iconBg: 'bg-purple-500',
      title: t('role.government', 'Government'),
      description: 'Regional Analytics',
      features: ['Regional Analytics', 'Policy Insights', 'Resource Planning', 'Export Reports']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    localStorage.setItem('aflaguard-role', selectedRole);
    
    // Speak the role confirmation
    const roleText = roles.find(r => r.role === selectedRole)?.title || selectedRole;
    await ttsService.speak(`You selected ${roleText}. Opening dashboard.`, 'en');
    
    // Navigate directly to the appropriate dashboard
    switch (selectedRole) {
      case 'farmer':
        navigate('/farmer');
        break;
      case 'buyer':
        navigate('/buyer');
        break;
      case 'government':
        navigate('/government');
        break;
      default:
        navigate('/farmer');
    }
  };

  const handleSpeak = async (text: string) => {
    await ttsService.speak(text, 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wheat className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to AflaGuard
          </h1>
          
          <h2 className="text-xl text-foreground flex items-center justify-center gap-2">
            Choose Your Role
            <button
              onClick={() => handleSpeak(t('role.select', 'Choose Your Role'))}
              className="p-1 rounded-full hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
              </svg>
            </button>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => (
            <Card
              key={role.role}
              className={`
                cursor-pointer transition-all hover:shadow-xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1
                ${selectedRole === role.role 
                  ? 'ring-2 ring-primary shadow-2xl' 
                  : 'hover:shadow-xl'
                }
              `}
              onClick={() => handleRoleSelect(role.role)}
            >
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 ${role.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {role.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
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
                <p className="text-muted-foreground text-center">{role.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
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
            className="px-12 h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
          >
            {t('action.continue', 'Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;