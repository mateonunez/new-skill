import { useInput } from 'ink';

interface UseStepKeyboardOptions {
  /** Called when Enter (if enterTriggersNext) or Ctrl+S is pressed. */
  onNext?: () => void;
  /** Called when Escape is pressed. */
  onBack?: () => void;
  /**
   * When true, Enter also triggers onNext.
   * Set this on steps that have no text input of their own (e.g. features, preview).
   * Leave false (default) on steps where Enter is already handled by a text input.
   */
  enterTriggersNext?: boolean;
  /** Suspend all bindings when true (e.g. during async operations). */
  disabled?: boolean;
}

/**
 * Registers the universal step keyboard shortcuts shared across all wizard steps:
 *   Esc       → onBack()
 *   Ctrl+S    → onNext()
 *   Enter     → onNext()  (only when enterTriggersNext = true)
 *
 * Individual steps add their own step-specific bindings on top of this.
 */
export function useStepKeyboard({
  onNext,
  onBack,
  enterTriggersNext = false,
  disabled = false,
}: UseStepKeyboardOptions) {
  useInput(
    (input, key) => {
      if (disabled) return;

      if (key.escape && onBack) {
        onBack();
        return;
      }

      if (key.return && enterTriggersNext && onNext) {
        onNext();
        return;
      }

      if (key.ctrl && input === 's' && onNext) {
        onNext();
        return;
      }
    },
    { isActive: !disabled },
  );
}
