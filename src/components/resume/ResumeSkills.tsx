import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Skill {
  skill_name: string;
  skill_level: string;
}

interface ResumeSkillsProps {
  skills: Skill[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Skill, value: string) => void;
}

const ResumeSkills = ({ skills, onAdd, onRemove, onUpdate }: ResumeSkillsProps) => {
  const skillLevels = ['Начальный', 'Средний', 'Продвинутый', 'Эксперт'];

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading">Навыки</CardTitle>
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
      <CardContent className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={skill.skill_name}
                onChange={(e) => onUpdate(index, 'skill_name', e.target.value)}
                placeholder="Название навыка (React, TypeScript...)"
                className="bg-background/50 border-primary/30"
              />
            </div>

            <div className="w-48">
              <select
                value={skill.skill_level}
                onChange={(e) => onUpdate(index, 'skill_level', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-primary/30 bg-background/50 text-sm"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => onRemove(index)}
              variant="ghost"
              size="icon"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Award" className="mx-auto mb-2" size={32} />
            <p>Нет навыков</p>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <Label className="mb-3 block">Предпросмотр:</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {skill.skill_name} ({skill.skill_level})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeSkills;
