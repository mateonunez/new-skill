# new-skill

Interactive CLI to scaffold [Claude Code](https://claude.ai/code) skills — generates the complete directory layout, frontmatter, rule stubs, eval entries, and agent config in one guided wizard.

## Quick Start

```bash
# Interactive wizard (recommended)
npx new-skill
# or
bunx new-skill

# Non-interactive — useful for scripts and CI
npx new-skill --no-interactive --name my-skill --output ./skills
# or
bunx new-skill --no-interactive --name my-skill --output ./skills
```

## Non-interactive mode

```bash
new-skill --no-interactive \
  --name my-skill \
  --output ./skills \
  --description "Processes my-skill files. Use when working with my-skill." \
  --rules no-var,prefer-const \
  --agents openai,claude-code \
  --agents-md \
  --eval-format claude \
  --assets
```

| Flag | Description |
|------|-------------|
| `-n, --name` | Skill name (kebab-case, max 64 chars) — required |
| `-o, --output` | Output directory (default: `.`) |
| `-d, --description` | Skill description (third-person) |
| `--rules <r1,r2>` | Comma-separated rule names |
| `--evals <e1,e2>` | Comma-separated eval IDs (non-interactive stub) |
| `--eval-format <claude\|extended>` | Eval output format (default: `claude`) |
| `--agents <openai,claude-code>` | Comma-separated agent targets |
| `--agents-md` | Generate `AGENTS.md` universal instructions |
| `--assets` | Create `assets/` with icon stubs |
| `--no-interactive` | Skip the TUI wizard |

## Output

For a skill named `my-skill` with all features enabled:

```
my-skill/
  SKILL.md                  # frontmatter (name, description) + section stubs
  AGENTS.md                 # universal instructions (Vercel / Codex ecosystem)
  agents/
    openai.yml              # OpenAI / Codex agent config
    claude.yml              # Claude Code agent config
    agents.yml              # generic platform-agnostic YAML
  evals/
    evals.json              # eval entries in the selected format
  rules/
    no-var.md               # ## Incorrect / ## Correct + ### Why stubs
    prefer-const.md
  assets/
    icon-small.png          # 1×1 transparent PNG placeholder
    icon-large.png
```

### Eval formats

| Format | Structure |
|--------|-----------|
| `claude` (default) | Array of `{ skills, query, files, expected_behavior }` — matches the [Claude skill spec](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| `extended` | `{ skill_name, evals: [{ id, prompt, expected_output, files, expectations }] }` — richer envelope for custom pipelines |

The generated `SKILL.md` frontmatter follows the Claude Code skill spec:

```yaml
---
name: my-skill
description: Use this skill when…
---
```

## Development

```bash
git clone https://github.com/mateonunez/new-skill.git
cd new-skill

bun install

bun run dev                # run wizard
bun run build              # compile to dist/new-skill (standalone binary)
bun run typecheck          # tsc --noEmit
bun run lint               # biome check
```

## License

[MIT](LICENSE)
