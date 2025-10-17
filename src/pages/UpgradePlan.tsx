import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Crown, Check } from 'lucide-react';

const UpgradePlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Upgrade to Premium</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Premium Features - 1000 KES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Remove all advertisements',
              'Video tutorials & guides',
              'Expert 1-on-1 consultations',
              '20% discount on IoT devices',
              'Priority laboratory testing'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span>{feature}</span>
              </div>
            ))}
            
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={() => {
                // M-Pesa integration will be added when Stripe credentials are configured
                console.log('Payment initiated - awaiting Stripe integration');
              }}
            >
              Upgrade via M-Pesa
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Secure payment powered by Stripe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpgradePlan;