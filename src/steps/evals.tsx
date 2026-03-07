import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { T } from '../theme.js';
import type { EvalEntry } from '../types/skill.js';

type EvalPhase = 'prompt' | 'expected';

interface EvalsProps {
  initialEvals?: EvalEntry[];
  onNext: (evals: EvalEntry[]) => void;
  onBack: () => void;
}

export function Evals({ initialEvals = [], onNext, onBack }: EvalsProps) {
  const [evals, setEvals] = useState<EvalEntry[]>(initialEvals);
  const [phase, setPhase] = useState<EvalPhase>('prompt');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [expectedInput, setExpectedInput] = useState('');
  const [error, setError] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      if (phase === 'expected') {
        setPhase('prompt');
        setCurrentPrompt('');
        setPromptInput('');
        setExpectedInput('');
        setError('');
      } else {
        onBack();
      }
      return;
    }

    if (key.ctrl && input === 's') {
      onNext(evals);
    }
  });

  const handlePromptSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onNext(evals);
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

  const hint =
    phase === 'prompt'
      ? evals.length === 0
        ? ' Press Enter with empty prompt to skip.'
        : ` ${evals.length} eval(s) added. Empty prompt to continue.`
      : ' Now enter the expected output for this eval.';

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 5 — Eval Entries"
        subtitle="Add prompt + expected output pairs. Leave prompt empty to finish."
      />

      {evals.length > 0 && (
        <FieldBox title={`Added evals (${evals.length})`} marginTop={1} padding={1}>
          <Box flexDirection="column">
            {evals.map((e) => (
              <Text key={e.id}>
                <Text color={T.success}>{'  + '}</Text>
                <Text color={T.accentText}>{e.id}</Text>
                <Text color={T.textDim}>{'  '}</Text>
                <Text color={T.text}>{e.prompt.substring(0, 50)}</Text>
                {e.prompt.length > 50 && <Text color={T.textDim}>{'...'}</Text>}
              </Text>
            ))}
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
          <FieldBox title="Expected Output" focused height={3}>
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
