import { render } from '../templates/engine.js';
import ruleTemplate from '../templates/rule.md' with { type: 'text' };

export function generateRuleMd(ruleName: string): string {
  const title = ruleName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return render(ruleTemplate, { title });
}
