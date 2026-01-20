import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_API_URL = 'https://functions.poehali.dev/a748fa5e-94c9-4a37-bbe5-0033817cf79f';

interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setFormData({
            full_name: data.profile.full_name,
            email: data.profile.email,
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast({
        title: 'Ошибка',
        description: 'Новые пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('session_token');

    try {
      const updateData: any = {};
      
      if (formData.full_name !== profile?.full_name) {
        updateData.full_name = formData.full_name;
      }
      
      if (formData.email !== profile?.email) {
        updateData.email = formData.email;
      }
      
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await fetch(AUTH_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setFormData({
          ...formData,
          full_name: data.profile.full_name,
          email: data.profile.email,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...user,
            full_name: data.profile.full_name,
            email: data.profile.email
          }));
        }

        toast({
          title: 'Успешно',
          description: data.message || 'Профиль обновлён'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить профиль',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="glass-effect border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary"
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Назад
          </Button>
          
          <h1 className="text-xl font-heading font-bold">Настройки профиля</h1>
          
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-heading">Личные данные</CardTitle>
            <CardDescription>
              Управление информацией вашего профиля
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={32} className="text-background" />
              </div>
              <div>
                <p className="font-semibold text-lg">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.user_type === 'applicant' ? 'Соискатель' : 'Работодатель'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <Icon name="UserCircle" size={20} className="text-primary" />
                Основная информация
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Полное имя</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <Icon name="Lock" size={20} className="text-primary" />
                Изменение пароля
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="current_password">Текущий пароль</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Новый пароль</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Подтвердите новый пароль</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" className="mr-2" size={20} />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {profile && (
          <Card className="glass-effect border-border/50 mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Icon name="Info" size={20} className="text-muted-foreground" />
                Информация об аккаунте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>ID пользователя:</span>
                <span className="font-mono">{profile.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Дата регистрации:</span>
                <span>{new Date(profile.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex justify-between">
                <span>Тип аккаунта:</span>
                <span>{profile.user_type === 'applicant' ? 'Соискатель' : 'Работодатель'}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
