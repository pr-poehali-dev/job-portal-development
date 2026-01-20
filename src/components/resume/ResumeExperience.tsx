import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

interface ResumeExperienceProps {
  experience: Experience[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Experience, value: any) => void;
}

const ResumeExperience = ({ experience, onAdd, onRemove, onUpdate }: ResumeExperienceProps) => {
  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading">Опыт работы</CardTitle>
          <Button
            onClick={onAdd}
            variant="outline"
            size="sm"
            className="border-primary/30"
          >
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {experience.map((exp, index) => (
          <div key={index} className="p-4 rounded-lg border border-border/50 space-y-4 relative">
            <Button
              onClick={() => onRemove(index)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
            >
              <Icon name="X" size={16} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Компания *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => onUpdate(index, 'company', e.target.value)}
                  placeholder="Название компании"
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Должность *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => onUpdate(index, 'position', e.target.value)}
                  placeholder="Ваша должность"
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Дата начала</Label>
                <Input
                  type="month"
                  value={exp.start_date}
                  onChange={(e) => onUpdate(index, 'start_date', e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Дата окончания</Label>
                <Input
                  type="month"
                  value={exp.end_date}
                  onChange={(e) => onUpdate(index, 'end_date', e.target.value)}
                  disabled={exp.is_current}
                  className="bg-background/50 border-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`current-${index}`}
                checked={exp.is_current}
                onChange={(e) => onUpdate(index, 'is_current', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={`current-${index}`} className="cursor-pointer">
                Работаю сейчас
              </Label>
            </div>

            <div>
              <Label>Описание обязанностей</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                placeholder="Опишите ваши обязанности и достижения..."
                className="bg-background/50 border-primary/30"
              />
            </div>
          </div>
        ))}

        {experience.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Briefcase" className="mx-auto mb-2" size={32} />
            <p>Нет опыта работы</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeExperience;
