import { Box, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';

interface MetadataProps {
  initialDescription?: string;
  onNext: (description: string) => void;
  onBack: () => void;
}

export function Metadata({ initialDescription = '', onNext, onBack }: MetadataProps) {
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState('');

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Description is required.');
      return;
    }
    setError('');
    onNext(trimmed);
  };

  useInput((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }

    if (key.ctrl && input === 's') {
      submit(description);
    }
  });

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 2 — Skill Metadata"
        subtitle="Describe what triggers this skill and how the agent should use it."
      />

      <FieldBox title="Description  (trigger condition)" focused height={3} marginTop={1}>
        <TextInput
          placeholder="Extracts data from X files. Use when working with X or when the user mentions Y."
          focus
          value={description}
          onChange={setDescription}
          onSubmit={submit}
        />
      </FieldBox>

      <ErrorLine error={error} />

      <KeyHints
        hints={[
          { key: 'Enter', label: 'Continue' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </Box>
  );
}
