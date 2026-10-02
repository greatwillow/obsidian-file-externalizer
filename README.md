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

`main.js` is a build output and is not committed. Install your local build into a vault while developing:

```bash
npm run install:vault -- /path/to/your-vault
```

## Releasing

Releases follow the standard Obsidian plugin layout: each release is a git tag equal to the version (no `v` prefix) with `main.js`, `manifest.json` and `styles.css` attached.

```bash
npm version patch   # or minor / major: bumps package.json, manifest.json and versions.json, commits, and tags
git push --follow-tags
```

Pushing the tag runs `.github/workflows/release.yml`, which tests, builds, checks the tag matches `manifest.json`, and publishes the GitHub release. `versions.json` maps each plugin version to the minimum Obsidian version it needs.

## Installing a release into a vault

```bash
npm run install:release -- /path/to/your-vault          # latest release
npm run install:release -- /path/to/your-vault 0.2.0    # a specific version
```

This downloads the release files with the GitHub CLI (`gh auth login` first) into `.obsidian/plugins/file-externalizer/` and leaves the vault's `data.json` settings alone. Other people using the vault get the plugin through however the vault is shared (Obsidian Sync with community plugins enabled, or the vault's git repository), so only the maintainer runs this.

[BRAT](https://github.com/TfTHacker/obsidian42-brat) also works: add `greatwillow/obsidian-file-externalizer`, and give BRAT a GitHub token while the repository is private. BRAT auto-updates to the newest release, so prefer `install:release` if the vault should stay on a pinned version.

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
