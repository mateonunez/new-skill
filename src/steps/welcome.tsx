import { useKeyboard } from '@opentui/react';
import { useCallback, useState } from 'react';
import { ErrorLine, FieldBox, KeyHints } from '../components.js';
import { T } from '../theme.js';
import { onInputSubmit } from '../utils/input.js';
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

  useKeyboard((key) => {
    if (key.ctrl && key.name === 's') {
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

    if (key.name === 'tab') {
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
    <box flexDirection="column" padding={2} gap={1}>
      <ascii-font text="new-skill" font="tiny" />

      <text style={{ fg: T.textMuted, marginTop: 1 }}>
        Scaffold a new agent skill — covers all files and directories.
      </text>

      <FieldBox title="Skill Name" focused={focused === 'name'} height={3} marginTop={1}>
        <input
          placeholder="e.g. processing-pdfs  (kebab-case)"
          focused={focused === 'name'}
          onInput={setName}
          onSubmit={onInputSubmit(handleNameSubmit)}
          value={initialName}
        />
      </FieldBox>

      {showGerundHint && (
        <text style={{ fg: T.textDim }}>
          {'  Tip: gerund names work well (e.g. processing-pdfs, managing-configs)'}
        </text>
      )}

      <FieldBox title="Output Directory" focused={focused === 'dir'} height={3}>
        <input
          placeholder="e.g. ./skills  (defaults to current dir)"
          focused={focused === 'dir'}
          onInput={setOutputDir}
          onSubmit={onInputSubmit(handleDirSubmit)}
          value={initialOutputDir}
        />
      </FieldBox>

      <ErrorLine error={error} />

      <KeyHints
        hints={[
          { key: 'Tab', label: 'Next field   ' },
          { key: 'Shift+Tab', label: 'Prev field   ' },
          { key: 'Enter', label: 'Confirm   ' },
          { key: 'Ctrl+S', label: 'Continue   ' },
          { key: 'Ctrl+C', label: 'Exit' },
        ]}
      />
    </box>
  );
}
