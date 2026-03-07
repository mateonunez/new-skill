import type { TextareaRenderable } from '@opentui/core';
import { useKeyboard } from '@opentui/react';
import { useRef, useState } from 'react';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';

interface MetadataProps {
  initialDescription?: string;
  onNext: (description: string) => void;
  onBack: () => void;
}

const FIELDS = ['description'] as const;
type Field = (typeof FIELDS)[number];

export function Metadata({ initialDescription = '', onNext, onBack }: MetadataProps) {
  const textareaRef = useRef<TextareaRenderable>(null);
  const [focused, setFocused] = useState<Field>('description');
  const [error, setError] = useState('');

  useKeyboard((key) => {
    if (key.name === 'escape') {
      onBack();
      return;
    }

    if (key.name === 'tab') {
      const reverse = key.shift;
      setFocused((f) =>
        reverse
          ? f === 'description'
            ? 'description'
            : 'description'
          : f === 'description'
            ? 'description'
            : 'description',
      );
      return;
    }

    if (key.ctrl && key.name === 's') {
      const description = textareaRef.current?.plainText?.trim() ?? '';
      if (!description) {
        setError('Description is required.');
        setFocused('description');
        return;
      }
      setError('');
      onNext(description);
    }
  });

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title="Step 2 — Skill Metadata"
        subtitle="Describe what triggers this skill and how the agent should use it."
      />

      <FieldBox
        title="Description  (trigger condition)"
        focused={focused === 'description'}
        height={8}
        marginTop={1}
      >
        <textarea
          ref={textareaRef}
          placeholder="Extracts data from X files. Use when working with X or when the user mentions Y."
          focused={focused === 'description'}
          initialValue={initialDescription}
        />
      </FieldBox>

      <ErrorLine error={error} />

      <KeyHints
        hints={[
          { key: 'Tab', label: 'Next field   ' },
          { key: 'Shift+Tab', label: 'Prev field   ' },
          { key: 'Ctrl+S', label: 'Continue   ' },
          { key: 'Esc', label: 'Back' },
        ]}
      />
    </box>
  );
}
