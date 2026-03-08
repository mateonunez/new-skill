import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { useFieldState } from '../hooks/useFieldState.js';
import { useStepKeyboard } from '../hooks/useStepKeyboard.js';
import { T } from '../theme.js';
import { KEBAB_RE } from '../utils/validation.js';

const MAX_VISIBLE = 5;

interface RulesProps {
  initialRules?: string[];
  onNext: (rules: string[]) => void;
  onBack: () => void;
  stepNumber?: number;
}

export function Rules({ initialRules = [], onNext, onBack, stepNumber }: RulesProps) {
  const [rules, setRules] = useState<string[]>(initialRules);
  const { value: inputValue, onChange: setInputValue, error, setError, reset } = useFieldState('');

  useStepKeyboard({ onNext: () => onNext(rules), onBack });

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

    setRules((prev) => [...prev, trimmed]);
    reset();
  };

  const hint =
    rules.length === 0
      ? ' Press Enter with empty input to skip and continue.'
      : ` ${rules.length} rule(s) added. Empty Enter to continue.`;

  const title = stepNumber ? `Step ${stepNumber} — Rules` : 'Rules';

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title={title}
        subtitle="Add rule names (kebab-case). Each rule gets an Incorrect / Correct stub."
      />

      <FieldBox title={`Rules (${rules.length})`} marginTop={1} padding={1} flexShrink={0}>
        {rules.length === 0 ? (
          <Text color={T.textDim}>{'  No rules added yet.'}</Text>
        ) : (
          <Box flexDirection="column">
            {rules.slice(-MAX_VISIBLE).map((rule, i) => {
              const idx = Math.max(0, rules.length - MAX_VISIBLE) + i;
              return (
                <Text key={rule}>
                  <Text color={T.textDim}>{`  ${String(idx + 1).padStart(2, ' ')}. `}</Text>
                  <Text color={T.text}>{rule}</Text>
                  <Text color={T.textDim}>{`   → rules/${rule}.md`}</Text>
                </Text>
              );
            })}
            {rules.length > MAX_VISIBLE && (
              <Text color={T.textDim}>{`     … and ${rules.length - MAX_VISIBLE} more`}</Text>
            )}
          </Box>
        )}
      </FieldBox>

      <FieldBox title="Add Rule Name" focused height={3} marginTop={1}>
        <TextInput
          placeholder="e.g. no-var  (Enter to add, empty Enter to finish)"
          focus
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
        />
      </FieldBox>

      <ErrorLine error={error} hint={hint} />

      <KeyHints
        hints={[
          { key: 'Enter', label: 'Add rule / continue if empty' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </Box>
  );
}
