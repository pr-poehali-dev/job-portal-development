import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "Zap",
      title: "Быстрый поиск",
      description: "Интеллектуальная система поиска вакансий по навыкам, опыту и локации"
    },
    {
      icon: "Shield",
      title: "Безопасность",
      description: "Защита персональных данных и конфиденциальность откликов"
    },
    {
      icon: "Users",
      title: "Широкая база",
      description: "Тысячи вакансий от проверенных компаний"
    },
    {
      icon: "Rocket",
      title: "Карьерный рост",
      description: "Инструменты для развития и отслеживания прогресса"
    },
    {
      icon: "Heart",
      title: "Персонализация",
      description: "Рекомендации вакансий на основе ваших предпочтений"
    },
    {
      icon: "TrendingUp",
      title: "Аналитика",
      description: "Статистика откликов и просмотров резюме"
    }
  ];

  const stats = [
    { icon: "Briefcase", label: "Вакансий" },
    { icon: "Building2", label: "Компаний" },
    { icon: "Users", label: "Соискателей" },
    { icon: "TrendingUp", label: "Откликов" }
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
          
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary"
          >
            <Icon name="Home" className="mr-2" size={20} />
            На главную
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            О платформе Peeky
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Современная платформа для поиска работы и талантов, которая помогает людям находить лучшие возможности для карьерного роста
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-effect border-primary/20 hover:neon-border transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name={stat.icon} className="text-background" size={32} />
                </div>
                <p className="text-lg font-semibold">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">Наши возможности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect hover:neon-border transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <Icon name={feature.icon} className="text-background" size={28} />
                  </div>
                  <CardTitle className="font-heading text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="glass-effect border-primary/30 mb-16">
          <CardContent className="p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading font-bold mb-6 text-center">Наша миссия</h2>
              <p className="text-lg text-muted-foreground mb-4 text-center">
                Мы создали Peeky, чтобы сделать процесс поиска работы простым, удобным и эффективным. 
                Наша цель — соединить талантливых специалистов с компаниями, которые ценят их навыки и опыт.
              </p>
              <p className="text-lg text-muted-foreground text-center">
                Мы верим, что каждый заслуживает найти работу, которая приносит удовлетворение и помогает расти профессионально.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-effect hover:neon-border transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                  <Icon name="Briefcase" size={24} />
                </div>
                <CardTitle className="font-heading text-2xl">Для соискателей</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-primary mt-1" size={20} />
                <p className="text-muted-foreground">Создавайте профессиональное резюме</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-primary mt-1" size={20} />
                <p className="text-muted-foreground">Получайте персональные рекомендации вакансий</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-primary mt-1" size={20} />
                <p className="text-muted-foreground">Откликайтесь на вакансии в один клик</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-primary mt-1" size={20} />
                <p className="text-muted-foreground">Отслеживайте статус ваших откликов</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover:neon-border transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center">
                  <Icon name="Building2" size={24} />
                </div>
                <CardTitle className="font-heading text-2xl">Для работодателей</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-secondary mt-1" size={20} />
                <p className="text-muted-foreground">Публикуйте вакансии быстро и легко</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-secondary mt-1" size={20} />
                <p className="text-muted-foreground">Получайте отклики от квалифицированных кандидатов</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-secondary mt-1" size={20} />
                <p className="text-muted-foreground">Управляйте откликами в одном месте</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Check" className="text-secondary mt-1" size={20} />
                <p className="text-muted-foreground">Анализируйте эффективность вакансий</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Готовы начать?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам пользователей, которые уже нашли работу своей мечты через Peeky
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold px-8 py-6 text-lg"
              >
                <Icon name="Rocket" className="mr-2" size={24} />
                Зарегистрироваться
              </Button>
              <Button
                onClick={() => navigate('/vacancies')}
                variant="outline"
                className="border-primary/30 px-8 py-6 text-lg"
              >
                <Icon name="Search" className="mr-2" size={24} />
                Посмотреть вакансии
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 Peeky. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;