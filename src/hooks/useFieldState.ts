import { useCallback, useState } from 'react';

interface UseFieldStateReturn<T> {
  value: T;
  onChange: (v: T) => void;
  error: string;
  /** Run the validator and set the error. Returns true if valid. */
  validate: () => boolean;
  /** Clear value and error back to initial. */
  reset: () => void;
  setError: (e: string) => void;
}

/**
 * Pairs a field value with its validation error in a single hook,
 * replacing the repetitive `[value, setValue] + [error, setError]` pattern.
 */
export function useFieldState<T>(initial: T, validator?: (v: T) => string): UseFieldStateReturn<T> {
  const [value, setValue] = useState<T>(initial);
  const [error, setError] = useState('');

  const onChange = useCallback((v: T) => {
    setValue(v);
    // Clear stale error as soon as the user starts typing again
    setError('');
  }, []);

  const validate = useCallback(() => {
    if (!validator) return true;
    const msg = validator(value);
    setError(msg);
    return msg === '';
  }, [value, validator]);

  const reset = useCallback(() => {
    setValue(initial);
    setError('');
  }, [initial]);

  return { value, onChange, error, validate, reset, setError };
}
