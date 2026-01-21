import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [searchParams] = useSearchParams();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    salaryMin: '',
    salaryMax: '',
    experience: 'all',
    employmentType: 'all'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadVacancies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vacancies, filters]);

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

  const applyFilters = () => {
    let filtered = [...vacancies];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchLower) ||
        v.company.toLowerCase().includes(searchLower) ||
        v.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(v => 
        v.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters.salaryMin) {
      const minSalary = parseInt(filters.salaryMin);
      filtered = filtered.filter(v => 
        v.salary_min && v.salary_min >= minSalary
      );
    }

    if (filters.salaryMax) {
      const maxSalary = parseInt(filters.salaryMax);
      filtered = filtered.filter(v => 
        v.salary_max && v.salary_max <= maxSalary
      );
    }

    if (filters.experience !== 'all') {
      filtered = filtered.filter(v => v.experience === filters.experience);
    }

    if (filters.employmentType !== 'all') {
      filtered = filtered.filter(v => v.employment_type === filters.employmentType);
    }

    setFilteredVacancies(filtered);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      experience: 'all',
      employmentType: 'all'
    });
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

    const token = localStorage.getItem('session_token');
    
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

    const token = localStorage.getItem('session_token');
    
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">Все вакансии</h1>
              <p className="text-muted-foreground">Найдено {filteredVacancies.length} вакансий</p>
            </div>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-primary/30"
            >
              <Icon name="SlidersHorizontal" size={18} className="mr-2" />
              Фильтры
            </Button>
          </div>

          {showFilters && (
            <Card className="glass-effect mb-6 border-primary/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Поиск</Label>
                    <div className="relative">
                      <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        placeholder="Должность, навык..."
                        className="pl-10"
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Город</Label>
                    <div className="relative">
                      <Icon name="MapPin" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        placeholder="Москва, Удалённо..."
                        className="pl-10"
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Тип занятости</Label>
                    <Select value={filters.employmentType} onValueChange={(v) => setFilters({...filters, employmentType: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Любой" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любой</SelectItem>
                        <SelectItem value="Полная занятость">Полная занятость</SelectItem>
                        <SelectItem value="Частичная занятость">Частичная занятость</SelectItem>
                        <SelectItem value="Удалённо">Удалённо</SelectItem>
                        <SelectItem value="Гибрид">Гибрид</SelectItem>
                        <SelectItem value="Проектная работа">Проектная работа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Опыт работы</Label>
                    <Select value={filters.experience} onValueChange={(v) => setFilters({...filters, experience: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Любой" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любой</SelectItem>
                        <SelectItem value="Не требуется">Не требуется</SelectItem>
                        <SelectItem value="1-3 года">1-3 года</SelectItem>
                        <SelectItem value="3-5 лет">3-5 лет</SelectItem>
                        <SelectItem value="5+ лет">5+ лет</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Зарплата от (₽)</Label>
                    <div className="relative">
                      <Icon name="DollarSign" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type="number"
                        placeholder="50000"
                        className="pl-10"
                        value={filters.salaryMin}
                        onChange={(e) => setFilters({...filters, salaryMin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Зарплата до (₽)</Label>
                    <div className="relative">
                      <Icon name="DollarSign" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type="number"
                        placeholder="200000"
                        className="pl-10"
                        value={filters.salaryMax}
                        onChange={(e) => setFilters({...filters, salaryMax: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={applyFilters}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
                  >
                    <Icon name="Check" size={18} className="mr-2" />
                    Применить
                  </Button>
                  <Button onClick={resetFilters} variant="outline">
                    <Icon name="X" size={18} className="mr-2" />
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map((vacancy) => (
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
                  {vacancy.experience && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Briefcase" size={16} />
                      Опыт: {vacancy.experience}
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

        {!loading && filteredVacancies.length === 0 && (
          <Card className="glass-effect border-border/50">
            <CardContent className="p-12 text-center">
              <Icon name="Search" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-2xl font-heading font-bold mb-2">Вакансии не найдены</h3>
              <p className="text-muted-foreground mb-6">Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <Button onClick={resetFilters} variant="outline">
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedVacancy && !isApplyDialogOpen} onOpenChange={(open) => !open && setSelectedVacancy(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">{selectedVacancy?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Building2" size={16} />
                {selectedVacancy?.company}
              </div>
              {selectedVacancy?.location && (
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  {selectedVacancy.location}
                </div>
              )}
              {selectedVacancy?.experience && (
                <div className="flex items-center gap-2">
                  <Icon name="Briefcase" size={16} />
                  {selectedVacancy.experience}
                </div>
              )}
            </div>

            {selectedVacancy?.salary_min && (
              <div className="text-2xl font-bold text-primary">
                {selectedVacancy.salary_min.toLocaleString()} - {selectedVacancy.salary_max?.toLocaleString()} ₽
              </div>
            )}

            <div className="flex gap-2">
              <Badge className="bg-primary/20 text-primary">
                {selectedVacancy?.employment_type || 'Полная занятость'}
              </Badge>
              {selectedVacancy?.tags && selectedVacancy.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-secondary/30 text-secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {selectedVacancy?.description && (
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2">Описание</h3>
                <p className="text-muted-foreground whitespace-pre-line">{selectedVacancy.description}</p>
              </div>
            )}

            {selectedVacancy?.requirements && (
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2">Требования</h3>
                <p className="text-muted-foreground whitespace-pre-line">{selectedVacancy.requirements}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => {
                  setIsApplyDialogOpen(true);
                }}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
              >
                <Icon name="Send" size={18} className="mr-2" />
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
        </DialogContent>
      </Dialog>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклик на вакансию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сопроводительное письмо (опционально)</Label>
              <Textarea
                placeholder="Расскажите, почему вы подходите на эту позицию..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={applyToVacancy}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background"
              >
                <Icon name="Send" size={18} className="mr-2" />
                Отправить отклик
              </Button>
              <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vacancies;
