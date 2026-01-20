import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);

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

  const jobCategories = [
    { name: 'Frontend', icon: 'Code', count: 245, color: 'bg-primary/20 text-primary' },
    { name: 'Backend', icon: 'Server', count: 198, color: 'bg-secondary/20 text-secondary' },
    { name: 'Design', icon: 'Palette', count: 156, color: 'bg-accent/20 text-accent' },
    { name: 'DevOps', icon: 'Cloud', count: 134, color: 'bg-primary/20 text-primary' },
    { name: 'Mobile', icon: 'Smartphone', count: 189, color: 'bg-secondary/20 text-secondary' },
    { name: 'Data', icon: 'Database', count: 167, color: 'bg-accent/20 text-accent' },
  ];

  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Москва',
      salary: '250 000 - 350 000 ₽',
      type: 'Полная занятость',
      tags: ['React', 'TypeScript', 'Next.js'],
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Backend Python Developer',
      company: 'DataLabs',
      location: 'Санкт-Петербург',
      salary: '200 000 - 300 000 ₽',
      type: 'Удалённо',
      tags: ['Python', 'Django', 'PostgreSQL'],
      rating: 4.6,
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'CreativeStudio',
      location: 'Удалённо',
      salary: '150 000 - 250 000 ₽',
      type: 'Гибрид',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      rating: 4.9,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="glass-effect border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-border">
              <Icon name="Zap" className="text-background" size={24} />
            </div>
            <span className="text-2xl font-heading font-bold neon-glow">JobNova</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button className="text-muted-foreground hover:text-foreground transition-colors">Вакансии</button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">Компании</button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">О платформе</button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:block">
                  Привет, <span className="text-foreground font-semibold">{user.full_name}</span>
                </span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="home" className="mt-0">
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
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Icon name="MapPin" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Город или регион"
                      className="pl-10 bg-background/50 border-primary/30 h-12"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 px-8 text-background font-semibold">
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
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:animate-glow-pulse`}>
                        <Icon name={category.icon} size={24} />
                      </div>
                      <h3 className="font-heading font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} вакансий</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-heading font-bold">Лучшие вакансии</h2>
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    Все вакансии
                    <Icon name="ArrowRight" className="ml-2" size={20} />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredJobs.map((job) => (
                    <Card key={job.id} className="glass-effect hover:neon-border transition-all cursor-pointer group border-border/50">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30">{job.type}</Badge>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" className="text-accent fill-accent" size={16} />
                            <span className="text-sm font-semibold">{job.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="font-heading group-hover:text-primary transition-colors">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-foreground/70">
                          <Icon name="Building2" size={16} />
                          {job.company}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="MapPin" size={16} />
                            {job.location}
                          </div>
                          <div className="text-lg font-semibold text-primary">{job.salary}</div>
                          <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="border-secondary/30 text-secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background">
                              Откликнуться
                            </Button>
                            <Button variant="outline" size="icon" className="border-primary/30">
                              <Icon name="Heart" size={18} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="cabinet" className="mt-0">
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="glass-effect rounded-2xl p-8 border-border/50">
                <h2 className="text-3xl font-heading font-bold mb-8">Личный кабинет</h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <Card onClick={() => navigate('/resume')} className="glass-effect hover:neon-border transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                        <Icon name="FileText" size={32} />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">Резюме</h3>
                      <p className="text-sm text-muted-foreground">Создать и редактировать</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect hover:neon-border transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                        <Icon name="Send" size={32} />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">Отклики</h3>
                      <p className="text-sm text-muted-foreground">Просмотр откликов</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect hover:neon-border transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-accent/20 text-accent rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                        <Icon name="Heart" size={32} />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">Избранное</h3>
                      <p className="text-sm text-muted-foreground">Сохранённые вакансии</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect hover:neon-border transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-glow-pulse">
                        <Icon name="BarChart3" size={32} />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">Аналитика</h3>
                      <p className="text-sm text-muted-foreground">Статистика просмотров</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-6">
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="MessageSquare" className="text-primary" />
                        Уведомления
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Получайте уведомления о новых вакансиях</p>
                      <Button variant="outline" className="w-full border-primary/30">
                        Настроить
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Filter" className="text-secondary" />
                        Фильтрация
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Настройте умный поиск вакансий</p>
                      <Button variant="outline" className="w-full border-secondary/30">
                        Настроить
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Users" className="text-accent" />
                        Чат
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Общайтесь с работодателями</p>
                      <Button variant="outline" className="w-full border-accent/30">
                        Открыть
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <Button
          size="icon"
          className={`w-14 h-14 rounded-full ${activeTab === 'home' ? 'bg-gradient-to-r from-primary to-secondary' : 'glass-effect'} neon-border`}
          onClick={() => setActiveTab('home')}
        >
          <Icon name="Home" size={24} />
        </Button>
        <Button
          size="icon"
          className={`w-14 h-14 rounded-full ${activeTab === 'cabinet' ? 'bg-gradient-to-r from-primary to-secondary' : 'glass-effect'} neon-border`}
          onClick={() => setActiveTab('cabinet')}
        >
          <Icon name="User" size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Index;