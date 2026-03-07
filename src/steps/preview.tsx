import { useKeyboard } from '@opentui/react';
import { Fragment } from 'react';
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

  useKeyboard((key) => {
    if (generating) return;

    if (key.name === 'return' || key.name === 'linefeed') {
      onConfirm();
    }
    if (key.ctrl && key.name === 's') {
      onConfirm();
    }
    if (key.name === 'escape') {
      onBack();
    }
  });

  const outputPath = `${config.outputDir}/${config.name}`;

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <StepHeader title="Step 6 — Preview" subtitle={`Review the files that will be written to `} />

      {/* Output path shown separately so we can colour it */}
      <text style={{ fg: T.textMuted }}>
        {'  → '}
        <span fg={T.accentText}>{outputPath}</span>
      </text>

      <box title="Skill Summary" border borderColor={T.border} marginTop={1} padding={1}>
        <text>
          <span fg={T.textMuted}>{'  name:          '}</span>
          <span fg={T.success}>{config.name}</span>
          <br />
          <span fg={T.textMuted}>{'  description:   '}</span>
          <span fg={T.text}>{config.description.substring(0, 60)}</span>
          {config.description.length > 60 && <span fg={T.textDim}>{'...'}</span>}
          {config.features.rules && (
            <>
              <br />
              <span fg={T.textMuted}>{'  rules:          '}</span>
              <span fg={T.warning}>
                {config.rules.length > 0 ? config.rules.join(', ') : '(none added)'}
              </span>
            </>
          )}
          {config.features.evals && (
            <>
              <br />
              <span fg={T.textMuted}>{'  evals:          '}</span>
              <span fg={T.warning}>{`${config.evals.length} eval(s)`}</span>
            </>
          )}
          {config.features.agents && (
            <>
              <br />
              <span fg={T.textMuted}>{'  agent name:     '}</span>
              <span fg={T.warning}>{config.agentDisplayName || config.name}</span>
            </>
          )}
        </text>
      </box>

      <box title="Files to generate" border borderColor={T.border} padding={1}>
        <text>
          {treeLines.map((line, i) => {
            const isDir = line.trimEnd().endsWith('/');
            const isRoot = i === 0;
            return (
              <Fragment key={i}>
                {i > 0 && <br />}
                <span fg={isRoot ? T.text : isDir ? T.accentText : T.textMuted}>{line}</span>
              </Fragment>
            );
          })}
        </text>
      </box>

      {generateError && (
        <text style={{ fg: T.error, marginTop: 1 }}> x Error: {generateError}</text>
      )}

      {generating ? (
        <text style={{ fg: T.warning, marginTop: 1 }}>{'  Generating files...'}</text>
      ) : (
        <KeyHints
          hints={[
            { key: 'Enter', label: '/ ', keyColor: T.success },
            {
              key: 'Ctrl+S',
              label: generateError ? 'Retry   ' : 'Generate   ',
              keyColor: T.success,
            },
            { key: 'Esc', label: 'Back' },
          ]}
        />
      )}
    </box>
  );
}
