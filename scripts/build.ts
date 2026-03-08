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
  // Stub react-devtools-core so it is bundled as a no-op rather than left
  // as an external import. Marking it `external` causes Node to fail when
  // the package is absent (e.g. after `npx new-skill`).
  plugins: [
    {
      name: 'stub-react-devtools-core',
      setup(build: any) {
        build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
          path: 'react-devtools-core',
          namespace: 'stub',
        }));
        build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
          contents: 'export const connectToDevTools = () => {}; export default { connectToDevTools };',
          loader: 'js',
        }));
      },
    },
  ],
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
