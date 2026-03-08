import { Box, Text, useInput } from 'ink';
import { useCallback, useState } from 'react';
import { T } from '../theme.js';

const MAX_CHARS = 1024;
const WARN_THRESHOLD = 900;

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  focus?: boolean;
  /** Max visible lines in the scrolling buffer (default: 4). */
  visibleLines?: number;
}

/**
 * Multi-line text area for Ink.
 *
 * Key bindings:
 *   Shift+Enter  →  Insert newline
 *   Enter        →  Submit (calls onSubmit)
 *   Backspace    →  Delete last char (or merge lines)
 *   ← →          →  Not yet: cursor movement within a line is forwarded to the OS
 *
 * Zero new runtime dependencies — implemented purely with Ink's useInput.
 */
export function Textarea({
  value,
  onChange,
  placeholder = '',
  focus = true,
  visibleLines = 4,
}: TextareaProps) {
  // Track which line the cursor is on for the scrolling window
  const [_scrollOffset, _setScrollOffset] = useState(0);

  const lines = value.split('\n');
  const totalLines = lines.length;

  // Ensure the last line is always visible
  const visibleStart = Math.max(0, totalLines - visibleLines);

  useInput(
    useCallback(
      (input, key) => {
        if (!focus) return;

        // Enter → newline (terminals can't reliably distinguish Shift+Enter from Enter)
        if (key.return) {
          if (value.length < MAX_CHARS) {
            onChange(`${value}\n`);
          }
          return;
        }

        // Backspace
        if (key.backspace || key.delete) {
          if (value.length > 0) {
            onChange(value.slice(0, -1));
          }
          return;
        }

        // Ctrl+U → clear line (UX convenience)
        if (key.ctrl && input === 'u') {
          const idx = value.lastIndexOf('\n');
          onChange(idx === -1 ? '' : value.slice(0, idx + 1));
          return;
        }

        // Ignore other control sequences
        if (key.ctrl || key.meta || key.tab || key.escape) return;

        // Printable character
        if (input && value.length < MAX_CHARS) {
          onChange(value + input);
        }
      },
      [focus, value, onChange],
    ),
    { isActive: focus },
  );

  const charCount = value.length;
  const isEmpty = charCount === 0;
  const counterColor =
    charCount > MAX_CHARS ? T.error : charCount > WARN_THRESHOLD ? T.warning : T.textDim;

  const visibleLineSlice = lines.slice(visibleStart, visibleStart + visibleLines);

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" minHeight={visibleLines}>
        {isEmpty ? (
          <Text color={T.textDim}>
            {placeholder}
            {focus && <Text color={T.accentText}>{'▊'}</Text>}
          </Text>
        ) : (
          visibleLineSlice.map((line, i) => {
            const isLast = visibleStart + i === totalLines - 1;
            return (
              <Text key={visibleStart + i} color={T.text}>
                {line}
                {isLast && focus && <Text color={T.accentText}>{'▊'}</Text>}
              </Text>
            );
          })
        )}
      </Box>
      <Box justifyContent="flex-end">
        <Text color={counterColor}>{`${charCount}/${MAX_CHARS}`}</Text>
      </Box>
    </Box>
  );
}
