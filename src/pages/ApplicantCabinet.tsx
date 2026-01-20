import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: number;
  vacancy_id: number;
  title: string;
  company: string;
  salary_min?: number;
  salary_max?: number;
  status: string;
  created_at: string;
}

interface Favorite {
  id: number;
  title: string;
  company: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employer_name: string;
}

const ApplicantCabinet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('sessionToken');
    
    try {
      const [appsRes, favsRes] = await Promise.all([
        fetch('https://functions.poehali.dev/2c41da4d-f2df-4c58-91c0-b1f93972753c', {
          headers: { 'X-Session-Token': token || '' }
        }),
        fetch('https://functions.poehali.dev/675cda5f-c23f-47c9-a0b0-17b8e1c39a83', {
          headers: { 'X-Session-Token': token || '' }
        })
      ]);

      if (appsRes.ok) {
        const apps = await appsRes.json();
        setApplications(apps);
      }

      if (favsRes.ok) {
        const favs = await favsRes.json();
        setFavorites(favs);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (vacancyId: number) => {
    const token = localStorage.getItem('sessionToken');
    
    try {
      const res = await fetch(`https://functions.poehali.dev/675cda5f-c23f-47c9-a0b0-17b8e1c39a83?vacancy_id=${vacancyId}`, {
        method: 'DELETE',
        headers: { 'X-Session-Token': token || '' }
      });

      if (res.ok) {
        setFavorites(favorites.filter(f => f.id !== vacancyId));
        toast({
          title: "Успешно",
          description: "Удалено из избранного"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'На рассмотрении', className: 'bg-yellow-500/20 text-yellow-500' },
      accepted: { label: 'Принято', className: 'bg-green-500/20 text-green-500' },
      rejected: { label: 'Отклонено', className: 'bg-red-500/20 text-red-500' }
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Briefcase" className="text-background" size={24} />
              </div>
              <span className="text-2xl font-heading font-bold">Личный кабинет</span>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect hover:neon-border transition-all cursor-pointer" onClick={() => navigate('/resume')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="FileText" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Резюме</h3>
              <p className="text-sm text-muted-foreground">Редактировать</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Send" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Отклики</h3>
              <p className="text-2xl font-bold text-primary">{applications.length}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-accent/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Heart" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Избранное</h3>
              <p className="text-2xl font-bold text-primary">{favorites.length}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="BarChart3" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Просмотры</h3>
              <p className="text-2xl font-bold text-primary">0</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
              <Icon name="Send" className="text-secondary" />
              Мои отклики
            </h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="glass-effect hover:neon-border transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">{app.title}</h3>
                        <p className="text-muted-foreground">{app.company}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    {app.salary_min && (
                      <p className="text-primary font-semibold mb-2">
                        {app.salary_min.toLocaleString()} - {app.salary_max?.toLocaleString()} ₽
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Отправлено: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {applications.length === 0 && !loading && (
                <Card className="glass-effect">
                  <CardContent className="p-8 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Пока нет откликов</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
              <Icon name="Heart" className="text-accent" />
              Избранные вакансии
            </h2>
            <div className="space-y-4">
              {favorites.map((fav) => (
                <Card key={fav.id} className="glass-effect hover:neon-border transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">{fav.title}</h3>
                        <p className="text-muted-foreground">{fav.company}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFavorite(fav.id)}
                      >
                        <Icon name="X" size={18} />
                      </Button>
                    </div>
                    {fav.location && (
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {fav.location}
                      </p>
                    )}
                    {fav.salary_min && (
                      <p className="text-primary font-semibold">
                        {fav.salary_min.toLocaleString()} - {fav.salary_max?.toLocaleString()} ₽
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {favorites.length === 0 && !loading && (
                <Card className="glass-effect">
                  <CardContent className="p-8 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет избранных вакансий</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantCabinet;
