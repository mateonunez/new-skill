import { useKeyboard } from '@opentui/react';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { T } from '../theme.js';
import type { EvalEntry } from '../types/skill.js';
import { onInputSubmit } from '../utils/input.js';

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
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState('');

  useKeyboard((key) => {
    if (key.name === 'escape') {
      if (phase === 'expected') {
        setPhase('prompt');
        setCurrentPrompt('');
        setInputKey((k) => k + 1);
        setError('');
      } else {
        onBack();
      }
      return;
    }

    if (key.ctrl && key.name === 's') {
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
    setPhase('expected');
    setInputKey((k) => k + 1);
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
    setPhase('prompt');
    setInputKey((k) => k + 1);
  };

  const hint =
    phase === 'prompt'
      ? evals.length === 0
        ? ' Press Enter with empty prompt to skip.'
        : ` ${evals.length} eval(s) added. Empty prompt to continue.`
      : ' Now enter the expected output for this eval.';

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 5 — Eval Entries"
        subtitle="Add prompt + expected output pairs. Leave prompt empty to finish."
      />

      {evals.length > 0 && (
        <FieldBox title={`Added evals (${evals.length})`} marginTop={1} padding={1}>
          {evals.map((e) => (
            <text key={e.id}>
              <span fg={T.success}>{'  + '}</span>
              <span fg={T.accentText}>{e.id}</span>
              <span fg={T.textDim}>{'  '}</span>
              <span fg={T.text}>{e.prompt.substring(0, 50)}</span>
              {e.prompt.length > 50 && <span fg={T.textDim}>{'...'}</span>}
            </text>
          ))}
        </FieldBox>
      )}

      {phase === 'prompt' && (
        <FieldBox
          title={`Eval Prompt  (eval-${evals.length + 1})`}
          focused
          height={3}
          marginTop={1}
        >
          <input
            key={inputKey}
            placeholder="Describe what the user asks  (empty to finish)"
            focused
            onSubmit={onInputSubmit(handlePromptSubmit)}
          />
        </FieldBox>
      )}

      {phase === 'expected' && (
        <>
          <FieldBox title="Prompt (locked)" height={3} marginTop={1}>
            <input value={currentPrompt} focused={false} />
          </FieldBox>
          <FieldBox title="Expected Output" focused height={3}>
            <input
              key={inputKey}
              placeholder="Describe the expected response from the agent"
              focused
              onSubmit={onInputSubmit(handleExpectedSubmit)}
            />
          </FieldBox>
        </>
      )}

      <ErrorLine error={error} hint={hint} />

      <KeyHints
        hints={[
          { key: 'Enter', label: 'Next   ' },
          { key: 'Ctrl+S', label: 'Continue   ' },
          { key: 'Esc', label: phase === 'expected' ? 'Cancel eval' : 'Back' },
        ]}
      />
    </box>
  );
}
