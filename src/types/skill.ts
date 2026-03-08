export type EvalFormat = 'claude' | 'extended';

/** An evaluation entry. Stored in unified shape; serialized to the selected format at generation time. */
export interface EvalEntry {
  id: string;
  /** The user-facing prompt / query. */
  prompt: string;
  /** Expected agent response. Multi-expectation is future scope; stored as single string for now. */
  expected_output: string;
}

/** Available agent config target IDs. */
export type AgentTarget = 'openai' | 'claude-code' | 'generic';

export const AGENT_TARGETS: { id: AgentTarget; label: string; file: string; desc: string }[] = [
  {
    id: 'openai',
    label: 'OpenAI / Codex',
    file: 'agents/openai.yml',
    desc: 'Codex CLI agent config',
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    file: 'agents/claude.yml',
    desc: 'Claude Code agent config',
  },
  { id: 'generic', label: 'Generic', file: 'agents/agents.yml', desc: 'Platform-agnostic YAML' },
];

export interface SkillConfig {
  name: string;
  description: string;
  outputDir: string;
  features: {
    rules: boolean;
    evals: boolean;
    agents: boolean;
    assets: boolean;
    agentsMd: boolean;
  };
  rules: string[];
  evals: EvalEntry[];
  evalFormat: EvalFormat;
  agentDisplayName: string;
  /** Which agent YAML configs to generate when features.agents is true. */
  agentTargets: AgentTarget[];
}

export const STEPS = {
  WELCOME: 0,
  METADATA: 1,
  FEATURES: 2,
  RULES: 3,
  EVALS: 4,
  PREVIEW: 5,
  DONE: 6,
} as const;

export type Step = (typeof STEPS)[keyof typeof STEPS];

export const TOTAL_STEPS = Object.keys(STEPS).length;

export const defaultConfig: SkillConfig = {
  name: '',
  description: '',
  outputDir: '.',
  features: {
    rules: false,
    evals: false,
    agents: false,
    assets: false,
    agentsMd: false,
  },
  rules: [],
  evals: [],
  evalFormat: 'claude',
  agentDisplayName: '',
  agentTargets: ['openai'],
};
