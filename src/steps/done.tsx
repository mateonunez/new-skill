import { relative } from 'node:path';
import { useKeyboard, useRenderer } from '@opentui/react';
import { Fragment } from 'react';
import { KeyHints } from '../components.js';
import { T } from '../theme.js';
import type { SkillConfig } from '../types/skill.js';

interface DoneProps {
  config: SkillConfig;
  generatedPaths: string[];
}

export function Done({ config, generatedPaths }: DoneProps) {
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (key.name === 'q' || key.name === 'escape') {
      renderer.destroy();
    }
  });

  const cwd = process.cwd();

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <ascii-font text="Done!" font="tiny" />

      <text style={{ fg: T.success, marginTop: 1, attributes: 1 }}>
        {`  + Skill "${config.name}" generated successfully!`}
      </text>

      <text style={{ fg: T.textMuted }}>
        {'  Output: '}
        <span fg={T.accentText}>{`${config.outputDir}/${config.name}/`}</span>
      </text>

      <box title="Generated files" border borderColor={T.border} marginTop={1} padding={1}>
        <text>
          {generatedPaths.map((p, i) => {
            const rel = (() => {
              try {
                return relative(cwd, p);
              } catch {
                return p;
              }
            })();
            return (
              <Fragment key={p}>
                {i > 0 && <br />}
                <span fg={T.success}>{'  + '}</span>
                <span fg={T.text}>{rel}</span>
              </Fragment>
            );
          })}
        </text>
      </box>

      <box title="Next steps" border borderColor={T.border} padding={1}>
        <text>
          <span fg={T.warning}>{'  1. '}</span>
          <span fg={T.text}>{'cd '}</span>
          <span fg={T.accentText}>{`${config.outputDir}/${config.name}`}</span>
          <br />
          <span fg={T.warning}>{'  2. '}</span>
          <span fg={T.text}>{'Edit '}</span>
          <span fg={T.accentText}>{'SKILL.md'}</span>
          <span fg={T.text}>{' — add Overview, Principles, and Workflow'}</span>
          {config.features.rules && config.rules.length > 0 && (
            <>
              <br />
              <span fg={T.warning}>{'  3. '}</span>
              <span fg={T.text}>{'Complete code examples in '}</span>
              <span fg={T.accentText}>{'rules/'}</span>
            </>
          )}
          {config.features.evals && (
            <>
              <br />
              <span fg={T.warning}>{'  4. '}</span>
              <span fg={T.text}>{'Update test cases in '}</span>
              <span fg={T.accentText}>{'evals/evals.json'}</span>
            </>
          )}
        </text>
      </box>

      <KeyHints
        hints={[
          { key: 'q', label: '/ ' },
          { key: 'Esc', label: 'Exit' },
        ]}
      />
    </box>
  );
}
