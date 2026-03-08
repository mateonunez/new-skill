import { Box } from 'ink';
import TextInput from 'ink-text-input';
import { ErrorLine, FieldBox, KeyHints, StepHeader } from '../components.js';
import { useFieldState } from '../hooks/useFieldState.js';
import { useStepKeyboard } from '../hooks/useStepKeyboard.js';
import { validateDescription } from '../utils/validation.js';

interface MetadataProps {
  initialDescription?: string;
  onNext: (description: string) => void;
  onBack: () => void;
  stepNumber?: number;
}

export function Metadata({ initialDescription = '', onNext, onBack, stepNumber }: MetadataProps) {
  const {
    value: description,
    onChange,
    error,
    validate,
  } = useFieldState(initialDescription, validateDescription);

  const submit = () => {
    if (validate()) {
      onNext(description.trim());
    }
  };

  useStepKeyboard({ onNext: submit, onBack });

  const title = stepNumber ? `Step ${stepNumber} — Skill Description` : 'Skill Description';

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader
        title={title}
        subtitle="Describe what triggers this skill and what the agent should do. Write in third person."
      />

      <FieldBox title="Description" focused height={3} marginTop={1}>
        <TextInput
          placeholder="Processes X files and generates Y. Use when working with X or when the user mentions Y."
          focus
          value={description}
          onChange={onChange}
          onSubmit={submit}
        />
      </FieldBox>

      <ErrorLine
        error={error}
        hint="Write in third person. Third-person descriptions improve skill discovery accuracy."
      />

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
