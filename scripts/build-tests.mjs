import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

fs.rmSync('.tmp-tests', { recursive: true, force: true });
fs.mkdirSync('.tmp-tests', { recursive: true });

const tests = fs.readdirSync('tests')
  .filter((name) => name.endsWith('.test.ts'))
  .map((name) => path.join('tests', name));

await esbuild.build({
  bundle: true,
  entryPoints: tests,
  format: 'cjs',
  logLevel: 'silent',
  outdir: '.tmp-tests',
  outExtension: { '.js': '.cjs' },
  platform: 'node',
  sourcemap: 'inline',
  target: 'es2022',
});
