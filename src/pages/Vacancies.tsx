import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Vacancy {
  id: number;
  title: string;
  company: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience?: string;
  description?: string;
  requirements?: string;
  tags?: string[];
  employer_name: string;
  views_count: number;
}

const Vacancies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    try {
      const res = await fetch('https://functions.poehali.dev/d62cf512-4bb6-440b-a47e-1c40ac68aec5');
      if (res.ok) {
        const data = await res.json();
        setVacancies(data);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить вакансии",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyToVacancy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'applicant') {
      toast({
        title: "Недоступно",
        description: "Только соискатели могут откликаться на вакансии",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('sessionToken');
    
    try {
      const res = await fetch('https://functions.poehali.dev/2c41da4d-f2df-4c58-91c0-b1f93972753c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token || ''
        },
        body: JSON.stringify({
          vacancy_id: selectedVacancy?.id,
          cover_letter: coverLetter
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Успешно",
          description: "Отклик отправлен"
        });
        setIsApplyDialogOpen(false);
        setCoverLetter("");
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить отклик",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отклик",
        variant: "destructive"
      });
    }
  };

  const addToFavorites = async (vacancyId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('sessionToken');
    
    try {
      const res = await fetch('https://functions.poehali.dev/675cda5f-c23f-47c9-a0b0-17b8e1c39a83', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token || ''
        },
        body: JSON.stringify({ vacancy_id: vacancyId })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Успешно",
          description: "Добавлено в избранное"
        });
      } else {
        toast({
          title: "Информация",
          description: data.error || "Не удалось добавить",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в избранное",
        variant: "destructive"
      });
    }
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
              <span className="text-2xl font-heading font-bold">Вакансии</span>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-4">Все вакансии</h1>
          <p className="text-muted-foreground">Найдено {vacancies.length} вакансий</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="glass-effect hover:neon-border transition-all border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {vacancy.employment_type || 'Полная занятость'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Eye" size={14} />
                    {vacancy.views_count}
                  </div>
                </div>
                <CardTitle className="font-heading hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedVacancy(vacancy)}>
                  {vacancy.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-foreground/70">
                  <Icon name="Building2" size={16} />
                  {vacancy.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vacancy.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="MapPin" size={16} />
                      {vacancy.location}
                    </div>
                  )}
                  {vacancy.salary_min && (
                    <div className="text-lg font-semibold text-primary">
                      {vacancy.salary_min.toLocaleString()} - {vacancy.salary_max?.toLocaleString()} ₽
                    </div>
                  )}
                  {vacancy.tags && vacancy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {vacancy.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="border-secondary/30 text-secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => {
                        setSelectedVacancy(vacancy);
                        setIsApplyDialogOpen(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
                    >
                      Откликнуться
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary/30"
                      onClick={() => addToFavorites(vacancy.id)}
                    >
                      <Icon name="Heart" size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Загрузка вакансий...</p>
          </div>
        )}

        {!loading && vacancies.length === 0 && (
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <Icon name="Inbox" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Пока нет доступных вакансий</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={selectedVacancy !== null && !isApplyDialogOpen} onOpenChange={(open) => !open && setSelectedVacancy(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedVacancy?.title}</DialogTitle>
          </DialogHeader>
          {selectedVacancy && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="Building2" size={16} />
                  <span>{selectedVacancy.company}</span>
                </div>
                {selectedVacancy.location && (
                  <div className="flex items-center gap-1">
                    <Icon name="MapPin" size={16} />
                    <span>{selectedVacancy.location}</span>
                  </div>
                )}
              </div>

              {selectedVacancy.salary_min && (
                <div className="text-2xl font-bold text-primary">
                  {selectedVacancy.salary_min.toLocaleString()} - {selectedVacancy.salary_max?.toLocaleString()} ₽
                </div>
              )}

              {selectedVacancy.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Описание</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{selectedVacancy.description}</p>
                </div>
              )}

              {selectedVacancy.requirements && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Требования</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{selectedVacancy.requirements}</p>
                </div>
              )}

              {selectedVacancy.tags && selectedVacancy.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Навыки</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVacancy.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="border-secondary/30 text-secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setIsApplyDialogOpen(true)}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
                >
                  Откликнуться
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => addToFavorites(selectedVacancy.id)}
                >
                  <Icon name="Heart" size={18} className="mr-2" />
                  В избранное
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклик на вакансию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-1">{selectedVacancy?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedVacancy?.company}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Сопроводительное письмо</label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Расскажите, почему вы подходите на эту позицию..."
                rows={6}
              />
            </div>
            <Button 
              onClick={applyToVacancy}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
            >
              Отправить отклик
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vacancies;
