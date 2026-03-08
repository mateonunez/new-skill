export const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const GERUND_RE = /^[a-z]+-?ing(-[a-z0-9]+)*$/;

// Segments that are forbidden anywhere in a skill name (per Claude/OpenAI spec).
const RESERVED_SEGMENTS = new Set(['anthropic', 'claude']);

// XML-like tag pattern — forbidden in name and description fields.
const XML_TAG_RE = /<[a-z/][^>]*>/i;

// First-person / second-person openers forbidden in descriptions (spec: write in third person).
const FIRST_SECOND_PERSON_RE = /^(I |I'm |I can |I will |You |You can |You'll |Your )/i;

export function validateSkillName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Skill name is required.';
  if (trimmed.length > 64)
    return `Name must be 64 characters or fewer (currently ${trimmed.length}).`;
  if (!KEBAB_RE.test(trimmed)) return 'Name must be kebab-case (e.g. processing-pdfs).';
  if (XML_TAG_RE.test(trimmed)) return 'Name must not contain XML tags.';
  const segments = trimmed.split('-');
  const reserved = segments.find((s) => RESERVED_SEGMENTS.has(s));
  if (reserved) return `Name must not contain reserved word "${reserved}".`;
  return '';
}

export function validateDescription(desc: string): string {
  const trimmed = desc.trim();
  if (!trimmed) return 'Description is required.';
  if (trimmed.length > 1024)
    return `Description must be 1024 characters or fewer (currently ${trimmed.length}).`;
  if (XML_TAG_RE.test(trimmed)) return 'Description must not contain XML tags.';
  if (FIRST_SECOND_PERSON_RE.test(trimmed))
    return 'Write in third person (e.g. "Processes PDF files. Use when..."). Avoid "I", "You", etc.';
  return '';
}
