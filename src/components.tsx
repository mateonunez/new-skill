import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import { T } from './theme.js';

// ---------------------------------------------------------------------------
// StepHeader
// ---------------------------------------------------------------------------

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <Box flexDirection="column">
      <Text bold color={T.text}>
        {title}
      </Text>
      {subtitle && <Text color={T.textMuted}>{subtitle}</Text>}
    </Box>
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

export function FieldBox({
  title,
  focused,
  height,
  marginTop,
  padding,
  flexShrink,
  children,
}: FieldBoxProps) {
  const borderColor = focused ? T.borderFocus : T.border;
  return (
    <Box flexDirection="column" marginTop={marginTop} flexShrink={flexShrink}>
      <Text color={borderColor}>{` ${title} `}</Text>
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={borderColor}
        height={height}
        padding={padding}
      >
        {children}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ErrorLine
// ---------------------------------------------------------------------------

interface ErrorLineProps {
  error?: string;
  hint?: string;
}

export function ErrorLine({ error, hint }: ErrorLineProps) {
  return error ? (
    <Text color={T.error}>{` x ${error}`}</Text>
  ) : (
    <Text color={T.textMuted}>{hint ?? ' '}</Text>
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

export function KeyHints({ hints }: { hints: HintDef[] }) {
  return (
    <Box marginTop={1}>
      <Text>
        {hints.map(({ key, label, keyColor = T.accentText }) => (
          <Text key={`${key}-${label}`}>
            <Text color={keyColor}>{`[${key}]`}</Text>
            <Text color={T.textDim}>{`  ${label}  `}</Text>
          </Text>
        ))}
      </Text>
    </Box>
  );
}
