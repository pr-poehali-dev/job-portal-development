import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const RESUME_API_URL = 'https://functions.poehali.dev/75a33e6f-3f2f-4f58-9d10-6b8fe65aa44f';

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface Skill {
  skill_name: string;
  skill_level: string;
}

interface ResumeData {
  id?: number;
  title: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  salary_min: number | null;
  salary_max: number | null;
  about_me: string;
  photo_url: string;
  is_published: boolean;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

const Resume = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: 'Моё резюме',
    full_name: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    salary_min: null,
    salary_max: null,
    about_me: '',
    photo_url: '',
    is_published: false,
    experience: [],
    education: [],
    skills: []
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    setResumeData(prev => ({
      ...prev,
      full_name: userData.full_name,
      email: userData.email
    }));

    loadResume();
  }, []);

  const loadResume = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('session_token');

    try {
      const response = await fetch(RESUME_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.resume) {
          setResumeData(data.resume);
          setHasResume(true);
        }
      }
    } catch (error) {
      console.log('Резюме ещё не создано');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('session_token');

    try {
      const method = hasResume ? 'PUT' : 'POST';
      const response = await fetch(RESUME_API_URL, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHasResume(true);
        toast({
          title: 'Успешно сохранено!',
          description: 'Ваше резюме обновлено',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка сохранения',
          description: data.error || 'Не удалось сохранить резюме',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          is_current: false,
          description: ''
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          institution: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          is_current: false
        }
      ]
    });
  };

  const removeEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResumeData({ ...resumeData, education: newEducation });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        { skill_name: '', skill_level: 'Средний' }
      ]
    });
  };

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
    });
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setResumeData({ ...resumeData, skills: newSkills });
  };

  if (isLoading) {
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
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={20} />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Редактор резюме</h1>
          <p className="text-muted-foreground">Создайте профессиональное резюме</p>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" className="text-primary" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">ФИО *</Label>
                  <Input
                    id="full_name"
                    value={resumeData.full_name}
                    onChange={(e) => setResumeData({ ...resumeData, full_name: e.target.value })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Желаемая должность *</Label>
                  <Input
                    id="position"
                    value={resumeData.position}
                    onChange={(e) => setResumeData({ ...resumeData, position: e.target.value })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Город</Label>
                <Input
                  id="location"
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Зарплата от (₽)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={resumeData.salary_min || ''}
                    onChange={(e) => setResumeData({ ...resumeData, salary_min: e.target.value ? parseInt(e.target.value) : null })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Зарплата до (₽)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={resumeData.salary_max || ''}
                    onChange={(e) => setResumeData({ ...resumeData, salary_max: e.target.value ? parseInt(e.target.value) : null })}
                    className="bg-background/50 border-primary/30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="about_me">О себе</Label>
                <Textarea
                  id="about_me"
                  value={resumeData.about_me}
                  onChange={(e) => setResumeData({ ...resumeData, about_me: e.target.value })}
                  className="bg-background/50 border-primary/30 min-h-[100px]"
                  placeholder="Расскажите о себе, своих достижениях и целях"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Briefcase" className="text-secondary" />
                  Опыт работы
                </CardTitle>
                <Button onClick={addExperience} variant="outline" size="sm" className="border-primary/30">
                  <Icon name="Plus" className="mr-2" size={16} />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-4 glass-effect rounded-lg border border-border/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Опыт {index + 1}</h4>
                    <Button
                      onClick={() => removeExperience(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Компания</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div>
                      <Label>Должность</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Начало</Label>
                      <Input
                        type="date"
                        value={exp.start_date ? exp.start_date.split('T')[0] : ''}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div>
                      <Label>Окончание</Label>
                      <Input
                        type="date"
                        value={exp.end_date ? exp.end_date.split('T')[0] : ''}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        disabled={exp.is_current}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      checked={exp.is_current}
                      onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`current-${index}`} className="cursor-pointer">По настоящее время</Label>
                  </div>

                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="bg-background/50 border-primary/30"
                      placeholder="Опишите ваши обязанности и достижения"
                    />
                  </div>
                </div>
              ))}

              {resumeData.experience.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Нажмите "Добавить", чтобы добавить опыт работы</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="GraduationCap" className="text-accent" />
                  Образование
                </CardTitle>
                <Button onClick={addEducation} variant="outline" size="sm" className="border-primary/30">
                  <Icon name="Plus" className="mr-2" size={16} />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="p-4 glass-effect rounded-lg border border-border/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Образование {index + 1}</h4>
                    <Button
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Учебное заведение</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div>
                      <Label>Степень</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="bg-background/50 border-primary/30"
                        placeholder="Бакалавр, Магистр"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Специальность</Label>
                    <Input
                      value={edu.field_of_study}
                      onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                      className="bg-background/50 border-primary/30"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Начало</Label>
                      <Input
                        type="date"
                        value={edu.start_date ? edu.start_date.split('T')[0] : ''}
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                    <div>
                      <Label>Окончание</Label>
                      <Input
                        type="date"
                        value={edu.end_date ? edu.end_date.split('T')[0] : ''}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                        disabled={edu.is_current}
                        className="bg-background/50 border-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edu-current-${index}`}
                      checked={edu.is_current}
                      onChange={(e) => updateEducation(index, 'is_current', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`edu-current-${index}`} className="cursor-pointer">Учусь в настоящее время</Label>
                  </div>
                </div>
              ))}

              {resumeData.education.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Нажмите "Добавить", чтобы добавить образование</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" className="text-primary" />
                  Навыки
                </CardTitle>
                <Button onClick={addSkill} variant="outline" size="sm" className="border-primary/30">
                  <Icon name="Plus" className="mr-2" size={16} />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={skill.skill_name}
                      onChange={(e) => updateSkill(index, 'skill_name', e.target.value)}
                      placeholder="Навык"
                      className="flex-1 bg-background/50 border-primary/30"
                    />
                    <select
                      value={skill.skill_level}
                      onChange={(e) => updateSkill(index, 'skill_level', e.target.value)}
                      className="bg-background/50 border border-primary/30 rounded-md px-3 py-2"
                    >
                      <option>Начальный</option>
                      <option>Средний</option>
                      <option>Продвинутый</option>
                      <option>Эксперт</option>
                    </select>
                    <Button
                      onClick={() => removeSkill(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              {resumeData.skills.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Нажмите "Добавить", чтобы добавить навыки</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Resume;
