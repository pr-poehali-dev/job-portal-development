import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ResumeBasicInfo from '@/components/resume/ResumeBasicInfo';
import ResumeExperience from '@/components/resume/ResumeExperience';
import ResumeEducation from '@/components/resume/ResumeEducation';
import ResumeSkills from '@/components/resume/ResumeSkills';

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

  const updateBasicInfo = (field: string, value: any) => {
    setResumeData({ ...resumeData, [field]: value });
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
          <ResumeBasicInfo 
            resumeData={resumeData}
            onUpdate={updateBasicInfo}
          />

          <ResumeExperience
            experience={resumeData.experience}
            onAdd={addExperience}
            onRemove={removeExperience}
            onUpdate={updateExperience}
          />

          <ResumeEducation
            education={resumeData.education}
            onAdd={addEducation}
            onRemove={removeEducation}
            onUpdate={updateEducation}
          />

          <ResumeSkills
            skills={resumeData.skills}
            onAdd={addSkill}
            onRemove={removeSkill}
            onUpdate={updateSkill}
          />
        </div>
      </div>
    </div>
  );
};

export default Resume;
