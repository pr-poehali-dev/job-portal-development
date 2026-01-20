import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ResumeBasicInfoProps {
  resumeData: {
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
  };
  onUpdate: (field: string, value: any) => void;
}

const ResumeBasicInfo = ({ resumeData, onUpdate }: ResumeBasicInfoProps) => {
  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="font-heading">Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">ФИО *</Label>
            <Input
              id="full_name"
              value={resumeData.full_name}
              onChange={(e) => onUpdate('full_name', e.target.value)}
              placeholder="Иванов Иван Иванович"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="position">Желаемая должность *</Label>
            <Input
              id="position"
              value={resumeData.position}
              onChange={(e) => onUpdate('position', e.target.value)}
              placeholder="Frontend разработчик"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={resumeData.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="email@example.com"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={resumeData.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              placeholder="+7 (999) 999-99-99"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="location">Город</Label>
            <Input
              id="location"
              value={resumeData.location}
              onChange={(e) => onUpdate('location', e.target.value)}
              placeholder="Москва"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="photo_url">Фото (URL)</Label>
            <Input
              id="photo_url"
              value={resumeData.photo_url}
              onChange={(e) => onUpdate('photo_url', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="salary_min">Зарплата от (₽)</Label>
            <Input
              id="salary_min"
              type="number"
              value={resumeData.salary_min || ''}
              onChange={(e) => onUpdate('salary_min', e.target.value ? Number(e.target.value) : null)}
              placeholder="100000"
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="salary_max">Зарплата до (₽)</Label>
            <Input
              id="salary_max"
              type="number"
              value={resumeData.salary_max || ''}
              onChange={(e) => onUpdate('salary_max', e.target.value ? Number(e.target.value) : null)}
              placeholder="200000"
              className="bg-background/50 border-primary/30"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="about_me">О себе</Label>
          <Textarea
            id="about_me"
            value={resumeData.about_me}
            onChange={(e) => onUpdate('about_me', e.target.value)}
            placeholder="Расскажите о себе, своих достижениях и целях..."
            className="bg-background/50 border-primary/30 min-h-32"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeBasicInfo;
