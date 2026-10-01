# File Externalizer

File Externalizer is an Obsidian plugin for registering, opening, caching, and validating files that are stored outside the vault but represented by Markdown notes inside the vault.

The plugin is storage-provider based. The first provider is Proton Drive via the `proton-drive` CLI, but the UI and note model are intentionally independent of Proton.

## Development

```bash
npm install
npm run build
npm test
```

Install the built plugin into a vault:

```bash
npm run install:vault -- /path/to/your-vault
```

The install script copies `main.js`, `manifest.json`, and `styles.css` to:

```text
/path/to/your-vault/.obsidian/plugins/file-externalizer
```

## Architecture

- `src/domain`: pure note, path, filename, and frontmatter logic.
- `src/providers`: storage-provider contracts and implementations.
- `src/services`: vault-facing orchestration for notes, cache, and validation.
- `src/ui`: Obsidian modals and picker UI.
- `tests`: Node tests for the pure logic.

## Configuration

The plugin ships with generic defaults. Each vault configures its own storage root, cache folder, external-note folder, and document types in `.obsidian/plugins/file-externalizer/data.json` or through the plugin settings UI.

## Commands

- `File Externalizer: Register File`
- `File Externalizer: Open External File`
- `File Externalizer: Validate External File Notes`
