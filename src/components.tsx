import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { T } from './theme.js';

// ---------------------------------------------------------------------------
// StepHeader
// ---------------------------------------------------------------------------

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

/** Renders a bold step title and an optional muted subtitle. */
export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <>
      <text fg={T.text}>
        <strong>{title}</strong>
      </text>
      {subtitle && <text fg={T.textMuted}>{subtitle}</text>}
    </>
  );
}

// ---------------------------------------------------------------------------
// FieldBox
// ---------------------------------------------------------------------------

interface FieldBoxProps {
  title: string;
  focused?: boolean;
  height?: number;
  marginTop?: number;
  padding?: number;
  flexShrink?: number;
  children: ReactNode;
}

/**
 * A bordered box whose border colour reflects focus state.
 * Use instead of repeating `border + borderColor` in every step.
 */
export function FieldBox({
  title,
  focused,
  height,
  marginTop,
  padding,
  flexShrink,
  children,
}: FieldBoxProps) {
  return (
    <box
      flexDirection="column"
      title={title}
      border
      borderColor={focused ? T.borderFocus : T.border}
      height={height}
      marginTop={marginTop}
      padding={padding}
      flexShrink={flexShrink}
    >
      {children}
    </box>
  );
}

// ---------------------------------------------------------------------------
// ErrorLine
// ---------------------------------------------------------------------------

interface ErrorLineProps {
  error?: string;
  hint?: string;
}

/** Shows an error in red, or a muted hint/placeholder when there is no error. */
export function ErrorLine({ error, hint }: ErrorLineProps) {
  return error ? (
    <text style={{ fg: T.error }}> x {error}</text>
  ) : (
    <text style={{ fg: T.textMuted }}>{hint ?? ' '}</text>
  );
}

// ---------------------------------------------------------------------------
// KeyHints
// ---------------------------------------------------------------------------

export interface HintDef {
  key: string;
  label: string;
  keyColor?: string;
}

/** Renders a row of keyboard shortcut hints: [Key]  label  [Key]  label */
export function KeyHints({ hints }: { hints: HintDef[] }) {
  return (
    <text style={{ fg: T.textDim, marginTop: 1 }}>
      {hints.map(({ key, label, keyColor = T.accentText }) => (
        <Fragment key={`${key}-${label}`}>
          <span fg={keyColor}>{`[${key}]`}</span>
          {`  ${label}`}
        </Fragment>
      ))}
    </text>
  );
}
