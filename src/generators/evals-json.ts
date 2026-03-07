import type { SkillConfig } from '../types/skill.js';

export function generateEvalsJson(config: SkillConfig): string {
  const evals = config.evals.map((e) => ({
    id: e.id,
    prompt: e.prompt,
    expected_output: e.expected_output,
    files: [],
    expectations: [],
  }));

  return JSON.stringify(
    {
      skill_name: config.name,
      evals,
    },
    null,
    2,
  );
}
