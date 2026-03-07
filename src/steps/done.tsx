import { relative } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { KeyHints } from '../components.js';
import { T } from '../theme.js';
import type { SkillConfig } from '../types/skill.js';

interface DoneProps {
  config: SkillConfig;
  generatedPaths: string[];
}

export function Done({ config, generatedPaths }: DoneProps) {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
    }
  });

  const cwd = process.cwd();

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Text bold color={T.success}>
        {'Done!'}
      </Text>

      <Text color={T.success}>{`  ✓ Skill "${config.name}" generated successfully!`}</Text>

      <Text color={T.textMuted}>
        {'  Output: '}
        <Text color={T.accentText}>{`${config.outputDir}/${config.name}/`}</Text>
      </Text>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={T.border}
        marginTop={1}
        padding={1}
      >
        <Text color={T.textDim}>{' Generated files'}</Text>
        <Box flexDirection="column" marginTop={1}>
          {generatedPaths.map((p) => {
            const rel = (() => {
              try {
                return relative(cwd, p);
              } catch {
                return p;
              }
            })();
            return (
              <Text key={p}>
                <Text color={T.success}>{'  + '}</Text>
                <Text color={T.text}>{rel}</Text>
              </Text>
            );
          })}
        </Box>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor={T.border} padding={1}>
        <Text color={T.textDim}>{' Next steps'}</Text>
        <Box flexDirection="column" marginTop={1}>
          <Text>
            <Text color={T.warning}>{'  1. '}</Text>
            <Text color={T.text}>{'cd '}</Text>
            <Text color={T.accentText}>{`${config.outputDir}/${config.name}`}</Text>
          </Text>
          <Text>
            <Text color={T.warning}>{'  2. '}</Text>
            <Text color={T.text}>{'Edit '}</Text>
            <Text color={T.accentText}>{'SKILL.md'}</Text>
            <Text color={T.text}>{' — add Overview, Principles, and Workflow'}</Text>
          </Text>
          {config.features.rules && config.rules.length > 0 && (
            <Text>
              <Text color={T.warning}>{'  3. '}</Text>
              <Text color={T.text}>{'Complete code examples in '}</Text>
              <Text color={T.accentText}>{'rules/'}</Text>
            </Text>
          )}
          {config.features.evals && (
            <Text>
              <Text color={T.warning}>{'  4. '}</Text>
              <Text color={T.text}>{'Update test cases in '}</Text>
              <Text color={T.accentText}>{'evals/evals.json'}</Text>
            </Text>
          )}
        </Box>
      </Box>

      <KeyHints
        hints={[
          { key: 'q', label: 'Exit' },
          { key: 'Esc', label: 'Exit' },
        ]}
      />
    </Box>
  );
}
