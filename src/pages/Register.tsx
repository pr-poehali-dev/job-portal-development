import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/a748fa5e-94c9-4a37-bbe5-0033817cf79f';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    user_type: 'candidate'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: 'Регистрация успешна!',
          description: `Добро пожаловать, ${data.user.full_name}`,
        });
        
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: data.error || 'Не удалось создать аккаунт',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-foreground hover:text-primary"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
      </div>

      <Card className="w-full max-w-md glass-effect border-border/50 animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-border">
              <Icon name="Zap" className="text-background" size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading">Регистрация</CardTitle>
          <CardDescription className="text-muted-foreground">
            Создайте аккаунт для доступа к платформе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Полное имя</Label>
              <div className="relative">
                <Icon name="User" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 bg-background/50 border-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Icon name="Mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-background/50 border-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-background/50 border-primary/30"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Тип аккаунта</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 glass-effect p-4 rounded-lg border border-primary/30 cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="candidate" id="candidate" />
                  <Label htmlFor="candidate" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Icon name="User" className="text-primary" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">Соискатель</div>
                        <div className="text-sm text-muted-foreground">Ищу работу</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 glass-effect p-4 rounded-lg border border-primary/30 cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Icon name="Building2" className="text-secondary" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">Компания</div>
                        <div className="text-sm text-muted-foreground">Размещаю вакансии</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Регистрация...
                </>
              ) : (
                <>
                  <Icon name="UserPlus" className="mr-2" size={20} />
                  Зарегистрироваться
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Войти
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
