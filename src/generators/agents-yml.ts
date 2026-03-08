import type { AgentTarget, SkillConfig } from '../types/skill.js';

function displayName(config: SkillConfig): string {
  return config.agentDisplayName || config.name;
}

function shortDesc(config: SkillConfig): string {
  return config.description.split('\n')[0].substring(0, 80);
}

export function generateOpenAiYml(config: SkillConfig): string {
  return `display_name: ${displayName(config)}
short_description: ${shortDesc(config)}
icon_small: assets/icon-small.png
icon_large: assets/icon-large.png
`;
}

export function generateClaudeYml(config: SkillConfig): string {
  return `name: ${config.name}
description: ${shortDesc(config)}
allowed-tools: []
icon: assets/icon-small.png
`;
}

export function generateGenericYml(config: SkillConfig): string {
  return `display_name: ${displayName(config)}
description: ${shortDesc(config)}
icon: assets/icon-small.png
`;
}

const GENERATORS: Record<AgentTarget, (config: SkillConfig) => string> = {
  openai: generateOpenAiYml,
  'claude-code': generateClaudeYml,
  generic: generateGenericYml,
};

const FILE_NAMES: Record<AgentTarget, string> = {
  openai: 'openai.yml',
  'claude-code': 'claude.yml',
  generic: 'agents.yml',
};

/**
 * Returns a map of filename → content for every selected agent target.
 * Falls back to openai.yml if no targets are selected.
 */
export function generateAgentsFiles(config: SkillConfig): Record<string, string> {
  const targets = config.agentTargets.length > 0 ? config.agentTargets : ['openai' as AgentTarget];
  const result: Record<string, string> = {};
  for (const target of targets) {
    const gen = GENERATORS[target];
    const filename = FILE_NAMES[target];
    if (gen && filename) {
      result[filename] = gen(config);
    }
  }
  return result;
}
