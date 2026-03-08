import type { EvalFormat, SkillConfig } from '../types/skill.js';

/**
 * Claude spec format:
 * Array of { skills, query, files, expected_behavior }
 * https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
 */
function toClaudeFormat(config: SkillConfig): string {
  const items = config.evals.map((e) => ({
    skills: [config.name],
    query: e.prompt,
    files: [] as string[],
    expected_behavior: [e.expected_output],
  }));
  return JSON.stringify(items, null, 2);
}

/**
 * Extended format: richer envelope with skill_name + full eval entries.
 * Useful for custom evaluation pipelines.
 */
function toExtendedFormat(config: SkillConfig): string {
  const evals = config.evals.map((e) => ({
    id: e.id,
    prompt: e.prompt,
    expected_output: e.expected_output,
    files: [] as string[],
    expectations: [] as string[],
  }));
  return JSON.stringify({ skill_name: config.name, evals }, null, 2);
}

export function generateEvalsJson(config: SkillConfig, format?: EvalFormat): string {
  const fmt = format ?? config.evalFormat ?? 'claude';
  return fmt === 'claude' ? toClaudeFormat(config) : toExtendedFormat(config);
}
