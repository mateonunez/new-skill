import { Box, Text, useInput } from 'ink';
import { KeyHints, StepHeader } from '../components.js';
import { buildFileTree } from '../generators/index.js';
import { T } from '../theme.js';
import type { SkillConfig } from '../types/skill.js';

interface PreviewProps {
  config: SkillConfig;
  generating: boolean;
  generateError: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function Preview({ config, generating, generateError, onConfirm, onBack }: PreviewProps) {
  const treeLines = buildFileTree(config);

  useInput((input, key) => {
    if (generating) return;

    if (key.return) {
      onConfirm();
      return;
    }
    if (key.ctrl && input === 's') {
      onConfirm();
      return;
    }
    if (key.escape) {
      onBack();
    }
  });

  const outputPath = `${config.outputDir}/${config.name}`;

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <StepHeader title="Step 6 — Preview" subtitle="Review the files that will be written to:" />

      <Text color={T.textMuted}>
        {'  → '}
        <Text color={T.accentText}>{outputPath}</Text>
      </Text>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={T.border}
        marginTop={1}
        padding={1}
      >
        <Text color={T.textDim}>{' Skill Summary'}</Text>
        <Box flexDirection="column" marginTop={1}>
          <Text>
            <Text color={T.textMuted}>{'  name:          '}</Text>
            <Text color={T.success}>{config.name}</Text>
          </Text>
          <Text>
            <Text color={T.textMuted}>{'  description:   '}</Text>
            <Text color={T.text}>{config.description.substring(0, 60)}</Text>
            {config.description.length > 60 && <Text color={T.textDim}>{'...'}</Text>}
          </Text>
          {config.features.rules && (
            <Text>
              <Text color={T.textMuted}>{'  rules:          '}</Text>
              <Text color={T.warning}>
                {config.rules.length > 0 ? config.rules.join(', ') : '(none added)'}
              </Text>
            </Text>
          )}
          {config.features.evals && (
            <Text>
              <Text color={T.textMuted}>{'  evals:          '}</Text>
              <Text color={T.warning}>{`${config.evals.length} eval(s)`}</Text>
            </Text>
          )}
          {config.features.agents && (
            <Text>
              <Text color={T.textMuted}>{'  agent name:     '}</Text>
              <Text color={T.warning}>{config.agentDisplayName || config.name}</Text>
            </Text>
          )}
        </Box>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor={T.border} padding={1}>
        <Text color={T.textDim}>{' Files to generate'}</Text>
        <Box flexDirection="column" marginTop={1}>
          {treeLines.map((line, i) => {
            const isDir = line.trimEnd().endsWith('/');
            const isRoot = i === 0;
            return (
              <Text key={i} color={isRoot ? T.text : isDir ? T.accentText : T.textMuted}>
                {line}
              </Text>
            );
          })}
        </Box>
      </Box>

      {generateError && <Text color={T.error}>{` x Error: ${generateError}`}</Text>}

      {generating ? (
        <Text color={T.warning}>{'  Generating files...'}</Text>
      ) : (
        <KeyHints
          hints={[
            { key: 'Enter', label: 'Generate', keyColor: T.success },
            { key: 'Ctrl+S', label: generateError ? 'Retry' : 'Generate', keyColor: T.success },
            { key: 'Esc', label: 'Back' },
          ]}
        />
      )}
    </Box>
  );
}
