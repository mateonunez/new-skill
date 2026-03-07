#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { createElement } from 'react';
import { App } from './app.js';
import { generateSkill } from './generators/index.js';
import type { SkillConfig } from './types/skill.js';
import { defaultConfig } from './types/skill.js';

async function runInteractive(): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  createRoot(renderer).render(createElement(App));
}

async function runNonInteractive(args: {
  name: string;
  output?: string;
  description?: string;
  rules?: string;
  evals?: string;
  agents?: boolean;
  assets?: boolean;
}): Promise<void> {
  const config: SkillConfig = {
    ...defaultConfig,
    name: args.name,
    outputDir: args.output ?? '.',
    description: args.description ?? `Use this skill when you need to work with ${args.name}.`,
    agentDisplayName: args.name,
    features: {
      rules: Boolean(args.rules),
      evals: Boolean(args.evals),
      agents: Boolean(args.agents),
      assets: Boolean(args.assets),
    },
    rules: args.rules
      ? args.rules
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      : [],
    evals: [],
  };

  console.log(`Generating skill "${config.name}" → ${config.outputDir}/${config.name}/`);

  const { paths } = await generateSkill(config);

  console.log(`\n✓ Done! Generated ${paths.length} file(s):`);
  for (const p of paths) {
    console.log(`  ${p}`);
  }
  console.log(`\ncd ${config.outputDir}/${config.name} && start editing!`);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      name: { type: 'string', short: 'n' },
      output: { type: 'string', short: 'o' },
      description: { type: 'string', short: 'd' },
      rules: { type: 'string' },
      agents: { type: 'boolean' },
      assets: { type: 'boolean' },
      'no-interactive': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.help) {
    console.log(`
new-skill — CLI to scaffold new skills

USAGE
  new-skill                         Interactive wizard (default)
  new-skill --no-interactive \\
    --name <name> [options]         Non-interactive mode

OPTIONS
  -n, --name <name>         Skill name (kebab-case)
  -o, --output <dir>        Output directory (default: .)
  -d, --description <text>  Skill description
  --rules <r1,r2>           Comma-separated rule names
  --agents                  Generate agents/openai.yml
  --assets                  Create assets/ directory
  --no-interactive          Skip the TUI wizard
  -h, --help                Show this help

EXAMPLES
  new-skill
  new-skill --no-interactive --name shadcn --output ./skills
  new-skill --no-interactive --name my-skill --rules no-var,prefer-const --agents
`);
    process.exit(0);
  }

  if (values['no-interactive']) {
    const name = (values.name as string | undefined) ?? positionals[0];
    if (!name) {
      console.error(
        'Error: --name is required in non-interactive mode. Run with --help for usage.',
      );
      process.exit(1);
    }
    await runNonInteractive({
      name,
      output: values.output as string | undefined,
      description: values.description as string | undefined,
      rules: values.rules as string | undefined,
      agents: values.agents as boolean | undefined,
      assets: values.assets as boolean | undefined,
    });
    return;
  }

  await runInteractive();
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
