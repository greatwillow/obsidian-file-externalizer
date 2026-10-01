import builtins from 'builtin-modules';
import esbuild from 'esbuild';

await esbuild.build({
  banner: {
    js: '/* THIS FILE IS GENERATED. Edit src/ instead. */',
  },
  bundle: true,
  entryPoints: ['src/main.ts'],
  external: ['obsidian', 'electron', ...builtins],
  format: 'cjs',
  logLevel: 'info',
  outfile: 'main.js',
  platform: 'node',
  sourcemap: 'inline',
  target: 'es2022',
});
