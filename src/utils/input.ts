/**
 * Wraps a `(value: string) => void` callback into a `(v: unknown) => void` signature.
 *
 * This is necessary because TypeScript merges opentui's JSX `<input>` props with React
 * DOM's HTML `<input>`, producing the intersection:
 *   onSubmit?: ((event: DOM.SubmitEvent) => void) & ((value: string) => void)
 *
 * A `(v: unknown) => void` function is assignable to both sides of the intersection
 * via contravariance (both DOM.SubmitEvent and string extend unknown).
 *
 * At runtime, opentui only ever calls onSubmit with a plain string value, so the guard
 * `typeof v === 'string'` is always truthy in practice.
 */
export function onInputSubmit(handler: (value: string) => void): (v: unknown) => void {
  return (v) => {
    if (typeof v === 'string') handler(v);
  };
}
