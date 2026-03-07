export interface EvalEntry {
  id: string;
  prompt: string;
  expected_output: string;
}

export interface SkillConfig {
  name: string;
  description: string;
  outputDir: string;
  features: {
    rules: boolean;
    evals: boolean;
    agents: boolean;
    assets: boolean;
  };
  rules: string[];
  evals: EvalEntry[];
  agentDisplayName: string;
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
  },
  rules: [],
  evals: [],
  agentDisplayName: '',
};
