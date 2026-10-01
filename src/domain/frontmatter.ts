export type Frontmatter = Record<string, string>;

export interface FrontmatterUpdate {
  quote?: boolean;
  raw?: boolean;
  value: string | number | boolean;
}

export function parseFrontmatter(text: string): Frontmatter {
  const match = String(text || '').match(/^---\n([\s\S]*?)\n---/);
  const out: Frontmatter = {};
  if (!match) return out;
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    value = value.replace(/^"|"$/g, '');
    out[key] = value;
  }
  return out;
}

export function yamlString(value: string | number | boolean): string {
  return JSON.stringify(String(value));
}

export function yamlScalar(value: string): string {
  return String(value || '').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').toLowerCase();
}

export function setFrontmatterFields(text: string, updates: Record<string, FrontmatterUpdate>): string {
  const source = String(text || '');
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return source;

  const remaining = { ...updates };
  const lines = match[1].split(/\r?\n/).map((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return line;
    const key = line.slice(0, idx).trim();
    const update = remaining[key];
    if (!update) return line;
    delete remaining[key];
    return `${key}: ${frontmatterValue(update)}`;
  });

  for (const [key, update] of Object.entries(remaining)) {
    lines.push(`${key}: ${frontmatterValue(update)}`);
  }

  return source.replace(/^---\n[\s\S]*?\n---/, `---\n${lines.join('\n')}\n---`);
}

function frontmatterValue(update: FrontmatterUpdate): string {
  if (update.raw) return String(update.value);
  if (update.value === 'none') return 'none';
  if (update.quote) return yamlString(update.value);
  return String(update.value);
}
