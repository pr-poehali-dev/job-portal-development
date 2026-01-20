import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdate('photo_url', base64);
        toast({
          title: 'Успешно',
          description: 'Фото загружено'
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

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

          <div className="md:col-span-2">
            <Label htmlFor="photo_upload">Фото профиля</Label>
            <div className="flex items-center gap-4 mt-2">
              {resumeData.photo_url && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                  <img 
                    src={resumeData.photo_url} 
                    alt="Фото профиля" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  id="photo_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo_upload')?.click()}
                  disabled={uploading}
                  className="w-full border-primary/30"
                >
                  {uploading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" className="mr-2" size={18} />
                      Выбрать фото
                    </>
                  )}
                </Button>
                {resumeData.photo_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate('photo_url', '')}
                    className="w-full mt-2 text-muted-foreground hover:text-destructive"
                  >
                    <Icon name="X" className="mr-2" size={16} />
                    Удалить фото
                  </Button>
                )}
              </div>
            </div>
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