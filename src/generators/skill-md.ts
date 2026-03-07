import { render } from '../templates/engine.js';
import skillTemplate from '../templates/skill.md' with { type: 'text' };
import type { SkillConfig } from '../types/skill.js';

export function generateSkillMd(config: SkillConfig): string {
  return render(skillTemplate, {
    name: config.name,
    description: config.description,
  });
}
