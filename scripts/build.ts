import { rename, chmod, stat } from 'node:fs/promises';

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'node',
  // Prevent bun from bundling ink's optional devtools integration,
  // which pulls in react-devtools-core (a browser-only package).
  define: {
    'process.env.DEV': 'false',
  },
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

await rename('dist/index.js', 'dist/new-skill');
await chmod('dist/new-skill', 0o755);

const { size } = await stat('dist/new-skill');
console.log(`Built dist/new-skill  ${(size / 1024).toFixed(0)} KB`);
