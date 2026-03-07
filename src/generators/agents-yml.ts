import type { SkillConfig } from '../types/skill.js';

export function generateAgentsYml(config: SkillConfig): string {
  const displayName = config.agentDisplayName || config.name;
  const shortDesc = config.description.split('\n')[0].substring(0, 80);

  return `display_name: ${displayName}
short_description: ${shortDesc}
icon_small: assets/icon-small.png
icon_large: assets/icon-large.png
`;
}
