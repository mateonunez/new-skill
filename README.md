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
  --description "Use this skill when working with my-skill." \
  --rules no-var,prefer-const \
  --agents \
  --assets
```

| Flag | Description |
|------|-------------|
| `-n, --name` | Skill name (kebab-case) — required |
| `-o, --output` | Output directory (default: `.`) |
| `-d, --description` | Skill description |
| `--rules <r1,r2>` | Comma-separated rule names |
| `--agents` | Generate `agents/openai.yml` |
| `--assets` | Create `assets/` placeholder |
| `--no-interactive` | Skip the TUI wizard |

## Output

For a skill named `my-skill` with all features enabled:

```
my-skill/
  SKILL.md                  # frontmatter (name, description) + section stubs
  agents/
    openai.yml              # display_name, short_description, icon paths
  evals/
    evals.json              # { skill_name, evals: [{ id, prompt, expected_output }] }
  rules/
    no-var.md               # ## Incorrect / ## Correct pattern pair
    prefer-const.md
  assets/
    .gitkeep                # placeholder — drop icon-small.png / icon-large.png here
```

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
