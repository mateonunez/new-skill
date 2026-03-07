import { Box, Text } from 'ink';
import { useCallback, useState } from 'react';
import { generateSkill } from './generators/index.js';
import { Done } from './steps/done.js';
import { Evals } from './steps/evals.js';
import { Features } from './steps/features.js';
import { Metadata } from './steps/metadata.js';
import { Preview } from './steps/preview.js';
import { Rules } from './steps/rules.js';
import { Welcome } from './steps/welcome.js';
import { T } from './theme.js';
import type { EvalEntry, SkillConfig } from './types/skill.js';
import { defaultConfig, STEPS } from './types/skill.js';

function getNextStep(step: number, config: SkillConfig): number {
  switch (step) {
    case STEPS.WELCOME:
      return STEPS.METADATA;
    case STEPS.METADATA:
      return STEPS.FEATURES;
    case STEPS.FEATURES:
      if (config.features.rules) return STEPS.RULES;
      if (config.features.evals) return STEPS.EVALS;
      return STEPS.PREVIEW;
    case STEPS.RULES:
      if (config.features.evals) return STEPS.EVALS;
      return STEPS.PREVIEW;
    case STEPS.EVALS:
      return STEPS.PREVIEW;
    case STEPS.PREVIEW:
      return STEPS.DONE;
    default:
      return step;
  }
}

function getPrevStep(step: number, config: SkillConfig): number {
  switch (step) {
    case STEPS.METADATA:
      return STEPS.WELCOME;
    case STEPS.FEATURES:
      return STEPS.METADATA;
    case STEPS.RULES:
      return STEPS.FEATURES;
    case STEPS.EVALS:
      return config.features.rules ? STEPS.RULES : STEPS.FEATURES;
    case STEPS.PREVIEW:
      if (config.features.evals) return STEPS.EVALS;
      if (config.features.rules) return STEPS.RULES;
      return STEPS.FEATURES;
    default:
      return Math.max(0, step - 1);
  }
}

const STEP_LABELS = ['Welcome', 'Metadata', 'Features', 'Rules', 'Evals', 'Preview', 'Done'];

export function App() {
  const [step, setStep] = useState<number>(STEPS.WELCOME);
  const [config, setConfig] = useState<SkillConfig>(defaultConfig);
  const [generatedPaths, setGeneratedPaths] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const applyAndAdvance = useCallback(
    (updates?: Partial<SkillConfig>) => {
      const newConfig = updates ? { ...config, ...updates } : config;
      if (updates) setConfig(newConfig);

      if (step === STEPS.PREVIEW) {
        setGenerating(true);
        setGenerateError('');
        generateSkill(newConfig)
          .then(({ paths }) => {
            setGeneratedPaths(paths);
            setGenerating(false);
            setStep(STEPS.DONE);
          })
          .catch((err: unknown) => {
            setGenerateError(err instanceof Error ? err.message : String(err));
            setGenerating(false);
          });
        return;
      }

      setStep(getNextStep(step, newConfig));
    },
    [step, config],
  );

  const handleBack = useCallback(() => {
    setStep(getPrevStep(step, config));
  }, [step, config]);

  const stepLabel = STEP_LABELS[step] ?? '';
  const progressBar = (() => {
    if (step >= STEPS.DONE) return '';
    const filled = Math.round((step / (STEPS.DONE - 1)) * 20);
    return '━'.repeat(filled) + '─'.repeat(20 - filled);
  })();

  return (
    <Box flexDirection="column">
      {/* Top bar */}
      <Box flexDirection="row" paddingX={2}>
        <Text>
          <Text bold color={T.text}>
            {'new-skill'}
          </Text>
          <Text color={T.textDim}>{'  ·  '}</Text>
          <Text color={T.accentText}>{stepLabel}</Text>
          {step < STEPS.DONE && (
            <>
              <Text color={T.textDim}>{'  ·  '}</Text>
              <Text color={T.textDim}>{progressBar}</Text>
              <Text color={T.textMuted}>{`  ${step + 1} / ${STEPS.DONE - 1}`}</Text>
            </>
          )}
        </Text>
      </Box>

      {/* Step content */}
      <Box flexDirection="column">
        {step === STEPS.WELCOME && (
          <Welcome
            initialName={config.name}
            initialOutputDir={config.outputDir}
            onNext={(name, outputDir) => applyAndAdvance({ name, outputDir })}
          />
        )}

        {step === STEPS.METADATA && (
          <Metadata
            initialDescription={config.description}
            onNext={(description) => applyAndAdvance({ description })}
            onBack={handleBack}
          />
        )}

        {step === STEPS.FEATURES && (
          <Features
            initialFeatures={config.features}
            initialAgentDisplayName={config.agentDisplayName}
            onNext={(features, agentDisplayName) => applyAndAdvance({ features, agentDisplayName })}
            onBack={handleBack}
          />
        )}

        {step === STEPS.RULES && (
          <Rules
            initialRules={config.rules}
            onNext={(rules) => applyAndAdvance({ rules })}
            onBack={handleBack}
          />
        )}

        {step === STEPS.EVALS && (
          <Evals
            initialEvals={config.evals}
            onNext={(evals: EvalEntry[]) => applyAndAdvance({ evals })}
            onBack={handleBack}
          />
        )}

        {step === STEPS.PREVIEW && (
          <Preview
            config={config}
            generating={generating}
            generateError={generateError}
            onConfirm={() => applyAndAdvance()}
            onBack={handleBack}
          />
        )}

        {step === STEPS.DONE && <Done config={config} generatedPaths={generatedPaths} />}
      </Box>
    </Box>
  );
}
