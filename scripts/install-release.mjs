// Installs a published release (not your local build) into a vault.
// Usage: npm run install:release -- /path/to/vault [version]
// Requires the GitHub CLI (`gh`) signed in with access to this repository.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = 'greatwillow/obsidian-file-externalizer';
const [vault, version] = process.argv.slice(2);
if (!vault) {
  console.error('Usage: npm run install:release -- /path/to/vault [version]');
  process.exit(1);
}
if (!fs.existsSync(path.join(vault, '.obsidian'))) {
  console.error(`${vault} does not look like an Obsidian vault (no .obsidian folder).`);
  process.exit(1);
}

const target = path.join(vault, '.obsidian/plugins/file-externalizer');
fs.mkdirSync(target, { recursive: true });

const args = ['release', 'download'];
if (version) args.push(version);
args.push('-R', REPO, '-p', 'main.js', '-p', 'manifest.json', '-p', 'styles.css', '-D', target, '--clobber');
execFileSync('gh', args, { stdio: 'inherit' });

const installed = JSON.parse(fs.readFileSync(path.join(target, 'manifest.json'), 'utf8')).version;
console.log(`Installed File Externalizer ${installed} to ${target}. Its data.json (vault settings) was left untouched.`);
console.log('Reload Obsidian, or toggle the plugin off and on, to load the new version.');
