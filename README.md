# File Externalizer

File Externalizer is an Obsidian plugin for registering, opening, caching, and validating files that are stored outside the vault but represented by Markdown notes inside the vault.

The plugin is storage-provider based. The first provider is Proton Drive via the `proton-drive` CLI, but the UI and note model are intentionally independent of Proton.

## Setup on each computer

Nothing secret is stored in the vault. Each person signs in to their storage provider on their own computer.

For Proton Drive:

1. Install the official Proton Drive CLI from https://proton.me/support/drive-cli.
2. Open **Settings → File Externalizer**. The **Setup on this computer** section shows whether the CLI was found, whether you are signed in, and whether the remote root is reachable.
3. Click **Log in to Proton** and finish signing in in your browser.

The CLI is found automatically on `PATH`, in `~/.local/bin`, or in Homebrew's folders. If it lives somewhere else, set **Proton Drive CLI path** in the same settings section. (`PROTON_DRIVE_CLI` is still honored, but Obsidian launched from the Dock usually does not see shell environment variables, so the setting is the reliable option.)

The command **File Externalizer: Check Setup** runs the same checks from the command palette.

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
- `tests`: Node tests. Domain logic is tested directly; the service is tested against an in-memory Obsidian vault and storage provider (`tests/helpers/fakeObsidian.ts`); the Proton provider is tested against a stand-in `proton-drive` executable written to a temp folder, so no Proton account is needed.

## Configuration

The plugin ships with generic defaults. Each vault configures its own storage root, cache folder, external-note folder, and document types in `.obsidian/plugins/file-externalizer/data.json` or through the plugin settings UI.

## Commands

- `File Externalizer: Register File`
- `File Externalizer: Open External File`
- `File Externalizer: Validate External File Notes`
- `File Externalizer: Check Setup`
