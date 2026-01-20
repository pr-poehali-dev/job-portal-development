import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface ResumeEducationProps {
  education: Education[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Education, value: any) => void;
}

const ResumeEducation = ({ education, onAdd, onRemove, onUpdate }: ResumeEducationProps) => {
  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading">Образование</CardTitle>
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
        {education.map((edu, index) => (
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
                <Label>Учебное заведение *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                  placeholder="МГУ им. Ломоносова"
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Степень</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                  placeholder="Бакалавр"
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Специальность</Label>
                <Input
                  value={edu.field_of_study}
                  onChange={(e) => onUpdate(index, 'field_of_study', e.target.value)}
                  placeholder="Информатика и вычислительная техника"
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Год начала</Label>
                <Input
                  type="month"
                  value={edu.start_date}
                  onChange={(e) => onUpdate(index, 'start_date', e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>

              <div>
                <Label>Год окончания</Label>
                <Input
                  type="month"
                  value={edu.end_date}
                  onChange={(e) => onUpdate(index, 'end_date', e.target.value)}
                  disabled={edu.is_current}
                  className="bg-background/50 border-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`edu-current-${index}`}
                checked={edu.is_current}
                onChange={(e) => onUpdate(index, 'is_current', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={`edu-current-${index}`} className="cursor-pointer">
                Учусь сейчас
              </Label>
            </div>
          </div>
        ))}

        {education.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="GraduationCap" className="mx-auto mb-2" size={32} />
            <p>Нет образования</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeEducation;
