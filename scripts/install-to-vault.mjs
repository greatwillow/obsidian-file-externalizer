import fs from 'node:fs';
import path from 'node:path';

const vault = process.argv[2];
if (!vault) {
  console.error('Usage: node scripts/install-to-vault.mjs /path/to/vault');
  process.exit(1);
}

const target = path.join(vault, '.obsidian/plugins/file-externalizer');
fs.mkdirSync(target, { recursive: true });

for (const file of ['main.js', 'manifest.json', 'styles.css']) {
  fs.copyFileSync(file, path.join(target, file));
}

console.log(`Installed File Externalizer to ${target}`);
