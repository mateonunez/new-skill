import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SkillConfig } from '../types/skill.js';
import { generateAgentsMd } from './agents-md.js';
import { generateAgentsFiles } from './agents-yml.js';
import { generateEvalsJson } from './evals-json.js';
import { generateRuleMd } from './rule-md.js';
import { generateSkillMd } from './skill-md.js';

export interface GenerateResult {
  paths: string[];
  baseDir: string;
}

export async function generateSkill(config: SkillConfig): Promise<GenerateResult> {
  const baseDir = join(config.outputDir, config.name);
  const paths: string[] = [];

  await mkdir(baseDir, { recursive: true });

  // SKILL.md — always written
  const skillMdPath = join(baseDir, 'SKILL.md');
  await writeFile(skillMdPath, generateSkillMd(config), 'utf-8');
  paths.push(skillMdPath);

  // AGENTS.md — optional universal instructions
  if (config.features.agentsMd) {
    const agentsMdPath = join(baseDir, 'AGENTS.md');
    await writeFile(agentsMdPath, generateAgentsMd(config), 'utf-8');
    paths.push(agentsMdPath);
  }

  // rules/<name>.md — conditional
  if (config.features.rules && config.rules.length > 0) {
    const rulesDir = join(baseDir, 'rules');
    await mkdir(rulesDir, { recursive: true });
    for (const rule of config.rules) {
      const rulePath = join(rulesDir, `${rule}.md`);
      await writeFile(rulePath, generateRuleMd(rule), 'utf-8');
      paths.push(rulePath);
    }
  }

  // evals/evals.json — conditional
  if (config.features.evals && config.evals.length > 0) {
    const evalsDir = join(baseDir, 'evals');
    await mkdir(evalsDir, { recursive: true });
    const evalsPath = join(evalsDir, 'evals.json');
    await writeFile(evalsPath, generateEvalsJson(config), 'utf-8');
    paths.push(evalsPath);
  }

  // agents/<target>.yml — one file per selected target
  if (config.features.agents) {
    const agentsDir = join(baseDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    const files = generateAgentsFiles(config);
    for (const [filename, content] of Object.entries(files)) {
      const agentPath = join(agentsDir, filename);
      await writeFile(agentPath, content, 'utf-8');
      paths.push(agentPath);
    }
  }

  // assets/ with placeholder icon stubs
  if (config.features.assets) {
    const assetsDir = join(baseDir, 'assets');
    await mkdir(assetsDir, { recursive: true });
    // Write minimal placeholder PNGs (1x1 transparent) so paths are real files
    const placeholder = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    for (const name of ['icon-small.png', 'icon-large.png']) {
      const iconPath = join(assetsDir, name);
      await writeFile(iconPath, placeholder);
      paths.push(iconPath);
    }
  }

  return { paths, baseDir };
}

/** Build a tree-view string representation of what will be generated. */
export function buildFileTree(config: SkillConfig): string[] {
  const lines: string[] = [`${config.name}/`, `  SKILL.md`];

  if (config.features.agentsMd) {
    lines.push('  AGENTS.md');
  }

  if (config.features.agents) {
    const agentTargets = config.agentTargets.length > 0 ? config.agentTargets : ['openai'];
    const fileNames: Record<string, string> = {
      openai: 'openai.yml',
      'claude-code': 'claude.yml',
      generic: 'agents.yml',
    };
    lines.push('  agents/');
    for (const target of agentTargets) {
      const fn = fileNames[target];
      if (fn) lines.push(`    ${fn}`);
    }
  }

  if (config.features.evals && config.evals.length > 0) {
    lines.push('  evals/', '    evals.json');
  }

  if (config.features.rules && config.rules.length > 0) {
    lines.push('  rules/');
    for (const rule of config.rules) {
      lines.push(`    ${rule}.md`);
    }
  }

  if (config.features.assets) {
    lines.push('  assets/', '    icon-small.png', '    icon-large.png');
  }

  return lines;
}
