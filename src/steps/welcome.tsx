import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useCallback, useState } from 'react';
import { ErrorLine, FieldBox, KeyHints } from '../components.js';
import { T } from '../theme.js';
import { GERUND_RE, KEBAB_RE } from '../utils/validation.js';

interface WelcomeProps {
  initialName?: string;
  initialOutputDir?: string;
  onNext: (name: string, outputDir: string) => void;
}

const FIELDS = ['name', 'dir'] as const;
type Field = (typeof FIELDS)[number];

function validateName(name: string): string {
  if (!name.trim()) return 'Skill name is required.';
  if (!KEBAB_RE.test(name.trim())) return 'Name must be kebab-case (e.g. my-skill).';
  return '';
}

export function Welcome({ initialName = '', initialOutputDir = '.', onNext }: WelcomeProps) {
  const [name, setName] = useState(initialName);
  const [outputDir, setOutputDir] = useState(initialOutputDir);
  const [focused, setFocused] = useState<Field>('name');
  const [error, setError] = useState('');

  const cycleFocus = useCallback((reverse?: boolean) => {
    setFocused((f) => {
      const idx = FIELDS.indexOf(f);
      const next = reverse ? (idx - 1 + FIELDS.length) % FIELDS.length : (idx + 1) % FIELDS.length;
      return FIELDS[next];
    });
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === 's') {
      const err = validateName(name);
      if (err) {
        setError(err);
        setFocused('name');
        return;
      }
      setError('');
      onNext(name.trim(), outputDir.trim() || '.');
      return;
    }

    if (key.tab) {
      cycleFocus(key.shift);
    }
  });

  const handleNameSubmit = (value: string) => {
    const err = validateName(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setFocused('dir');
  };

  const handleDirSubmit = (value: string) => {
    const err = validateName(name);
    if (err) {
      setError(err);
      setFocused('name');
      return;
    }
    setError('');
    onNext(name.trim(), value.trim() || '.');
  };

  const showGerundHint = name.length > 2 && KEBAB_RE.test(name) && !GERUND_RE.test(name);

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Text bold color={T.accentText}>{'new-skill'}</Text>

      <Text color={T.textMuted}>
        {'Scaffold a new agent skill — covers all files and directories.'}
      </Text>

      <FieldBox title="Skill Name" focused={focused === 'name'} height={3} marginTop={1}>
        <TextInput
          placeholder="e.g. processing-pdfs  (kebab-case)"
          focus={focused === 'name'}
          onChange={setName}
          onSubmit={handleNameSubmit}
          value={name}
        />
      </FieldBox>

      {showGerundHint && (
        <Text color={T.textDim}>
          {'  Tip: gerund names work well (e.g. processing-pdfs, managing-configs)'}
        </Text>
      )}

      <FieldBox title="Output Directory" focused={focused === 'dir'} height={3}>
        <TextInput
          placeholder="e.g. ./skills  (defaults to current dir)"
          focus={focused === 'dir'}
          onChange={setOutputDir}
          onSubmit={handleDirSubmit}
          value={outputDir}
        />
      </FieldBox>

      <ErrorLine error={error} />

      <KeyHints
        hints={[
          { key: 'Tab', label: 'Next field' },
          { key: 'Shift+Tab', label: 'Prev field' },
          { key: 'Enter', label: 'Confirm' },
          { key: 'Ctrl+S', label: 'Continue' },
          { key: 'Ctrl+C', label: 'Exit' },
        ]}
      />
    </Box>
  );
}
