import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SkillConfig } from '../types/skill.js';
import { generateAgentsYml } from './agents-yml.js';
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

  // Create root directory
  await mkdir(baseDir, { recursive: true });

  // SKILL.md — always written
  const skillMdPath = join(baseDir, 'SKILL.md');
  await writeFile(skillMdPath, generateSkillMd(config), 'utf-8');
  paths.push(skillMdPath);

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

  // agents/openai.yml — conditional
  if (config.features.agents) {
    const agentsDir = join(baseDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    const agentsPath = join(agentsDir, 'openai.yml');
    await writeFile(agentsPath, generateAgentsYml(config), 'utf-8');
    paths.push(agentsPath);
  }

  // assets/ placeholder — conditional
  if (config.features.assets) {
    const assetsDir = join(baseDir, 'assets');
    await mkdir(assetsDir, { recursive: true });
    await writeFile(join(assetsDir, '.gitkeep'), '', 'utf-8');
    paths.push(join(assetsDir, '.gitkeep'));
  }

  return { paths, baseDir };
}

/** Build a tree-view string representation of what will be generated. */
export function buildFileTree(config: SkillConfig): string[] {
  const lines: string[] = [`${config.name}/`, `  SKILL.md`];

  if (config.features.agents) {
    lines.push('  agents/', '    openai.yml');
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
    lines.push('  assets/', '    (place icons here)');
  }

  return lines;
}
