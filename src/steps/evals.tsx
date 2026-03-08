import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { useStepKeyboard } from '../hooks/useStepKeyboard.js';
import { T } from '../theme.js';
import type { EvalEntry, EvalFormat } from '../types/skill.js';

type EvalPhase = 'prompt' | 'expected';

const MAX_VISIBLE = 5;

interface EvalsProps {
  initialEvals?: EvalEntry[];
  initialEvalFormat?: EvalFormat;
  onNext: (evals: EvalEntry[], evalFormat: EvalFormat) => void;
  onBack: () => void;
  stepNumber?: number;
}

export function Evals({
  initialEvals = [],
  initialEvalFormat = 'claude',
  onNext,
  onBack,
  stepNumber,
}: EvalsProps) {
  const [evals, setEvals] = useState<EvalEntry[]>(initialEvals);
  const [evalFormat, setEvalFormat] = useState<EvalFormat>(initialEvalFormat);
  const [phase, setPhase] = useState<EvalPhase>('prompt');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [expectedInput, setExpectedInput] = useState('');
  const [error, setError] = useState('');

  useStepKeyboard({
    onNext: () => onNext(evals, evalFormat),
    onBack: () => {
      if (phase === 'expected') {
        setPhase('prompt');
        setCurrentPrompt('');
        setPromptInput('');
        setExpectedInput('');
        setError('');
      } else {
        onBack();
      }
    },
  });

  useInput((input, _key) => {
    // Format toggle — only on the prompt phase
    if (phase === 'prompt' && (input === 'f' || input === 'F')) {
      setEvalFormat((prev) => (prev === 'claude' ? 'extended' : 'claude'));
    }
  });

  const handlePromptSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onNext(evals, evalFormat);
      return;
    }
    setError('');
    setCurrentPrompt(trimmed);
    setPromptInput('');
    setPhase('expected');
  };

  const handleExpectedSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Expected output cannot be empty.');
      return;
    }

    const newEval: EvalEntry = {
      id: `eval-${evals.length + 1}`,
      prompt: currentPrompt,
      expected_output: trimmed,
    };

    setError('');
    setEvals((prev) => [...prev, newEval]);
    setCurrentPrompt('');
    setPromptInput('');
    setExpectedInput('');
    setPhase('prompt');
  };

  const expectedLabel = evalFormat === 'claude' ? 'Expected Behavior' : 'Expected Output';
  const title = stepNumber ? `Step ${stepNumber} — Eval Entries` : 'Eval Entries';

  const hint =
    phase === 'prompt'
      ? evals.length === 0
        ? ' Press Enter with empty prompt to skip.'
        : ` ${evals.length} eval(s) added. Empty prompt to continue.`
      : ` Now enter the ${evalFormat === 'claude' ? 'expected behavior' : 'expected output'}.`;

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title={title}
        subtitle="Add prompt + expected output pairs. Leave prompt empty to finish."
      />

      <Box marginBottom={1}>
        <Text color={T.textDim}>{' Format: '}</Text>
        <Text color={evalFormat === 'claude' ? T.success : T.textDim}>{'claude'}</Text>
        <Text color={T.textDim}>{' / '}</Text>
        <Text color={evalFormat === 'extended' ? T.success : T.textDim}>{'extended'}</Text>
        <Text color={T.textDim}>{'  (press F to toggle)'}</Text>
      </Box>

      {evals.length > 0 && (
        <FieldBox title={`Added evals (${evals.length})`} marginTop={1} padding={1} flexShrink={0}>
          <Box flexDirection="column">
            {evals.slice(-MAX_VISIBLE).map((e, i) => {
              const idx = Math.max(0, evals.length - MAX_VISIBLE) + i;
              const prompt = e.prompt.length > 48 ? `${e.prompt.substring(0, 48)}…` : e.prompt;
              return (
                <Text key={e.id}>
                  <Text color={T.textDim}>{`  ${String(idx + 1).padStart(2, ' ')}. `}</Text>
                  <Text color={T.text}>{prompt}</Text>
                  <Text color={T.textDim}>{`   → evals/${e.id}`}</Text>
                </Text>
              );
            })}
            {evals.length > MAX_VISIBLE && (
              <Text color={T.textDim}>{`     … and ${evals.length - MAX_VISIBLE} more`}</Text>
            )}
          </Box>
        </FieldBox>
      )}

      {phase === 'prompt' && (
        <FieldBox
          title={`Eval Prompt  (eval-${evals.length + 1})`}
          focused
          height={3}
          marginTop={1}
        >
          <TextInput
            placeholder="Describe what the user asks  (empty to finish)"
            focus
            value={promptInput}
            onChange={setPromptInput}
            onSubmit={handlePromptSubmit}
          />
        </FieldBox>
      )}

      {phase === 'expected' && (
        <Box flexDirection="column" gap={1}>
          <FieldBox title="Prompt (locked)" height={3} marginTop={1}>
            <Text color={T.textMuted}>{currentPrompt}</Text>
          </FieldBox>
          <FieldBox title={expectedLabel} focused height={3}>
            <TextInput
              placeholder="Describe the expected response from the agent"
              focus
              value={expectedInput}
              onChange={setExpectedInput}
              onSubmit={handleExpectedSubmit}
            />
          </FieldBox>
        </Box>
      )}

      <ErrorLine error={error} hint={hint} />

      <KeyHints
        hints={[
          { key: 'Enter', label: 'Next' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Esc', label: phase === 'expected' ? 'Cancel eval' : 'Back' },
        ]}
      />
    </Box>
  );
}
