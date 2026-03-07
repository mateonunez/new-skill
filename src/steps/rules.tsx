import { useKeyboard } from '@opentui/react';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { T } from '../theme.js';
import { onInputSubmit } from '../utils/input.js';
import { KEBAB_RE } from '../utils/validation.js';

const MAX_VISIBLE = 5;

interface RulesProps {
  initialRules?: string[];
  onNext: (rules: string[]) => void;
  onBack: () => void;
}

export function Rules({ initialRules = [], onNext, onBack }: RulesProps) {
  const [rules, setRules] = useState<string[]>(initialRules);
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState('');

  useKeyboard((key) => {
    if (key.name === 'escape') {
      onBack();
      return;
    }

    if (key.ctrl && key.name === 's') {
      onNext(rules);
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim().toLowerCase().replace(/\s+/g, '-');

    if (!trimmed) {
      onNext(rules);
      return;
    }

    if (!KEBAB_RE.test(trimmed)) {
      setError('Rule name must be kebab-case (e.g. no-var).');
      return;
    }

    if (rules.includes(trimmed)) {
      setError(`Rule "${trimmed}" already added.`);
      return;
    }

    setError('');
    setRules((prev) => [...prev, trimmed]);
    setInputKey((k) => k + 1);
  };

  const hint =
    rules.length === 0
      ? ' Press Enter with empty input to skip and continue.'
      : ` ${rules.length} rule(s) added. Empty Enter to continue.`;

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 4 — Rules"
        subtitle="Add rule names (kebab-case). Each rule gets an Incorrect / Correct stub."
      />

      <FieldBox title={`Rules (${rules.length})`} marginTop={1} padding={1} flexShrink={0}>
        {rules.length === 0 ? (
          <text fg={T.textDim}>{'  No rules added yet.'}</text>
        ) : (
          <>
            {rules.slice(-MAX_VISIBLE).map((rule, i) => {
              const idx = Math.max(0, rules.length - MAX_VISIBLE) + i;
              return (
                <text key={rule}>
                  <span fg={T.textDim}>{`  ${String(idx + 1).padStart(2, ' ')}. `}</span>
                  <span fg={T.text}>{rule}</span>
                  <span fg={T.textDim}>{`   → rules/${rule}.md`}</span>
                </text>
              );
            })}
            {rules.length > MAX_VISIBLE && (
              <text fg={T.textDim}>{`     … and ${rules.length - MAX_VISIBLE} more`}</text>
            )}
          </>
        )}
      </FieldBox>

      <FieldBox title="Add Rule Name" focused height={3} marginTop={1}>
        <input
          key={inputKey}
          placeholder="e.g. no-var  (Enter to add, empty Enter to finish)"
          focused
          onSubmit={onInputSubmit(handleSubmit)}
        />
      </FieldBox>

      <ErrorLine error={error} hint={hint} />

      <KeyHints
        hints={[
          { key: 'Enter', label: 'Add rule   ' },
          { key: 'Enter (empty)', label: '/ ' },
          { key: 'Ctrl+S', label: 'Continue   ' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </box>
  );
}
