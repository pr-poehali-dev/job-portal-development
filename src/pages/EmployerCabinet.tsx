import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Vacancy {
  id: number;
  title: string;
  company: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  status: string;
  views_count: number;
  created_at: string;
}

interface Application {
  id: number;
  vacancy_id: number;
  title: string;
  company: string;
  full_name: string;
  email: string;
  position?: string;
  phone?: string;
  status: string;
  created_at: string;
}

const EmployerCabinet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary_min: '',
    salary_max: '',
    employment_type: 'Полная занятость',
    experience: 'Не требуется',
    description: '',
    requirements: '',
    tags: ''
  });

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
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    
    try {
      const [vacsRes, appsRes] = await Promise.all([
        fetch(`https://functions.poehali.dev/d62cf512-4bb6-440b-a47e-1c40ac68aec5?employer_id=${user.id}`, {
          headers: { 'X-Session-Token': token || '' }
        }),
        fetch('https://functions.poehali.dev/2c41da4d-f2df-4c58-91c0-b1f93972753c', {
          headers: { 'X-Session-Token': token || '' }
        })
      ]);

      if (vacsRes.ok) {
        const vacs = await vacsRes.json();
        setVacancies(vacs);
      }

      if (appsRes.ok) {
        const apps = await appsRes.json();
        setApplications(apps);
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

  const createVacancy = async () => {
    const token = localStorage.getItem('sessionToken');
    
    try {
      const res = await fetch('https://functions.poehali.dev/d62cf512-4bb6-440b-a47e-1c40ac68aec5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token || ''
        },
        body: JSON.stringify({
          ...formData,
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        toast({
          title: "Успешно",
          description: "Вакансия создана"
        });
        setIsDialogOpen(false);
        setFormData({
          title: '',
          company: '',
          location: '',
          salary_min: '',
          salary_max: '',
          employment_type: 'Полная занятость',
          experience: 'Не требуется',
          description: '',
          requirements: '',
          tags: ''
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать вакансию",
        variant: "destructive"
      });
    }
  };

  const updateApplicationStatus = async (appId: number, status: string) => {
    const token = localStorage.getItem('sessionToken');
    
    try {
      const res = await fetch('https://functions.poehali.dev/2c41da4d-f2df-4c58-91c0-b1f93972753c', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token || ''
        },
        body: JSON.stringify({ id: appId, status })
      });

      if (res.ok) {
        setApplications(applications.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        toast({
          title: "Успешно",
          description: "Статус обновлен"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Новый', className: 'bg-yellow-500/20 text-yellow-500' },
      accepted: { label: 'Принят', className: 'bg-green-500/20 text-green-500' },
      rejected: { label: 'Отклонен', className: 'bg-red-500/20 text-red-500' }
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const totalViews = vacancies.reduce((sum, v) => sum + v.views_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Building2" className="text-background" size={24} />
              </div>
              <span className="text-2xl font-heading font-bold">Кабинет работодателя</span>
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
          <Card className="glass-effect border-primary/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Briefcase" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Вакансии</h3>
              <p className="text-2xl font-bold text-primary">{vacancies.length}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-secondary/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Отклики</h3>
              <p className="text-2xl font-bold text-primary">{applications.length}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-accent/50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Eye" size={32} />
              </div>
              <h3 className="font-heading font-semibold mb-2">Просмотры</h3>
              <p className="text-2xl font-bold text-primary">{totalViews}</p>
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="glass-effect hover:neon-border transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 text-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon name="Plus" size={32} />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Создать</h3>
                  <p className="text-sm text-muted-foreground">Новую вакансию</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая вакансия</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Название должности</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Frontend разработчик"
                    />
                  </div>
                  <div>
                    <Label>Компания</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Название компании"
                    />
                  </div>
                </div>
                <div>
                  <Label>Локация</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Москва / Удаленно"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Зарплата от</Label>
                    <Input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label>Зарплата до</Label>
                    <Input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      placeholder="200000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание вакансии..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Требования</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Требования к кандидату..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Теги (через запятую)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="React, TypeScript, Remote"
                  />
                </div>
                <Button onClick={createVacancy} className="w-full">
                  Создать вакансию
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
              <Icon name="Briefcase" className="text-primary" />
              Мои вакансии
            </h2>
            <div className="space-y-4">
              {vacancies.map((vac) => (
                <Card key={vac.id} className="glass-effect hover:neon-border transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">{vac.title}</h3>
                        <p className="text-muted-foreground">{vac.company}</p>
                      </div>
                      <Badge className={vac.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}>
                        {vac.status === 'active' ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Icon name="Eye" size={14} />
                        {vac.views_count} просмотров
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(vac.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {vacancies.length === 0 && !loading && (
                <Card className="glass-effect">
                  <CardContent className="p-8 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Нет активных вакансий</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать вакансию
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
              <Icon name="Users" className="text-secondary" />
              Отклики кандидатов
            </h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="glass-effect hover:neon-border transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">{app.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.position || 'Соискатель'}</p>
                        <p className="text-sm text-muted-foreground">{app.title}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm mb-3">
                      <span className="text-muted-foreground">Email:</span> {app.email}
                    </p>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'accepted')}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <Icon name="Check" size={16} className="mr-1" />
                          Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          className="flex-1"
                        >
                          <Icon name="X" size={16} className="mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    )}
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
        </div>
      </div>
    </div>
  );
};

export default EmployerCabinet;
