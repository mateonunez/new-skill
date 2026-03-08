import type { SkillConfig } from '../types/skill.js';

export function generateAgentsMd(config: SkillConfig): string {
  const displayName = config.agentDisplayName || config.name;
  const shortDesc = config.description.split('\n')[0].substring(0, 80);

  return `# ${displayName}

${shortDesc}

## When to use

${config.description}

## Instructions

Follow the patterns defined in \`SKILL.md\`. Refer to bundled reference files as needed.
`;
}
