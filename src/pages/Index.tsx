import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    navigate(`/vacancies?${params.toString()}`);
  };

  const jobCategories = [
    { name: 'Frontend', icon: 'Code', color: 'bg-primary/20 text-primary' },
    { name: 'Backend', icon: 'Server', color: 'bg-secondary/20 text-secondary' },
    { name: 'Design', icon: 'Palette', color: 'bg-accent/20 text-accent' },
    { name: 'DevOps', icon: 'Cloud', color: 'bg-primary/20 text-primary' },
    { name: 'Mobile', icon: 'Smartphone', color: 'bg-secondary/20 text-secondary' },
    { name: 'Data', icon: 'Database', color: 'bg-accent/20 text-accent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="glass-effect border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-border">
              <Icon name="Zap" className="text-background" size={24} />
            </div>
            <span className="text-2xl font-heading font-bold neon-glow">Peeky</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/vacancies')} className="text-muted-foreground hover:text-foreground transition-colors">Вакансии</button>
            <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-foreground transition-colors">О платформе</button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:block">
                  Привет, <span className="text-foreground font-semibold">{user.full_name}</span>
                </span>
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  <Icon name="Settings" className="mr-2" size={18} />
                  Профиль
                </Button>
                <Button 
                  onClick={() => navigate(user.user_type === 'employer' ? '/employer-cabinet' : '/applicant-cabinet')} 
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
                >
                  <Icon name="User" className="mr-2" size={18} />
                  Кабинет
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary">
                  <Icon name="LogOut" className="mr-2" size={18} />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-foreground hover:text-primary">
                  Войти
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold">
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Найди работу мечты
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Платформа нового поколения для поиска вакансий и талантливых специалистов
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-6 mb-12 max-w-4xl mx-auto animate-glow-pulse">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Должность, навык или компания"
                  className="pl-10 bg-background/50 border-primary/30 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex-1 relative">
                <Icon name="MapPin" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Город или регион"
                  className="pl-10 bg-background/50 border-primary/30 h-12"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 px-8 text-background font-semibold"
              >
                <Icon name="Rocket" className="mr-2" size={20} />
                Искать
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {jobCategories.map((category, index) => (
              <Card
                key={index}
                className="glass-effect hover:scale-105 transition-transform cursor-pointer group border-border/50"
                onClick={() => {
                  setSearchQuery(category.name);
                  navigate(`/vacancies?q=${category.name}`);
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:animate-glow-pulse`}>
                    <Icon name={category.icon} size={24} />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold mb-8">Начни свой путь к успеху</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="glass-effect hover:neon-border transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="UserPlus" size={32} />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">1. Регистрация</h3>
                  <p className="text-muted-foreground">Создайте аккаунт и заполните профиль</p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:neon-border transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={32} />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">2. Поиск вакансий</h3>
                  <p className="text-muted-foreground">Найдите идеальную работу из тысяч предложений</p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:neon-border transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Send" size={32} />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">3. Откликайтесь</h3>
                  <p className="text-muted-foreground">Отправляйте резюме и получайте ответы</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold px-8 py-6 text-lg"
              >
                <Icon name="Rocket" className="mr-2" size={24} />
                Начать сейчас
              </Button>
              <Button
                onClick={() => navigate('/vacancies')}
                variant="outline"
                className="border-primary/30 px-8 py-6 text-lg"
              >
                <Icon name="Briefcase" className="mr-2" size={24} />
                Просмотреть вакансии
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Zap" className="text-background" size={20} />
              </div>
              <span className="font-heading font-bold text-lg">Peeky</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">О платформе</button>
              <button onClick={() => navigate('/vacancies')} className="hover:text-foreground transition-colors">Вакансии</button>
            </div>
            <p className="text-sm text-muted-foreground">&copy; 2026 Peeky. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
