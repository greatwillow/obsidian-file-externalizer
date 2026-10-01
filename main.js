/* THIS FILE IS GENERATED. Edit src/ instead. */
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FileExternalizerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// src/constants.ts
var PLUGIN_ID = "file-externalizer";
var COMMAND_REGISTER_FILE = `${PLUGIN_ID}:register-file`;
var COMMAND_OPEN_EXTERNAL_FILE = `${PLUGIN_ID}:open-external-file`;
var COMMAND_VALIDATE_EXTERNAL_FILE_NOTES = `${PLUGIN_ID}:validate-external-file-notes`;
var DEFAULT_DOCUMENT_TYPES = ["Documents", "Images", "Media", "Archives", "Other"];
var DEFAULT_CONTEXT_TYPES = ["Projects", "Areas", "People", "Organizations", "General"];

// src/settings.ts
var DEFAULT_SETTINGS = {
  cacheFolder: "File Externalizer Cache",
  contextTypes: [...DEFAULT_CONTEXT_TYPES],
  documentTypes: [...DEFAULT_DOCUMENT_TYPES],
  externalNotesFolder: "External Files",
  protonCliPath: "",
  provider: "proton-drive-cli",
  remoteRoot: ""
};
function normalizeSettings(input) {
  return {
    cacheFolder: nonEmpty(input?.cacheFolder, DEFAULT_SETTINGS.cacheFolder),
    contextTypes: nonEmptyList(input?.contextTypes, DEFAULT_SETTINGS.contextTypes),
    documentTypes: ensureOther(nonEmptyList(input?.documentTypes, DEFAULT_SETTINGS.documentTypes)),
    externalNotesFolder: nonEmpty(input?.externalNotesFolder, DEFAULT_SETTINGS.externalNotesFolder),
    protonCliPath: String(input?.protonCliPath || "").trim(),
    provider: input?.provider || DEFAULT_SETTINGS.provider,
    remoteRoot: String(input?.remoteRoot || DEFAULT_SETTINGS.remoteRoot).trim().replace(/\/+$/g, "")
  };
}
function nonEmpty(value, fallback) {
  const trimmed = String(value || "").trim();
  return trimmed || fallback;
}
function nonEmptyList(value, fallback) {
  const next = Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
  return next.length ? Array.from(new Set(next)) : [...fallback];
}
function ensureOther(values) {
  return values.some((value) => value.toLowerCase() === "other") ? values : [...values, "Other"];
}

// src/platform/obsidianVault.ts
var import_node_path2 = __toESM(require("node:path"), 1);

// src/domain/paths.ts
var import_node_path = __toESM(require("node:path"), 1);
function normalizeRemoteFolder(folderPath, remoteRoot) {
  const normalized = String(folderPath || "").trim().replace(/\/+$/g, "");
  const root = remoteRoot.replace(/\/+$/g, "");
  if (!root) return normalized;
  if (!normalized || normalized === root) return root;
  if (!normalized.startsWith(`${root}/`)) return root;
  return normalized;
}
function joinRemotePath(parentPath, childName) {
  const cleanChild = String(childName || "").trim().replace(/^\/+|\/+$/g, "");
  if (!cleanChild) return parentPath;
  return `${parentPath.replace(/\/+$/g, "")}/${cleanChild}`;
}
function parentRemotePath(currentPath, remoteRoot) {
  const root = remoteRoot.replace(/\/+$/g, "");
  if (currentPath === root) return root;
  const parent = currentPath.replace(/\/+$/g, "").replace(/\/[^/]+$/, "");
  return parent && parent.startsWith(root) ? parent : root;
}
function pathName(folderPath, remoteRoot) {
  const normalized = normalizeRemoteFolder(folderPath, remoteRoot);
  if (normalized === remoteRoot) return "External Files";
  return normalized.split("/").filter(Boolean).pop() || normalized;
}
function isRemoteRoot(folderPath, remoteRoot) {
  return normalizeRemoteFolder(folderPath, remoteRoot) === remoteRoot;
}
function descendantOrSame(candidate, base) {
  return candidate === base || String(candidate || "").startsWith(`${base}/`);
}
function replacePathPrefix(text, oldPath, newPath) {
  if (!oldPath) return String(text || "");
  const pattern = new RegExp(`${escapeRegExp(oldPath)}(?=$|[/"'\`)\\]|>,;\\t\\r\\n])`, "gm");
  return String(text || "").replace(pattern, () => newPath);
}
function safeRelativeRemotePath(remotePath, remoteRoot) {
  const root = remoteRoot.replace(/\/+$/g, "");
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}/?`) : null;
  return String(remotePath || "").replace(rootPattern || /^/, "").replace(/^\/+/, "").split("/").map((part) => part.replace(/[\\:*?"<>|]/g, "-")).join("/");
}
function deriveContextType(remoteFolder, remoteRoot, contextTypes) {
  const first = normalizeRemoteFolder(remoteFolder, remoteRoot).slice(remoteRoot.length).split("/").filter(Boolean)[0];
  return contextTypes.includes(first) ? first : "General";
}
function deriveContextName(remoteFolder, remoteRoot) {
  const parts = normalizeRemoteFolder(remoteFolder, remoteRoot).slice(remoteRoot.length).split("/").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1 && parts[0] !== "General") return parts[0];
  return "General";
}
function toPosixPath(filePath) {
  return filePath.split(import_node_path.default.sep).join("/");
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/platform/obsidianVault.ts
function getVaultPath(app) {
  const adapter = app.vault.adapter;
  if (typeof adapter.getBasePath === "function") return adapter.getBasePath();
  if (adapter.basePath) return adapter.basePath;
  throw new Error("File Externalizer requires the desktop filesystem adapter.");
}
function vaultRelativePath(vaultPath, absolutePath) {
  return toPosixPath(import_node_path2.default.relative(vaultPath, absolutePath));
}
async function uniqueMarkdownPath(app, requestedPath) {
  if (!await app.vault.adapter.exists(requestedPath)) return requestedPath;
  const ext = import_node_path2.default.posix.extname(requestedPath);
  const base = requestedPath.slice(0, -ext.length);
  for (let i = 2; i < 1e3; i += 1) {
    const candidate = `${base} ${i}${ext}`;
    if (!await app.vault.adapter.exists(candidate)) return candidate;
  }
  throw new Error("Could not create a unique note path.");
}
function activeMarkdownFile(app) {
  const file = app.workspace.getActiveFile();
  return file && file.extension === "md" ? file : null;
}
function findExternalFileNote(app) {
  const active = activeMarkdownFile(app);
  if (active && fileHasRemotePath(app, active)) return active;
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const file = leaf?.view && "file" in leaf.view ? leaf.view.file : null;
    if (file && file.extension === "md" && fileHasRemotePath(app, file)) return file;
  }
  return active;
}
function fileHasRemotePath(app, file) {
  const cache = app.metadataCache.getFileCache(file);
  return Boolean(cache?.frontmatter?.remote_path || cache?.frontmatter?.proton_path);
}

// src/services/fileExternalizerService.ts
var import_node_fs3 = __toESM(require("node:fs"), 1);
var import_node_path7 = __toESM(require("node:path"), 1);
var import_node_child_process2 = require("node:child_process");

// src/domain/documentType.ts
function normalizeDocumentType(value, documentTypes) {
  const normalized = normalizedLabel(value);
  return documentTypes.find((type) => normalizedLabel(type) === normalized) || fallbackDocumentType(documentTypes);
}
function normalizedLabel(value) {
  return String(value || "").trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}
function fallbackDocumentType(documentTypes) {
  return documentTypes.find((type) => normalizedLabel(type) === "other") || documentTypes[0] || "Other";
}

// src/domain/externalFileNote.ts
var import_node_path4 = __toESM(require("node:path"), 1);

// src/domain/frontmatter.ts
function parseFrontmatter(text) {
  const match = String(text || "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (!match) return out;
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    value = value.replace(/^"|"$/g, "");
    out[key] = value;
  }
  return out;
}
function yamlString(value) {
  return JSON.stringify(String(value));
}
function yamlScalar(value) {
  return String(value || "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-").toLowerCase();
}
function setFrontmatterFields(text, updates) {
  const source = String(text || "");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return source;
  const remaining = { ...updates };
  const lines = match[1].split(/\r?\n/).map((line) => {
    const idx = line.indexOf(":");
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
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---${eol}${lines.join(eol)}${eol}---`);
}
function frontmatterValue(update) {
  if (update.raw) return String(update.value);
  if (update.value === "none") return "none";
  if (update.quote) return yamlString(update.value);
  return String(update.value);
}

// src/domain/filename.ts
var import_node_path3 = __toESM(require("node:path"), 1);
function slugTitle(value) {
  return String(value || "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}
function normalizeUploadFilename(input, sourceFile) {
  const sourceExt = import_node_path3.default.extname(sourceFile || "");
  let filename = String(input || "").trim();
  if (!filename && sourceFile) filename = import_node_path3.default.basename(sourceFile);
  if (!filename) throw new Error("Upload filename is required.");
  if (/[\\/:*?"<>|]/.test(filename)) {
    throw new Error('Upload filename cannot contain / \\ : * ? " < > |');
  }
  if (!import_node_path3.default.extname(filename) && sourceExt) filename += sourceExt;
  return filename;
}
function defaultTitleForFile(filePath, now = /* @__PURE__ */ new Date()) {
  const date = now.toISOString().slice(0, 10);
  const parsed = import_node_path3.default.parse(filePath || "");
  return slugTitle(`${date} ${parsed.name || "External File"}`);
}

// src/domain/externalFileNote.ts
function externalFileNoteFolder(rootFolder, documentType, documentTypes) {
  return import_node_path4.default.posix.join(rootFolder, normalizeDocumentType(documentType, documentTypes));
}
function buildExternalFileNote(input, documentTypes) {
  const title = slugTitle(input.title);
  const documentType = normalizeDocumentType(input.documentType, documentTypes);
  return `---
title: ${title}
type: external-file
status: active
document_type: ${yamlScalar(documentType)}
storage: external
storage_provider: ${input.provider}
storage_folder: ${yamlString(input.remoteFolder)}
remote_path: ${yamlString(input.remotePath)}
share_link: ${input.shareLink === "none" ? "none" : yamlString(input.shareLink)}
original_filename: ${yamlString(input.originalFilename)}
upload_filename: ${yamlString(input.uploadFilename)}
file_size_bytes: ${input.size}
context_type: ${input.contextType}
context_name: ${yamlString(input.contextName)}
created: ${input.date}
updated: ${input.date}
---

# ${title}

Stored outside the vault.

Storage folder: \`${input.remoteFolder}\`

## Open

\`\`\`meta-bind-button
label: Open External File
style: primary
action:
  type: command
  command: ${COMMAND_OPEN_EXTERNAL_FILE}
\`\`\`

## Summary

-
`;
}
function updateExternalFileTextForFolderRename(text, oldPath, newPath, today, remoteRoot, contextTypes) {
  const fm = parseFrontmatter(text);
  const oldStorage = fm.storage_folder || "";
  const oldRemote = fm.remote_path || fm.proton_path || "";
  const affected = descendantOrSame(oldStorage, oldPath) || descendantOrSame(oldRemote, oldPath);
  if (!affected) return text;
  const replaced = replacePathPrefix(text, oldPath, newPath);
  const newStorage = oldStorage ? replacePathPrefix(oldStorage, oldPath, newPath) : "";
  const updates = {
    updated: { value: today },
    ...newStorage ? {
      context_type: { value: deriveContextType(newStorage, remoteRoot, contextTypes) },
      context_name: { value: deriveContextName(newStorage, remoteRoot), quote: true }
    } : {}
  };
  return setFrontmatterFields(replaced, updates);
}
function markExternalFileTextMissing(text, folderOrFilePath, today, reason = "External file not found") {
  const fm = parseFrontmatter(text);
  const affected = descendantOrSame(fm.storage_folder || "", folderOrFilePath) || descendantOrSame(fm.remote_path || fm.proton_path || "", folderOrFilePath);
  if (!affected) return text;
  return setFrontmatterFields(text, {
    status: { value: "missing" },
    updated: { value: today },
    missing_reason: { value: reason, quote: true }
  });
}

// src/providers/protonDriveCliProvider.ts
var import_node_child_process = require("node:child_process");
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_os = __toESM(require("node:os"), 1);
var import_node_path5 = __toESM(require("node:path"), 1);
var import_node_util = require("node:util");
var execFile = (0, import_node_util.promisify)(import_node_child_process.execFile);
var PROTON_CLI_INSTALL_URL = "https://proton.me/support/drive-cli";
var PROTON_DEFAULT_ROOT = "/my-files";
var LOGIN_TIMEOUT_MS = 5 * 60 * 1e3;
var ProtonDriveCliProvider = class {
  constructor(options = {}) {
    this.options = options;
  }
  resolvedCliPath = null;
  /** Resolves the CLI lazily so the plugin still loads when Proton is not installed yet. */
  cliPath() {
    if (!this.resolvedCliPath) this.resolvedCliPath = findProtonDriveCli(this.options.cliPath, this.options.probe);
    return this.resolvedCliPath;
  }
  async checkSetup(remoteRoot) {
    const checks = [];
    let cliPath;
    try {
      cliPath = this.cliPath();
      checks.push({ label: "Proton Drive CLI", ok: true, detail: cliPath });
    } catch {
      checks.push({
        label: "Proton Drive CLI",
        ok: false,
        detail: `Not found. Install it from ${PROTON_CLI_INSTALL_URL}, or set the CLI path in settings.`
      });
      return { ready: false, checks };
    }
    const root = remoteRoot.replace(/\/+$/g, "");
    try {
      await this.run(["filesystem", "list", root || PROTON_DEFAULT_ROOT, "--json"]);
      checks.push({ label: "Signed in", ok: true, detail: "Proton Drive responded." });
      checks.push(root ? { label: "Remote root", ok: true, detail: root } : { label: "Remote root", ok: false, detail: "Not configured. Set the remote root in settings." });
    } catch (error) {
      if (isMissingRemotePathError(error) && root) {
        checks.push({ label: "Signed in", ok: true, detail: "Proton Drive responded." });
        checks.push({ label: "Remote root", ok: false, detail: `${root} was not found, or this account cannot see it.` });
      } else if (isAuthError(error)) {
        checks.push({ label: "Signed in", ok: false, detail: 'Not signed in. Use "Log in to Proton".' });
      } else {
        checks.push({ label: "Signed in", ok: false, detail: firstLine(error) || `${cliPath} could not reach Proton Drive.` });
      }
    }
    return { ready: checks.every((check) => check.ok), checks };
  }
  /**
   * Runs `proton-drive auth login`, which completes in the browser, and waits for it to finish.
   * `onUrl` receives the first sign-in link the CLI prints, in case the browser did not open on its own.
   */
  login(onUrl) {
    const cliPath = this.cliPath();
    return new Promise((resolve, reject) => {
      const child = (0, import_node_child_process.spawn)(cliPath, ["auth", "login"], { stdio: ["ignore", "pipe", "pipe"] });
      let output = "";
      let urlReported = false;
      const collect = (chunk) => {
        output += chunk.toString("utf8");
        const url = urlReported ? null : findUrl(output);
        if (url && onUrl) {
          urlReported = true;
          onUrl(url);
        }
      };
      child.stdout?.on("data", collect);
      child.stderr?.on("data", collect);
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("Proton login timed out. Try again, or run `proton-drive auth login` in a terminal."));
      }, LOGIN_TIMEOUT_MS);
      child.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve({ output, url: findUrl(output) });
        else reject(new Error(`Proton login failed (exit ${code}).${output.trim() ? `
${output.trim()}` : ""}`));
      });
    });
  }
  async createFolder(parentPath, name) {
    await this.run(["filesystem", "create-folder", parentPath, name, "--json"]);
  }
  async downloadFile(remotePath, destinationFolder) {
    await this.run(["filesystem", "download", "-f", "remove", remotePath, destinationFolder]);
    const downloaded = import_node_path5.default.join(destinationFolder, import_node_path5.default.basename(remotePath));
    if (!import_node_fs.default.existsSync(downloaded)) throw new Error("Download completed, but expected file was not found.");
    const stat = import_node_fs.default.statSync(downloaded);
    return {
      modifiedTime: stat.mtime.toISOString(),
      path: downloaded,
      size: stat.size
    };
  }
  async listFolders(parentPath) {
    const raw = await this.run(["filesystem", "list", parentPath, "--json"]);
    const items = JSON.parse(raw || "[]");
    return items.filter((item) => item && item.type === "folder").map(protonItemName).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }
  async renameFolder(oldPath, newName) {
    await this.run(["filesystem", "rename", oldPath, newName]);
  }
  async stat(remotePath) {
    const raw = await this.run(["filesystem", "info", remotePath, "--json"]);
    const item = JSON.parse(raw || "{}");
    return {
      modifiedTime: newestTime(item),
      path: remotePath,
      size: item.totalStorageSize || item.activeRevision?.claimedSize || item.activeRevision?.storageSize || 0
    };
  }
  async trashFolder(remotePath) {
    await this.run(["filesystem", "trash", remotePath]);
  }
  async uploadFile(input) {
    const prepared = prepareUploadFile(input.localPath, input.remoteName);
    try {
      await this.run(["filesystem", "upload", "-f", "replace", "-d", "merge", prepared.uploadPath, input.remoteFolder, "--json"]);
      return this.stat(joinRemotePath(input.remoteFolder, input.remoteName));
    } finally {
      prepared.cleanup();
    }
  }
  async run(args) {
    try {
      const result = await execFile(this.cliPath(), args, { encoding: "utf8" });
      return result.stdout || "";
    } catch (error) {
      throw decorateCliError(this.cliPath(), args, error);
    }
  }
};
function protonDriveCliCandidates(configuredPath = "", env = process.env, home = import_node_os.default.homedir()) {
  const candidates = [
    configuredPath.trim(),
    env.PROTON_DRIVE_CLI,
    "proton-drive",
    import_node_path5.default.join(home, ".local/bin/proton-drive"),
    "/opt/homebrew/bin/proton-drive",
    "/usr/local/bin/proton-drive"
  ].filter(Boolean);
  return Array.from(new Set(candidates));
}
function findProtonDriveCli(configuredPath = "", probe = probeCli) {
  for (const candidate of protonDriveCliCandidates(configuredPath)) {
    if (probe(candidate)) return candidate;
  }
  throw new Error("Could not find proton-drive CLI. Install it or set the CLI path in File Externalizer settings.");
}
function probeCli(candidate) {
  return (0, import_node_child_process.spawnSync)(candidate, ["--help"], { encoding: "utf8" }).status === 0;
}
function isAuthError(error) {
  const err = error;
  const output = `${err?.stderr || ""}
${err?.stdout || ""}`.trim() || err?.message || "";
  return /not (logged|signed) in|log ?in|sign ?in|unauthori[sz]ed|unauthenticated|authenticat|\b401\b|session (has )?expired/i.test(output);
}
function errorText(error) {
  const err = error;
  return `${err?.message || ""}
${err?.stderr || ""}
${err?.stdout || ""}`.toLowerCase();
}
function firstLine(error) {
  const err = error;
  return String(err?.stderr || err?.message || "").trim().split(/\r?\n/)[0] || "";
}
function findUrl(text) {
  const match = text.match(/https:\/\/\S+/);
  return match ? match[0] : null;
}
function isMissingRemotePathError(error) {
  const message = errorText(error);
  return message.includes("not found") || message.includes("does not exist") || message.includes("no such file") || message.includes("404");
}
function protonItemName(item) {
  if (!item) return "";
  if (typeof item.name === "string") return item.name;
  if (item.name && typeof item.name.value === "string") return item.name.value;
  return "";
}
function newestTime(item) {
  return item.modificationTime || item.activeRevision?.creationTime || item.creationTime || "";
}
function prepareUploadFile(localPath, remoteName) {
  if (import_node_path5.default.basename(localPath) === remoteName) return { uploadPath: localPath, cleanup: () => void 0 };
  const tempDir = import_node_fs.default.mkdtempSync(import_node_path5.default.join(import_node_os.default.tmpdir(), "file-externalizer-upload-"));
  const uploadPath = import_node_path5.default.join(tempDir, remoteName);
  import_node_fs.default.copyFileSync(localPath, uploadPath);
  return {
    uploadPath,
    cleanup: () => import_node_fs.default.rmSync(tempDir, { recursive: true, force: true })
  };
}
function decorateCliError(cliPath, args, error) {
  const err = error;
  const details = [
    err.message,
    err.stderr && `stderr: ${err.stderr.trim()}`,
    err.stdout && `stdout: ${err.stdout.trim()}`
  ].filter(Boolean).join("\n");
  const wrapped = new Error(`${cliPath} ${args.join(" ")} failed${details ? `
${details}` : ""}`);
  wrapped.stderr = err.stderr;
  wrapped.stdout = err.stdout;
  return wrapped;
}

// src/services/cacheService.ts
var import_node_fs2 = __toESM(require("node:fs"), 1);
var import_node_path6 = __toESM(require("node:path"), 1);
var CacheService = class {
  constructor(vaultPath, cacheFolder, remoteRoot) {
    this.vaultPath = vaultPath;
    this.cacheFolder = cacheFolder;
    this.remoteRoot = remoteRoot;
  }
  cachePathForRemote(remotePath) {
    return import_node_path6.default.join(this.cacheRoot(), safeRelativeRemotePath(remotePath, this.remoteRoot));
  }
  seedFromLocalFile(localPath, remotePath, remoteTime) {
    const cachePath = this.cachePathForRemote(remotePath);
    import_node_fs2.default.mkdirSync(import_node_path6.default.dirname(cachePath), { recursive: true });
    import_node_fs2.default.copyFileSync(localPath, cachePath);
    const index = this.readIndex();
    index[remotePath] = {
      cachePath: import_node_path6.default.relative(this.vaultPath, cachePath),
      remoteTime,
      cachedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeIndex(index);
  }
  has(remotePath) {
    return import_node_fs2.default.existsSync(this.cachePathForRemote(remotePath));
  }
  remapFolder(oldPath, newPath) {
    const oldCachePath = this.cachePathForRemote(oldPath);
    const newCachePath = this.cachePathForRemote(newPath);
    mergeMovePath(oldCachePath, newCachePath);
    removeEmptyParents(import_node_path6.default.dirname(oldCachePath), this.cacheRoot());
    const index = this.readIndex();
    const next = {};
    for (const [key, value] of Object.entries(index)) {
      if (key === oldPath || key.startsWith(`${oldPath}/`)) {
        const newKey = key.replace(oldPath, newPath);
        next[newKey] = {
          ...value,
          cachePath: import_node_path6.default.relative(this.vaultPath, this.cachePathForRemote(newKey))
        };
      } else {
        next[key] = value;
      }
    }
    this.writeIndex(next);
  }
  removeFolder(folderPath) {
    const target = this.cachePathForRemote(folderPath);
    import_node_fs2.default.rmSync(target, { recursive: true, force: true });
    removeEmptyParents(import_node_path6.default.dirname(target), this.cacheRoot());
    const index = this.readIndex();
    const next = {};
    for (const [key, value] of Object.entries(index)) {
      if (key !== folderPath && !key.startsWith(`${folderPath}/`)) next[key] = value;
    }
    this.writeIndex(next);
  }
  cacheRoot() {
    return import_node_path6.default.join(this.vaultPath, this.cacheFolder);
  }
  indexPath() {
    return import_node_path6.default.join(this.cacheRoot(), ".cache-index.json");
  }
  readIndex() {
    const indexPath = this.indexPath();
    if (!import_node_fs2.default.existsSync(indexPath)) return {};
    try {
      return JSON.parse(import_node_fs2.default.readFileSync(indexPath, "utf8"));
    } catch {
      return {};
    }
  }
  writeIndex(index) {
    import_node_fs2.default.mkdirSync(import_node_path6.default.dirname(this.indexPath()), { recursive: true });
    import_node_fs2.default.writeFileSync(this.indexPath(), JSON.stringify(index, null, 2));
  }
};
function mergeMovePath(fromPath, toPath) {
  if (!import_node_fs2.default.existsSync(fromPath)) return;
  if (!import_node_fs2.default.existsSync(toPath)) {
    import_node_fs2.default.mkdirSync(import_node_path6.default.dirname(toPath), { recursive: true });
    import_node_fs2.default.renameSync(fromPath, toPath);
    return;
  }
  const stat = import_node_fs2.default.statSync(fromPath);
  if (stat.isDirectory()) {
    import_node_fs2.default.mkdirSync(toPath, { recursive: true });
    for (const name of import_node_fs2.default.readdirSync(fromPath)) {
      mergeMovePath(import_node_path6.default.join(fromPath, name), import_node_path6.default.join(toPath, name));
    }
    import_node_fs2.default.rmSync(fromPath, { recursive: true, force: true });
  } else {
    import_node_fs2.default.mkdirSync(import_node_path6.default.dirname(toPath), { recursive: true });
    import_node_fs2.default.rmSync(toPath, { force: true });
    import_node_fs2.default.renameSync(fromPath, toPath);
  }
}
function removeEmptyParents(startPath, stopPath) {
  let current = startPath;
  const stop = import_node_path6.default.resolve(stopPath);
  while (import_node_path6.default.resolve(current).startsWith(stop) && import_node_path6.default.resolve(current) !== stop) {
    try {
      if (import_node_fs2.default.existsSync(current) && import_node_fs2.default.readdirSync(current).length === 0) import_node_fs2.default.rmdirSync(current);
      else return;
    } catch {
      return;
    }
    current = import_node_path6.default.dirname(current);
  }
}

// src/services/fileExternalizerService.ts
var FileExternalizerService = class {
  constructor(app, settings = DEFAULT_SETTINGS, provider) {
    this.app = app;
    this.settings = settings;
    this.provider = provider || new ProtonDriveCliProvider({ cliPath: settings.protonCliPath });
  }
  provider;
  async checkSetup() {
    if (!this.provider.checkSetup) {
      return { ready: true, checks: [{ label: "Storage provider", ok: true, detail: "No setup checks for this provider." }] };
    }
    return this.provider.checkSetup(this.settings.remoteRoot);
  }
  async login(onUrl) {
    if (!this.provider.login) throw new Error("This storage provider has no sign-in step.");
    return this.provider.login(onUrl);
  }
  async registerFile(input) {
    if (!this.settings.remoteRoot) throw new Error("File Externalizer remote root is not configured.");
    const vaultPath = getVaultPath(this.app);
    const localFile = import_node_path7.default.resolve(input.filePath);
    if (!import_node_fs3.default.existsSync(localFile)) throw new Error(`File not found: ${localFile}`);
    const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const title = slugTitle(input.title || defaultTitleForFile(localFile));
    const uploadFilename = normalizeUploadFilename(input.uploadFilename, localFile);
    const documentType = normalizeDocumentType(input.documentType, this.settings.documentTypes);
    const remoteFolder = input.destinationFolder;
    const remotePath = joinRemotePath(remoteFolder, uploadFilename);
    const uploaded = await this.provider.uploadFile({
      localPath: localFile,
      remoteFolder,
      remoteName: uploadFilename
    });
    this.cache(vaultPath).seedFromLocalFile(localFile, remotePath, uploaded.modifiedTime);
    const noteFolder = externalFileNoteFolder(this.settings.externalNotesFolder, documentType, this.settings.documentTypes);
    await this.app.vault.createFolder(noteFolder).catch(() => void 0);
    const noteRel = await uniqueMarkdownPath(this.app, import_node_path7.default.posix.join(noteFolder, `${title}.md`));
    const size = import_node_fs3.default.statSync(localFile).size;
    const note = buildExternalFileNote({
      title,
      documentType,
      remoteFolder,
      provider: this.settings.provider,
      remotePath,
      shareLink: input.shareLink ? "pending" : "none",
      originalFilename: import_node_path7.default.basename(localFile),
      uploadFilename,
      size,
      contextType: deriveContextType(remoteFolder, this.settings.remoteRoot, this.settings.contextTypes),
      contextName: deriveContextName(remoteFolder, this.settings.remoteRoot),
      date
    }, this.settings.documentTypes);
    const created = await this.app.vault.create(noteRel, note);
    return {
      link: `[[${created.basename}]]`,
      notePath: import_node_path7.default.join(vaultPath, created.path),
      remotePath,
      storageFolder: remoteFolder
    };
  }
  async openExternalFile(note, open = true) {
    const vaultPath = getVaultPath(this.app);
    const text = await this.app.vault.read(note);
    const fm = parseFrontmatter(text);
    const remotePath = fm.remote_path || fm.proton_path;
    if (!remotePath) throw new Error("Active note has no remote_path property.");
    const cache = this.cache(vaultPath);
    const cachePath = cache.cachePathForRemote(remotePath);
    const cacheHit = import_node_fs3.default.existsSync(cachePath);
    if (!cacheHit) {
      import_node_fs3.default.mkdirSync(import_node_path7.default.dirname(cachePath), { recursive: true });
      const tempDir = import_node_fs3.default.mkdtempSync(import_node_path7.default.join(cache.cacheRoot(), ".download-"));
      try {
        const downloaded = await this.provider.downloadFile(remotePath, tempDir);
        import_node_fs3.default.renameSync(downloaded.path, cachePath);
        const info = await this.provider.stat(remotePath);
        const index = cache.readIndex();
        index[remotePath] = {
          cachePath: import_node_path7.default.relative(vaultPath, cachePath),
          remoteTime: info.modifiedTime,
          cachedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        cache.writeIndex(index);
      } finally {
        import_node_fs3.default.rmSync(tempDir, { recursive: true, force: true });
      }
    }
    if (open) openFile(cachePath);
    return { opened: cachePath, cacheHit, remotePath };
  }
  async renameFolder(oldPath, newName) {
    await this.provider.renameFolder(oldPath, newName);
    const newPath = joinRemotePath(parentRemotePath(oldPath, this.settings.remoteRoot), newName);
    const changed = await this.updateVaultPathReferences(oldPath, newPath);
    this.cache(getVaultPath(this.app)).remapFolder(oldPath, newPath);
    return changed;
  }
  async trashFolder(folderPath) {
    await this.provider.trashFolder(folderPath);
    this.cache(getVaultPath(this.app)).removeFolder(folderPath);
    return this.markDeletedFolderNotes(folderPath);
  }
  async updateVaultPathReferences(oldPath, newPath) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    let changed = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      if (!text.includes(oldPath)) continue;
      const fm = parseFrontmatter(text);
      const updated = fm.type === "external-file" ? updateExternalFileTextForFolderRename(text, oldPath, newPath, today, this.settings.remoteRoot, this.settings.contextTypes) : replacePathPrefix(text, oldPath, newPath);
      if (updated !== text) {
        await this.app.vault.modify(file, updated);
        changed += 1;
      }
    }
    return changed;
  }
  async markDeletedFolderNotes(folderPath) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    let changed = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      if (!text.includes(folderPath)) continue;
      const updated = markExternalFileTextMissing(text, folderPath, today, "External storage folder moved to trash");
      if (updated !== text) {
        await this.app.vault.modify(file, updated);
        changed += 1;
      }
    }
    return changed;
  }
  async validateExternalFileNotes() {
    let found = 0;
    let missing = 0;
    let errors = 0;
    let changed = 0;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    for (const file of this.app.vault.getMarkdownFiles()) {
      const text = await this.app.vault.read(file);
      const fm = parseFrontmatter(text);
      const remotePath = fm.remote_path || fm.proton_path;
      if (fm.type !== "external-file" || !remotePath) continue;
      try {
        await this.provider.stat(remotePath);
        found += 1;
      } catch (error) {
        if (!isMissingRemotePathError(error)) {
          errors += 1;
          console.warn(`Could not validate ${file.path}:`, error);
          continue;
        }
        missing += 1;
        const updated = markExternalFileTextMissing(text, remotePath, today, "External file not found during validation");
        if (updated !== text) {
          await this.app.vault.modify(file, updated);
          changed += 1;
        }
      }
    }
    return { found, missing, changed, errors };
  }
  async openCreatedNote(absoluteNotePath) {
    const vaultPath = getVaultPath(this.app);
    const rel = vaultRelativePath(vaultPath, absoluteNotePath);
    const file = this.app.vault.getAbstractFileByPath(rel);
    if (file instanceof Object && "extension" in file) {
      await this.app.workspace.getLeaf(false).openFile(file);
    }
  }
  cache(vaultPath) {
    return new CacheService(vaultPath, this.settings.cacheFolder, this.settings.remoteRoot);
  }
};
function openFile(filePath) {
  if (process.platform === "darwin") {
    (0, import_node_child_process2.spawnSync)(import_node_fs3.default.existsSync("/usr/bin/open") ? "/usr/bin/open" : "open", [filePath], { stdio: "ignore" });
    return;
  }
  if (process.platform === "win32") {
    (0, import_node_child_process2.spawnSync)("cmd", ["/c", "start", "", filePath], { stdio: "ignore" });
    return;
  }
  (0, import_node_child_process2.spawnSync)("xdg-open", [filePath], { stdio: "ignore" });
}

// src/ui/registerFileModal.ts
var import_obsidian3 = require("obsidian");
var import_node_path8 = __toESM(require("node:path"), 1);

// src/ui/folderPickerModal.ts
var import_obsidian2 = require("obsidian");

// src/ui/simpleModals.ts
var import_obsidian = require("obsidian");
var ConfirmTextModal = class extends import_obsidian.Modal {
  constructor(app, titleText, message, expectedText, actionLabel, onConfirm) {
    super(app);
    this.titleText = titleText;
    this.message = message;
    this.expectedText = expectedText;
    this.actionLabel = actionLabel;
    this.onConfirm = onConfirm;
  }
  typed = "";
  onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("file-externalizer-modal");
    this.contentEl.createEl("h2", { text: this.titleText });
    this.contentEl.createEl("p", { cls: "file-externalizer-help", text: this.message });
    this.contentEl.createEl("p", { cls: "file-externalizer-help", text: `Type ${this.expectedText} to confirm.` });
    const input = this.contentEl.createEl("input");
    input.type = "text";
    input.addClass("file-externalizer-confirm-input");
    input.oninput = () => {
      this.typed = input.value.trim();
    };
    const actions = this.contentEl.createEl("div", { cls: "file-externalizer-toolbar" });
    const confirm = actions.createEl("button", { text: this.actionLabel });
    confirm.type = "button";
    confirm.addClass("mod-warning");
    confirm.onclick = () => {
      if (this.typed !== this.expectedText) return;
      this.close();
      this.onConfirm();
    };
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.type = "button";
    cancel.onclick = () => this.close();
    input.focus();
  }
};
var RenameFolderModal = class extends import_obsidian.Modal {
  constructor(app, currentPath, currentName, onRename) {
    super(app);
    this.currentPath = currentPath;
    this.onRename = onRename;
    this.newName = currentName;
  }
  newName;
  onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("file-externalizer-modal");
    this.contentEl.createEl("h2", { text: "Rename Folder" });
    this.contentEl.createEl("p", { cls: "file-externalizer-help", text: this.currentPath });
    const input = this.contentEl.createEl("input");
    input.type = "text";
    input.value = this.newName;
    input.addClass("file-externalizer-confirm-input");
    input.oninput = () => {
      this.newName = input.value.trim();
    };
    const actions = this.contentEl.createEl("div", { cls: "file-externalizer-toolbar" });
    const rename = actions.createEl("button", { text: "Rename" });
    rename.type = "button";
    rename.addClass("mod-cta");
    rename.onclick = () => {
      if (!this.newName || this.newName.includes("/")) return;
      this.close();
      this.onRename(this.newName);
    };
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.type = "button";
    cancel.onclick = () => this.close();
    input.focus();
    input.select();
  }
};
var NewFolderModal = class extends import_obsidian.Modal {
  constructor(app, parentPath, onCreate) {
    super(app);
    this.parentPath = parentPath;
    this.onCreate = onCreate;
  }
  folderName = "";
  onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("file-externalizer-modal");
    this.contentEl.createEl("h2", { text: "New Folder" });
    this.contentEl.createEl("p", { cls: "file-externalizer-help", text: `Create a folder under ${this.parentPath}` });
    const input = this.contentEl.createEl("input");
    input.type = "text";
    input.placeholder = "Folder name";
    input.addClass("file-externalizer-confirm-input");
    input.oninput = () => {
      this.folderName = input.value.trim();
    };
    const actions = this.contentEl.createEl("div", { cls: "file-externalizer-toolbar" });
    const create = actions.createEl("button", { text: "Create folder" });
    create.type = "button";
    create.addClass("mod-cta");
    create.onclick = () => {
      if (!this.folderName || this.folderName.includes("/")) return;
      this.close();
      this.onCreate(this.folderName);
    };
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.type = "button";
    cancel.onclick = () => this.close();
    input.focus();
  }
};

// src/ui/folderPickerModal.ts
var FolderPickerModal = class extends import_obsidian2.Modal {
  constructor(app, service, remoteRoot, initialPath, onChoose) {
    super(app);
    this.service = service;
    this.remoteRoot = remoteRoot;
    this.onChoose = onChoose;
    this.selectedPath = normalizeRemoteFolder(initialPath, remoteRoot);
    this.expanded.add(remoteRoot);
    this.expandAncestors(this.selectedPath);
  }
  expanded = /* @__PURE__ */ new Set();
  folderCache = /* @__PURE__ */ new Map();
  loading = /* @__PURE__ */ new Set();
  errorEl = null;
  pathEl = null;
  selectedPath;
  treeEl = null;
  onOpen() {
    this.modalEl.addClass("file-externalizer-modal-frame");
    this.contentEl.empty();
    this.contentEl.addClass("file-externalizer-modal");
    this.contentEl.createEl("h2", { text: "Choose Destination Folder" });
    this.contentEl.createEl("p", {
      cls: "file-externalizer-help",
      text: "Select a folder in the tree. Folder lists are cached while this picker is open, and nearby folders preload in the background."
    });
    this.pathEl = this.contentEl.createEl("div", { cls: "file-externalizer-current-path" });
    this.errorEl = this.contentEl.createEl("div", { cls: "file-externalizer-error" });
    this.errorEl.hide();
    const toolbar = this.contentEl.createEl("div", { cls: "file-externalizer-toolbar" });
    this.createButton(toolbar, "Use selected folder", "mod-cta", () => this.choose());
    this.createButton(toolbar, "New folder", "", () => this.createFolderSelected());
    this.createButton(toolbar, "Rename selected", "", () => this.renameSelected());
    this.createButton(toolbar, "Delete selected", "mod-warning", () => this.deleteSelected());
    this.createButton(toolbar, "Refresh", "", () => this.refreshSelected());
    this.treeEl = this.contentEl.createEl("div", { cls: "file-externalizer-folder-tree" });
    this.renderTree();
    void this.ensureLoaded(this.remoteRoot, true);
  }
  choose() {
    this.onChoose(this.selectedPath);
    this.close();
  }
  createButton(parent, text, cls, onClick) {
    const button = parent.createEl("button", { text });
    button.type = "button";
    if (cls) button.addClass(cls);
    button.onclick = onClick;
    return button;
  }
  expandAncestors(folderPath) {
    let current = normalizeRemoteFolder(folderPath, this.remoteRoot);
    while (current && current !== this.remoteRoot) {
      this.expanded.add(parentRemotePath(current, this.remoteRoot));
      current = parentRemotePath(current, this.remoteRoot);
    }
  }
  renderTree() {
    if (!this.treeEl || !this.pathEl) return;
    this.pathEl.setText(`Selected folder: ${this.selectedPath}`);
    this.treeEl.empty();
    this.renderNode(this.remoteRoot, 0);
  }
  renderNode(folderPath, depth) {
    if (!this.treeEl) return;
    const row = this.treeEl.createEl("div", { cls: "file-externalizer-tree-row" });
    if (folderPath === this.selectedPath) row.addClass("is-selected");
    row.style.setProperty("--depth", String(depth));
    const toggle = row.createEl("button", { cls: "file-externalizer-tree-toggle" });
    toggle.type = "button";
    const loadedChildren = this.folderCache.get(folderPath);
    const hasLoadedChildren = Array.isArray(loadedChildren) && loadedChildren.length > 0;
    toggle.setText(this.expanded.has(folderPath) ? "\u25BE" : "\u25B8");
    toggle.onclick = (event) => {
      event.stopPropagation();
      void this.toggleFolder(folderPath);
    };
    const name = row.createEl("button", { cls: "file-externalizer-tree-name" });
    name.type = "button";
    name.createEl("span", { text: pathName(folderPath, this.remoteRoot) });
    name.onclick = () => this.selectFolder(folderPath);
    name.ondblclick = () => {
      void this.toggleFolder(folderPath);
    };
    row.createEl("span", { cls: "file-externalizer-tree-status", text: this.loading.has(folderPath) ? "Loading..." : "" });
    if (this.expanded.has(folderPath)) {
      if (!loadedChildren) {
        this.treeEl.createEl("div", { cls: "file-externalizer-tree-muted", text: "Loading..." }).style.setProperty("--depth", String(depth + 1));
      } else if (!hasLoadedChildren) {
        this.treeEl.createEl("div", { cls: "file-externalizer-tree-muted", text: "No subfolders" }).style.setProperty("--depth", String(depth + 1));
      } else {
        for (const child of loadedChildren) this.renderNode(joinRemotePath(folderPath, child), depth + 1);
      }
    }
  }
  selectFolder(folderPath) {
    this.selectedPath = normalizeRemoteFolder(folderPath, this.remoteRoot);
    this.expandAncestors(this.selectedPath);
    this.hideError();
    this.renderTree();
    void this.ensureLoaded(this.selectedPath, true);
  }
  async toggleFolder(folderPath) {
    if (this.expanded.has(folderPath)) {
      this.expanded.delete(folderPath);
      this.renderTree();
      return;
    }
    this.expanded.add(folderPath);
    this.renderTree();
    await this.ensureLoaded(folderPath, true);
  }
  async ensureLoaded(folderPath, preload) {
    const normalized = normalizeRemoteFolder(folderPath, this.remoteRoot);
    if (this.folderCache.has(normalized) || this.loading.has(normalized)) return;
    this.loading.add(normalized);
    this.renderTree();
    try {
      const children = await this.service.provider.listFolders(normalized);
      this.folderCache.set(normalized, children);
      if (preload) this.preloadChildren(normalized, children);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
    } finally {
      this.loading.delete(normalized);
      this.renderTree();
    }
  }
  preloadChildren(parentPath, children) {
    for (const child of children.slice(0, 12)) {
      const childPath = joinRemotePath(parentPath, child);
      if (!this.folderCache.has(childPath) && !this.loading.has(childPath)) {
        void this.service.provider.listFolders(childPath).then((folders) => this.folderCache.set(childPath, folders)).catch(() => void 0);
      }
    }
  }
  async refreshSelected() {
    this.folderCache.delete(this.selectedPath);
    await this.ensureLoaded(this.selectedPath, true);
  }
  createFolderSelected() {
    new NewFolderModal(this.app, this.selectedPath, (folderName) => {
      void this.performCreateFolder(folderName);
    }).open();
  }
  async performCreateFolder(folderName) {
    const parentPath = this.selectedPath;
    const newPath = joinRemotePath(parentPath, folderName);
    const notice = new import_obsidian2.Notice("Creating remote folder...", 0);
    try {
      await this.service.provider.createFolder(parentPath, folderName);
      const current = this.folderCache.get(parentPath) || [];
      if (!current.includes(folderName)) this.folderCache.set(parentPath, [...current, folderName].sort((a, b) => a.localeCompare(b)));
      this.folderCache.set(newPath, []);
      this.selectedPath = newPath;
      this.expanded.add(parentPath);
      this.expandAncestors(newPath);
      this.renderTree();
      new import_obsidian2.Notice("Folder created.");
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new import_obsidian2.Notice("Create folder failed. See developer console.");
      console.error("Create folder failed:", error);
    } finally {
      notice.hide();
    }
  }
  renameSelected() {
    if (isRemoteRoot(this.selectedPath, this.remoteRoot)) {
      this.showError("The root folder cannot be renamed here.");
      return;
    }
    new RenameFolderModal(this.app, this.selectedPath, pathName(this.selectedPath, this.remoteRoot), (newName) => {
      void this.performRename(newName);
    }).open();
  }
  async performRename(newName) {
    const oldPath = this.selectedPath;
    const newPath = joinRemotePath(parentRemotePath(oldPath, this.remoteRoot), newName);
    const notice = new import_obsidian2.Notice("Renaming folder and updating notes...", 0);
    try {
      await this.service.renameFolder(oldPath, newName);
      this.remapFolderCache(oldPath, newPath);
      this.selectedPath = newPath;
      this.expandAncestors(newPath);
      this.renderTree();
      new import_obsidian2.Notice("Folder renamed and affected notes updated.");
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new import_obsidian2.Notice("Rename failed. See developer console.");
      console.error("Rename folder failed:", error);
    } finally {
      notice.hide();
    }
  }
  deleteSelected() {
    if (isRemoteRoot(this.selectedPath, this.remoteRoot)) {
      this.showError("The root folder cannot be deleted here.");
      return;
    }
    const folderName = pathName(this.selectedPath, this.remoteRoot);
    const message = `This will move ${this.selectedPath} to remote trash and remove matching local cache files. Existing Obsidian notes that reference files under this folder will be marked missing.`;
    new ConfirmTextModal(this.app, "Delete Folder", message, folderName, "Delete folder", () => {
      void this.performDelete();
    }).open();
  }
  async performDelete() {
    const oldPath = this.selectedPath;
    const notice = new import_obsidian2.Notice("Moving folder to trash...", 0);
    try {
      await this.service.trashFolder(oldPath);
      this.removeFolderFromCache(oldPath);
      this.selectedPath = parentRemotePath(oldPath, this.remoteRoot);
      this.renderTree();
      new import_obsidian2.Notice("Folder moved to trash.");
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      new import_obsidian2.Notice("Delete failed. See developer console.");
      console.error("Delete folder failed:", error);
    } finally {
      notice.hide();
    }
  }
  remapFolderCache(oldPath, newPath) {
    const next = /* @__PURE__ */ new Map();
    for (const [key, value] of this.folderCache.entries()) {
      if (descendantOrSame(key, oldPath)) next.set(key.replace(oldPath, newPath), value);
      else next.set(key, value);
    }
    this.folderCache.clear();
    for (const [key, value] of next.entries()) this.folderCache.set(key, value);
    this.folderCache.delete(parentRemotePath(oldPath, this.remoteRoot));
    this.folderCache.delete(parentRemotePath(newPath, this.remoteRoot));
  }
  removeFolderFromCache(folderPath) {
    const parent = parentRemotePath(folderPath, this.remoteRoot);
    const name = pathName(folderPath, this.remoteRoot);
    const siblings = this.folderCache.get(parent);
    if (siblings) this.folderCache.set(parent, siblings.filter((folder) => folder !== name));
    for (const key of Array.from(this.folderCache.keys())) {
      if (descendantOrSame(key, folderPath)) this.folderCache.delete(key);
    }
  }
  showError(message) {
    if (!this.errorEl) return;
    this.errorEl.setText(message);
    this.errorEl.show();
  }
  hideError() {
    this.errorEl?.hide();
  }
};

// src/ui/registerFileModal.ts
var RegisterFileModal = class extends import_obsidian3.Modal {
  constructor(app, service, settings) {
    super(app);
    this.service = service;
    this.settings = settings;
    this.values = {
      filePath: "",
      title: "",
      uploadFilename: "",
      documentType: "Other",
      destinationFolder: settings.remoteRoot,
      shareLink: false
    };
  }
  values;
  destinationEl = null;
  errorEl = null;
  fileStatusEl = null;
  pastePathSetting = null;
  titleInput = null;
  titleWasAuto = true;
  uploadFilenameInput = null;
  uploadFilenameWasAuto = true;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("file-externalizer-modal");
    contentEl.createEl("h2", { text: "Register External File" });
    this.errorEl = contentEl.createEl("div", { cls: "file-externalizer-error" });
    this.errorEl.hide();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.addClass("file-externalizer-hidden");
    contentEl.appendChild(fileInput);
    fileInput.onchange = () => {
      const chosen = fileInput.files && fileInput.files[0];
      const chosenPath = getFilePathFromInputFile(chosen);
      if (!chosenPath) {
        this.showPastePathField();
        this.showError("The fallback picker could not expose the selected file path. Paste the path below instead.");
        return;
      }
      this.setFilePath(chosenPath);
    };
    new import_obsidian3.Setting(contentEl).setName("Local file").setDesc("Choose the file from your computer. The plugin uploads it to the selected external storage folder and creates an Obsidian note for it.").addButton((button) => {
      button.setButtonText("Choose file");
      button.onClick(async () => {
        try {
          const result = await chooseWithElectronDialog();
          if (result.path) {
            this.setFilePath(result.path);
            return;
          }
          if (result.canceled) return;
          fileInput.click();
        } catch (error) {
          console.error("Native file picker failed:", error);
          this.showPastePathField();
          this.showError("The native file picker failed. Paste the file path below instead.");
        }
      });
    });
    this.fileStatusEl = contentEl.createEl("div", {
      cls: "file-externalizer-path",
      text: "No file selected yet."
    });
    this.pastePathSetting = new import_obsidian3.Setting(contentEl).setName("Paste file path").setDesc("Fallback only. This appears when Obsidian cannot get a usable path from the file picker.").addText((text) => {
      text.setPlaceholder("/path/to/file.pdf");
      text.onChange((value) => this.setFilePath(value.trim(), false));
    });
    this.pastePathSetting.settingEl.addClass("file-externalizer-hidden");
    new import_obsidian3.Setting(contentEl).setName("Note title").setDesc("This becomes the title of the Obsidian note. It does not rename the uploaded external file.").addText((text) => {
      this.titleInput = text;
      text.setPlaceholder("Choose a file to generate a title");
      text.onChange((value) => {
        this.values.title = value.trim();
        this.titleWasAuto = false;
      });
    });
    new import_obsidian3.Setting(contentEl).setName("Upload filename").setDesc("This is the filename stored externally. If you omit the extension, the source file extension is added automatically.").addText((text) => {
      this.uploadFilenameInput = text;
      text.setPlaceholder("Choose a file to generate a filename");
      text.onChange((value) => {
        this.values.uploadFilename = value.trim();
        this.uploadFilenameWasAuto = false;
        this.hideError();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("Document type").setDesc("This controls where the Obsidian external-file note is filed. It does not force an external folder layout.").addDropdown((dropdown) => {
      for (const type of this.settings.documentTypes) dropdown.addOption(type, type);
      dropdown.setValue(this.values.documentType);
      dropdown.onChange((value) => {
        this.values.documentType = normalizeDocumentType(value, this.settings.documentTypes);
        this.hideError();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("Destination folder").setDesc("Choose the exact external storage folder where this file should be uploaded.").addButton((button) => button.setButtonText("Choose folder").onClick(() => this.openFolderPicker()));
    this.destinationEl = contentEl.createEl("div", {
      cls: "file-externalizer-path",
      text: `Destination: ${this.values.destinationFolder}`
    });
    new import_obsidian3.Setting(contentEl).setName("Create share link").setDesc("Not implemented yet for provider-neutral storage. Leave off for now.").addToggle((toggle) => {
      toggle.setValue(this.values.shareLink);
      toggle.setDisabled(true);
      toggle.onChange((value) => {
        this.values.shareLink = value;
      });
    });
    new import_obsidian3.Setting(contentEl).addButton((button) => {
      button.setButtonText("Register file");
      button.setCta();
      button.onClick(() => {
        void this.submit();
      });
    }).addButton((button) => {
      button.setButtonText("Cancel");
      button.onClick(() => this.close());
    });
  }
  setFilePath(filePath, updateTitle = true) {
    const previousFileName = import_node_path8.default.basename(this.values.filePath || "");
    this.values.filePath = filePath;
    if (this.fileStatusEl) {
      this.fileStatusEl.setText(filePath ? `Selected source file: ${filePath}` : "No file selected yet.");
    }
    if (filePath && (this.uploadFilenameWasAuto || !this.values.uploadFilename || this.values.uploadFilename === previousFileName)) {
      this.values.uploadFilename = import_node_path8.default.basename(filePath);
      this.uploadFilenameWasAuto = true;
      this.uploadFilenameInput?.setValue(this.values.uploadFilename);
    }
    if (filePath && updateTitle && (this.titleWasAuto || !this.values.title)) {
      const generated = defaultTitleForFile(filePath);
      this.values.title = generated;
      this.titleWasAuto = true;
      this.titleInput?.setValue(generated);
    }
    this.hideError();
  }
  showPastePathField() {
    this.pastePathSetting?.settingEl.removeClass("file-externalizer-hidden");
  }
  openFolderPicker() {
    if (!this.settings.remoteRoot) {
      this.showError("Configure File Externalizer remote root in plugin settings first.");
      return;
    }
    new FolderPickerModal(this.app, this.service, this.settings.remoteRoot, this.values.destinationFolder, (folderPath) => {
      this.values.destinationFolder = folderPath;
      this.updateDestinationPreview();
      this.hideError();
    }).open();
  }
  updateDestinationPreview() {
    this.destinationEl?.setText(`Destination: ${this.values.destinationFolder}`);
  }
  showError(message) {
    if (!this.errorEl) return;
    this.errorEl.setText(message);
    this.errorEl.show();
  }
  hideError() {
    this.errorEl?.hide();
  }
  async submit() {
    if (!this.values.filePath) {
      this.showError("Choose a file first.");
      return;
    }
    if (!this.values.title) {
      this.showError("Add a note title.");
      return;
    }
    try {
      this.values.uploadFilename = normalizeUploadFilename(this.values.uploadFilename, this.values.filePath);
    } catch (error) {
      this.showError(error instanceof Error ? error.message : String(error));
      return;
    }
    this.uploadFilenameInput?.setValue(this.values.uploadFilename);
    this.values.documentType = normalizeDocumentType(this.values.documentType, this.settings.documentTypes);
    if (!this.settings.remoteRoot) {
      this.showError("Configure File Externalizer remote root in plugin settings first.");
      return;
    }
    const progress = new import_obsidian3.Notice("Uploading external file...", 0);
    await sleep(75);
    try {
      const result = await this.service.registerFile(this.values);
      progress.hide();
      new import_obsidian3.Notice(`Created ${result.link}`);
      this.close();
      await this.service.openCreatedNote(result.notePath);
    } catch (error) {
      progress.hide();
      const message = error instanceof Error ? error.message : String(error);
      this.showError(message);
      new import_obsidian3.Notice("Register File failed. See developer console.");
      console.error("Register File failed:", error);
    }
  }
};
function getFilePathFromInputFile(file) {
  return file && ("path" in file || "webkitRelativePath" in file) ? String(file.path || file.webkitRelativePath || "") : "";
}
async function chooseWithElectronDialog() {
  const dialog = getElectronDialog();
  if (!dialog || typeof dialog.showOpenDialog !== "function") return {};
  const result = await dialog.showOpenDialog({
    title: "Choose external file",
    properties: ["openFile"]
  });
  if (!result || result.canceled) return { canceled: true };
  if (!result.filePaths || !result.filePaths.length) return { path: "" };
  return { path: result.filePaths[0] };
}
function getElectronDialog() {
  try {
    const electron = require("electron");
    return electron.remote?.dialog || electron.dialog || null;
  } catch {
    return null;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/ui/settingsTab.ts
var import_obsidian4 = require("obsidian");
var FileExternalizerSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "File Externalizer" });
    this.displaySetup(containerEl);
    containerEl.createEl("h3", { text: "Storage" });
    new import_obsidian4.Setting(containerEl).setName("Remote root").setDesc("Top-level external storage folder used by the folder picker.").addText((text) => text.setPlaceholder("/remote/path/to/files").setValue(this.plugin.settings.remoteRoot).onChange(async (value) => {
      this.plugin.settings.remoteRoot = value.trim().replace(/\/+$/g, "");
      await this.save();
    }));
    new import_obsidian4.Setting(containerEl).setName("External notes folder").setDesc("Vault folder where external-file notes are created.").addText((text) => text.setPlaceholder("External Files").setValue(this.plugin.settings.externalNotesFolder).onChange(async (value) => {
      this.plugin.settings.externalNotesFolder = value.trim();
      await this.save();
    }));
    new import_obsidian4.Setting(containerEl).setName("Cache folder").setDesc("Vault-local cache folder for downloaded/opened external files.").addText((text) => text.setPlaceholder("File Externalizer Cache").setValue(this.plugin.settings.cacheFolder).onChange(async (value) => {
      this.plugin.settings.cacheFolder = value.trim();
      await this.save();
    }));
    new import_obsidian4.Setting(containerEl).setName("Document types").setDesc("Comma-separated note filing categories. Include Other as a catch-all.").addTextArea((text) => text.setPlaceholder("Documents, Images, Media, Archives, Other").setValue(this.plugin.settings.documentTypes.join(", ")).onChange(async (value) => {
      this.plugin.settings.documentTypes = splitList(value);
      await this.save();
    }));
    new import_obsidian4.Setting(containerEl).setName("Context types").setDesc("Comma-separated first-level remote folder names used for context metadata.").addTextArea((text) => text.setPlaceholder("Projects, Areas, People, Organizations, General").setValue(this.plugin.settings.contextTypes.join(", ")).onChange(async (value) => {
      this.plugin.settings.contextTypes = splitList(value);
      await this.save();
    }));
  }
  displaySetup(containerEl) {
    containerEl.createEl("h3", { text: "Setup on this computer" });
    containerEl.createEl("p", {
      cls: "file-externalizer-help",
      text: "Each person signs in to Proton on their own computer. Nothing secret is stored in the vault."
    });
    const statusEl = containerEl.createEl("div", { cls: "file-externalizer-setup-status" });
    const loginLinkEl = containerEl.createEl("div", { cls: "file-externalizer-help" });
    loginLinkEl.hide();
    const refresh = async () => {
      statusEl.empty();
      statusEl.createEl("div", { text: "Checking..." });
      const service = this.plugin.getService();
      if (!service) return;
      try {
        renderStatus(statusEl, await service.checkSetup());
      } catch (error) {
        statusEl.empty();
        statusEl.createEl("div", { text: `Check failed: ${error instanceof Error ? error.message : String(error)}` });
      }
    };
    new import_obsidian4.Setting(containerEl).setName("Status").setDesc("Checks the Proton Drive CLI, your sign-in, and access to the remote root.").addButton((button) => button.setButtonText("Check again").onClick(() => {
      void refresh();
    })).addButton((button) => button.setButtonText("Log in to Proton").setCta().onClick(async () => {
      const service = this.plugin.getService();
      if (!service) return;
      button.setDisabled(true);
      const progress = new import_obsidian4.Notice("Finish signing in to Proton in your browser...", 0);
      try {
        await service.login((url) => {
          loginLinkEl.empty();
          loginLinkEl.appendText("If your browser didn't open, ");
          loginLinkEl.createEl("a", { href: url, text: "open the Proton sign-in page" });
          loginLinkEl.appendText(".");
          loginLinkEl.show();
        });
        new import_obsidian4.Notice("Signed in to Proton.");
      } catch (error) {
        new import_obsidian4.Notice(`Proton sign-in did not finish: ${error instanceof Error ? error.message : String(error)}`, 1e4);
      } finally {
        progress.hide();
        loginLinkEl.hide();
        button.setDisabled(false);
        void refresh();
      }
    }));
    new import_obsidian4.Setting(containerEl).setName("Proton Drive CLI path").setDesc("Leave empty to find proton-drive automatically (PATH, ~/.local/bin, Homebrew).").addText((text) => text.setPlaceholder("Auto-detect").setValue(this.plugin.settings.protonCliPath).onChange(async (value) => {
      this.plugin.settings.protonCliPath = value.trim();
      await this.save();
    }));
    void refresh();
  }
  async save() {
    this.plugin.settings = normalizeSettings(this.plugin.settings);
    await this.plugin.saveSettings();
  }
};
function renderStatus(el, status) {
  el.empty();
  for (const check of status.checks) {
    const row = el.createEl("div", { cls: `file-externalizer-setup-check ${check.ok ? "is-ok" : "is-failed"}` });
    row.createEl("span", { text: check.ok ? "\u2713 " : "\u2717 " });
    row.createEl("strong", { text: `${check.label}: ` });
    row.appendText(check.detail);
  }
}
function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

// src/main.ts
var FileExternalizerPlugin = class extends import_obsidian5.Plugin {
  settings = DEFAULT_SETTINGS;
  service = null;
  async onload() {
    await this.loadSettings();
    this.rebuildService();
    this.addSettingTab(new FileExternalizerSettingTab(this.app, this));
    this.addCommand({
      id: "register-file",
      name: "Register File",
      callback: () => {
        if (!this.service) return;
        new RegisterFileModal(this.app, this.service, this.settings).open();
      }
    });
    this.addCommand({
      id: "open-external-file",
      name: "Open External File",
      callback: () => {
        void this.openExternalFileCommand();
      }
    });
    this.addCommand({
      id: "check-setup",
      name: "Check Setup",
      callback: () => {
        void this.checkSetupCommand();
      }
    });
    this.addCommand({
      id: "validate-external-file-notes",
      name: "Validate External File Notes",
      callback: () => {
        void this.validateExternalFileNotesCommand();
      }
    });
  }
  async loadSettings() {
    this.settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...await this.loadData() });
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.rebuildService();
  }
  getService() {
    return this.service;
  }
  /** Settings changes (remote root, CLI path, ...) take effect without restarting Obsidian. */
  rebuildService() {
    this.service = new FileExternalizerService(this.app, this.settings);
  }
  async checkSetupCommand() {
    if (!this.service) return;
    const status = await this.service.checkSetup();
    if (status.ready) {
      new import_obsidian5.Notice("File Externalizer is ready.");
      return;
    }
    const failed = status.checks.filter((check) => !check.ok).map((check) => `${check.label}: ${check.detail}`);
    new import_obsidian5.Notice(`File Externalizer setup needs attention.
${failed.join("\n")}
Open Settings \u2192 File Externalizer to fix it.`, 1e4);
  }
  async openExternalFileCommand() {
    if (!this.service) return;
    const noteFile = findExternalFileNote(this.app);
    if (!noteFile) {
      new import_obsidian5.Notice("Open an external-file note first.");
      return;
    }
    const progress = new import_obsidian5.Notice("Opening external file...", 0);
    await sleep2(75);
    try {
      const result = await this.service.openExternalFile(noteFile);
      progress.hide();
      new import_obsidian5.Notice(result.cacheHit ? "Opened cached external file." : "Downloaded and opened external file.");
    } catch (error) {
      progress.hide();
      new import_obsidian5.Notice("Open External File failed. See developer console.");
      console.error("Open External File failed:", error);
    }
  }
  async validateExternalFileNotesCommand() {
    if (!this.service) return;
    const progress = new import_obsidian5.Notice("Validating external-file notes...", 0);
    await sleep2(75);
    try {
      const result = await this.service.validateExternalFileNotes();
      progress.hide();
      new import_obsidian5.Notice(`External-file validation complete: ${result.found} found, ${result.missing} missing, ${result.changed} notes updated${result.errors ? `, ${result.errors} errors skipped` : ""}.`);
    } catch (error) {
      progress.hide();
      new import_obsidian5.Notice("Validate External File Notes failed. See developer console.");
      console.error("Validate External File Notes failed:", error);
    }
  }
};
function sleep2(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL3BsYXRmb3JtL29ic2lkaWFuVmF1bHQudHMiLCAic3JjL2RvbWFpbi9wYXRocy50cyIsICJzcmMvc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UudHMiLCAic3JjL2RvbWFpbi9kb2N1bWVudFR5cGUudHMiLCAic3JjL2RvbWFpbi9leHRlcm5hbEZpbGVOb3RlLnRzIiwgInNyYy9kb21haW4vZnJvbnRtYXR0ZXIudHMiLCAic3JjL2RvbWFpbi9maWxlbmFtZS50cyIsICJzcmMvcHJvdmlkZXJzL3Byb3RvbkRyaXZlQ2xpUHJvdmlkZXIudHMiLCAic3JjL3NlcnZpY2VzL2NhY2hlU2VydmljZS50cyIsICJzcmMvdWkvcmVnaXN0ZXJGaWxlTW9kYWwudHMiLCAic3JjL3VpL2ZvbGRlclBpY2tlck1vZGFsLnRzIiwgInNyYy91aS9zaW1wbGVNb2RhbHMudHMiLCAic3JjL3VpL3NldHRpbmdzVGFiLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBOb3RpY2UsIFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncywgbm9ybWFsaXplU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IGZpbmRFeHRlcm5hbEZpbGVOb3RlIH0gZnJvbSAnLi9wbGF0Zm9ybS9vYnNpZGlhblZhdWx0JztcbmltcG9ydCB7IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9maWxlRXh0ZXJuYWxpemVyU2VydmljZSc7XG5pbXBvcnQgeyBSZWdpc3RlckZpbGVNb2RhbCB9IGZyb20gJy4vdWkvcmVnaXN0ZXJGaWxlTW9kYWwnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNldHRpbmdUYWIgfSBmcm9tICcuL3VpL3NldHRpbmdzVGFiJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZUV4dGVybmFsaXplclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBGaWxlRXh0ZXJuYWxpemVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIHNlcnZpY2U6IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG4gICAgdGhpcy5yZWJ1aWxkU2VydmljZSgpO1xuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgRmlsZUV4dGVybmFsaXplclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3JlZ2lzdGVyLWZpbGUnLFxuICAgICAgbmFtZTogJ1JlZ2lzdGVyIEZpbGUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICAgICAgbmV3IFJlZ2lzdGVyRmlsZU1vZGFsKHRoaXMuYXBwLCB0aGlzLnNlcnZpY2UsIHRoaXMuc2V0dGluZ3MpLm9wZW4oKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdvcGVuLWV4dGVybmFsLWZpbGUnLFxuICAgICAgbmFtZTogJ09wZW4gRXh0ZXJuYWwgRmlsZScsXG4gICAgICBjYWxsYmFjazogKCkgPT4geyB2b2lkIHRoaXMub3BlbkV4dGVybmFsRmlsZUNvbW1hbmQoKTsgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2NoZWNrLXNldHVwJyxcbiAgICAgIG5hbWU6ICdDaGVjayBTZXR1cCcsXG4gICAgICBjYWxsYmFjazogKCkgPT4geyB2b2lkIHRoaXMuY2hlY2tTZXR1cENvbW1hbmQoKTsgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3ZhbGlkYXRlLWV4dGVybmFsLWZpbGUtbm90ZXMnLFxuICAgICAgbmFtZTogJ1ZhbGlkYXRlIEV4dGVybmFsIEZpbGUgTm90ZXMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHsgdm9pZCB0aGlzLnZhbGlkYXRlRXh0ZXJuYWxGaWxlTm90ZXNDb21tYW5kKCk7IH0sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IG5vcm1hbGl6ZVNldHRpbmdzKHsgLi4uREVGQVVMVF9TRVRUSU5HUywgLi4uYXdhaXQgdGhpcy5sb2FkRGF0YSgpIGFzIFBhcnRpYWw8RmlsZUV4dGVybmFsaXplclNldHRpbmdzPiB9KTtcbiAgfVxuXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIHRoaXMucmVidWlsZFNlcnZpY2UoKTtcbiAgfVxuXG4gIGdldFNlcnZpY2UoKTogRmlsZUV4dGVybmFsaXplclNlcnZpY2UgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlO1xuICB9XG5cbiAgLyoqIFNldHRpbmdzIGNoYW5nZXMgKHJlbW90ZSByb290LCBDTEkgcGF0aCwgLi4uKSB0YWtlIGVmZmVjdCB3aXRob3V0IHJlc3RhcnRpbmcgT2JzaWRpYW4uICovXG4gIHByaXZhdGUgcmVidWlsZFNlcnZpY2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlID0gbmV3IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hlY2tTZXR1cENvbW1hbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCB0aGlzLnNlcnZpY2UuY2hlY2tTZXR1cCgpO1xuICAgIGlmIChzdGF0dXMucmVhZHkpIHtcbiAgICAgIG5ldyBOb3RpY2UoJ0ZpbGUgRXh0ZXJuYWxpemVyIGlzIHJlYWR5LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmYWlsZWQgPSBzdGF0dXMuY2hlY2tzLmZpbHRlcigoY2hlY2spID0+ICFjaGVjay5vaykubWFwKChjaGVjaykgPT4gYCR7Y2hlY2subGFiZWx9OiAke2NoZWNrLmRldGFpbH1gKTtcbiAgICBuZXcgTm90aWNlKGBGaWxlIEV4dGVybmFsaXplciBzZXR1cCBuZWVkcyBhdHRlbnRpb24uXFxuJHtmYWlsZWQuam9pbignXFxuJyl9XFxuT3BlbiBTZXR0aW5ncyBcdTIxOTIgRmlsZSBFeHRlcm5hbGl6ZXIgdG8gZml4IGl0LmAsIDEwMDAwKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb3BlbkV4dGVybmFsRmlsZUNvbW1hbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICBjb25zdCBub3RlRmlsZSA9IGZpbmRFeHRlcm5hbEZpbGVOb3RlKHRoaXMuYXBwKTtcbiAgICBpZiAoIW5vdGVGaWxlKSB7XG4gICAgICBuZXcgTm90aWNlKCdPcGVuIGFuIGV4dGVybmFsLWZpbGUgbm90ZSBmaXJzdC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ09wZW5pbmcgZXh0ZXJuYWwgZmlsZS4uLicsIDApO1xuICAgIGF3YWl0IHNsZWVwKDc1KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zZXJ2aWNlLm9wZW5FeHRlcm5hbEZpbGUobm90ZUZpbGUpO1xuICAgICAgcHJvZ3Jlc3MuaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShyZXN1bHQuY2FjaGVIaXQgPyAnT3BlbmVkIGNhY2hlZCBleHRlcm5hbCBmaWxlLicgOiAnRG93bmxvYWRlZCBhbmQgb3BlbmVkIGV4dGVybmFsIGZpbGUuJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ09wZW4gRXh0ZXJuYWwgRmlsZSBmYWlsZWQuIFNlZSBkZXZlbG9wZXIgY29uc29sZS4nKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ09wZW4gRXh0ZXJuYWwgRmlsZSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdmFsaWRhdGVFeHRlcm5hbEZpbGVOb3Rlc0NvbW1hbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ1ZhbGlkYXRpbmcgZXh0ZXJuYWwtZmlsZSBub3Rlcy4uLicsIDApO1xuICAgIGF3YWl0IHNsZWVwKDc1KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zZXJ2aWNlLnZhbGlkYXRlRXh0ZXJuYWxGaWxlTm90ZXMoKTtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoYEV4dGVybmFsLWZpbGUgdmFsaWRhdGlvbiBjb21wbGV0ZTogJHtyZXN1bHQuZm91bmR9IGZvdW5kLCAke3Jlc3VsdC5taXNzaW5nfSBtaXNzaW5nLCAke3Jlc3VsdC5jaGFuZ2VkfSBub3RlcyB1cGRhdGVkJHtyZXN1bHQuZXJyb3JzID8gYCwgJHtyZXN1bHQuZXJyb3JzfSBlcnJvcnMgc2tpcHBlZGAgOiAnJ30uYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ1ZhbGlkYXRlIEV4dGVybmFsIEZpbGUgTm90ZXMgZmFpbGVkLiBTZWUgZGV2ZWxvcGVyIGNvbnNvbGUuJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdWYWxpZGF0ZSBFeHRlcm5hbCBGaWxlIE5vdGVzIGZhaWxlZDonLCBlcnJvcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG4iLCAiZXhwb3J0IGNvbnN0IFBMVUdJTl9JRCA9ICdmaWxlLWV4dGVybmFsaXplcic7XG5leHBvcnQgY29uc3QgQ09NTUFORF9SRUdJU1RFUl9GSUxFID0gYCR7UExVR0lOX0lEfTpyZWdpc3Rlci1maWxlYDtcbmV4cG9ydCBjb25zdCBDT01NQU5EX09QRU5fRVhURVJOQUxfRklMRSA9IGAke1BMVUdJTl9JRH06b3Blbi1leHRlcm5hbC1maWxlYDtcbmV4cG9ydCBjb25zdCBDT01NQU5EX1ZBTElEQVRFX0VYVEVSTkFMX0ZJTEVfTk9URVMgPSBgJHtQTFVHSU5fSUR9OnZhbGlkYXRlLWV4dGVybmFsLWZpbGUtbm90ZXNgO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9ET0NVTUVOVF9UWVBFUyA9IFsnRG9jdW1lbnRzJywgJ0ltYWdlcycsICdNZWRpYScsICdBcmNoaXZlcycsICdPdGhlciddIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09OVEVYVF9UWVBFUyA9IFsnUHJvamVjdHMnLCAnQXJlYXMnLCAnUGVvcGxlJywgJ09yZ2FuaXphdGlvbnMnLCAnR2VuZXJhbCddIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBEb2N1bWVudFR5cGUgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBDb250ZXh0VHlwZSA9IHN0cmluZztcbiIsICJpbXBvcnQgeyBERUZBVUxUX0NPTlRFWFRfVFlQRVMsIERFRkFVTFRfRE9DVU1FTlRfVFlQRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUV4dGVybmFsaXplclNldHRpbmdzIHtcbiAgY2FjaGVGb2xkZXI6IHN0cmluZztcbiAgY29udGV4dFR5cGVzOiBzdHJpbmdbXTtcbiAgZG9jdW1lbnRUeXBlczogc3RyaW5nW107XG4gIGV4dGVybmFsTm90ZXNGb2xkZXI6IHN0cmluZztcbiAgcHJvdG9uQ2xpUGF0aDogc3RyaW5nO1xuICBwcm92aWRlcjogJ3Byb3Rvbi1kcml2ZS1jbGknO1xuICByZW1vdGVSb290OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBGaWxlRXh0ZXJuYWxpemVyU2V0dGluZ3MgPSB7XG4gIGNhY2hlRm9sZGVyOiAnRmlsZSBFeHRlcm5hbGl6ZXIgQ2FjaGUnLFxuICBjb250ZXh0VHlwZXM6IFsuLi5ERUZBVUxUX0NPTlRFWFRfVFlQRVNdLFxuICBkb2N1bWVudFR5cGVzOiBbLi4uREVGQVVMVF9ET0NVTUVOVF9UWVBFU10sXG4gIGV4dGVybmFsTm90ZXNGb2xkZXI6ICdFeHRlcm5hbCBGaWxlcycsXG4gIHByb3RvbkNsaVBhdGg6ICcnLFxuICBwcm92aWRlcjogJ3Byb3Rvbi1kcml2ZS1jbGknLFxuICByZW1vdGVSb290OiAnJyxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTZXR0aW5ncyhpbnB1dDogUGFydGlhbDxGaWxlRXh0ZXJuYWxpemVyU2V0dGluZ3M+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyB7XG4gIHJldHVybiB7XG4gICAgY2FjaGVGb2xkZXI6IG5vbkVtcHR5KGlucHV0Py5jYWNoZUZvbGRlciwgREVGQVVMVF9TRVRUSU5HUy5jYWNoZUZvbGRlciksXG4gICAgY29udGV4dFR5cGVzOiBub25FbXB0eUxpc3QoaW5wdXQ/LmNvbnRleHRUeXBlcywgREVGQVVMVF9TRVRUSU5HUy5jb250ZXh0VHlwZXMpLFxuICAgIGRvY3VtZW50VHlwZXM6IGVuc3VyZU90aGVyKG5vbkVtcHR5TGlzdChpbnB1dD8uZG9jdW1lbnRUeXBlcywgREVGQVVMVF9TRVRUSU5HUy5kb2N1bWVudFR5cGVzKSksXG4gICAgZXh0ZXJuYWxOb3Rlc0ZvbGRlcjogbm9uRW1wdHkoaW5wdXQ/LmV4dGVybmFsTm90ZXNGb2xkZXIsIERFRkFVTFRfU0VUVElOR1MuZXh0ZXJuYWxOb3Rlc0ZvbGRlciksXG4gICAgcHJvdG9uQ2xpUGF0aDogU3RyaW5nKGlucHV0Py5wcm90b25DbGlQYXRoIHx8ICcnKS50cmltKCksXG4gICAgcHJvdmlkZXI6IGlucHV0Py5wcm92aWRlciB8fCBERUZBVUxUX1NFVFRJTkdTLnByb3ZpZGVyLFxuICAgIHJlbW90ZVJvb3Q6IFN0cmluZyhpbnB1dD8ucmVtb3RlUm9vdCB8fCBERUZBVUxUX1NFVFRJTkdTLnJlbW90ZVJvb3QpLnRyaW0oKS5yZXBsYWNlKC9cXC8rJC9nLCAnJyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vbkVtcHR5KHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0cmltbWVkID0gU3RyaW5nKHZhbHVlIHx8ICcnKS50cmltKCk7XG4gIHJldHVybiB0cmltbWVkIHx8IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub25FbXB0eUxpc3QodmFsdWU6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBmYWxsYmFjazogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IG5leHQgPSBBcnJheS5pc0FycmF5KHZhbHVlKVxuICAgID8gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgICA6IFtdO1xuICByZXR1cm4gbmV4dC5sZW5ndGggPyBBcnJheS5mcm9tKG5ldyBTZXQobmV4dCkpIDogWy4uLmZhbGxiYWNrXTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlT3RoZXIodmFsdWVzOiBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHZhbHVlcy5zb21lKCh2YWx1ZSkgPT4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ290aGVyJykgPyB2YWx1ZXMgOiBbLi4udmFsdWVzLCAnT3RoZXInXTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgdG9Qb3NpeFBhdGggfSBmcm9tICcuLi9kb21haW4vcGF0aHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmF1bHRQYXRoKGFwcDogQXBwKTogc3RyaW5nIHtcbiAgY29uc3QgYWRhcHRlciA9IGFwcC52YXVsdC5hZGFwdGVyIGFzIHsgYmFzZVBhdGg/OiBzdHJpbmc7IGdldEJhc2VQYXRoPzogKCkgPT4gc3RyaW5nIH07XG4gIGlmICh0eXBlb2YgYWRhcHRlci5nZXRCYXNlUGF0aCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGFkYXB0ZXIuZ2V0QmFzZVBhdGgoKTtcbiAgaWYgKGFkYXB0ZXIuYmFzZVBhdGgpIHJldHVybiBhZGFwdGVyLmJhc2VQYXRoO1xuICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgRXh0ZXJuYWxpemVyIHJlcXVpcmVzIHRoZSBkZXNrdG9wIGZpbGVzeXN0ZW0gYWRhcHRlci4nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhdWx0UmVsYXRpdmVQYXRoKHZhdWx0UGF0aDogc3RyaW5nLCBhYnNvbHV0ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0b1Bvc2l4UGF0aChwYXRoLnJlbGF0aXZlKHZhdWx0UGF0aCwgYWJzb2x1dGVQYXRoKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bmlxdWVNYXJrZG93blBhdGgoYXBwOiBBcHAsIHJlcXVlc3RlZFBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHJlcXVlc3RlZFBhdGgpKSByZXR1cm4gcmVxdWVzdGVkUGF0aDtcbiAgY29uc3QgZXh0ID0gcGF0aC5wb3NpeC5leHRuYW1lKHJlcXVlc3RlZFBhdGgpO1xuICBjb25zdCBiYXNlID0gcmVxdWVzdGVkUGF0aC5zbGljZSgwLCAtZXh0Lmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAyOyBpIDwgMTAwMDsgaSArPSAxKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlID0gYCR7YmFzZX0gJHtpfSR7ZXh0fWA7XG4gICAgaWYgKCFhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoY2FuZGlkYXRlKSkgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjcmVhdGUgYSB1bmlxdWUgbm90ZSBwYXRoLicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZlTWFya2Rvd25GaWxlKGFwcDogQXBwKTogVEZpbGUgfCBudWxsIHtcbiAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICByZXR1cm4gZmlsZSAmJiBmaWxlLmV4dGVuc2lvbiA9PT0gJ21kJyA/IGZpbGUgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEV4dGVybmFsRmlsZU5vdGUoYXBwOiBBcHApOiBURmlsZSB8IG51bGwge1xuICBjb25zdCBhY3RpdmUgPSBhY3RpdmVNYXJrZG93bkZpbGUoYXBwKTtcbiAgaWYgKGFjdGl2ZSAmJiBmaWxlSGFzUmVtb3RlUGF0aChhcHAsIGFjdGl2ZSkpIHJldHVybiBhY3RpdmU7XG5cbiAgZm9yIChjb25zdCBsZWFmIG9mIGFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKCdtYXJrZG93bicpKSB7XG4gICAgY29uc3QgZmlsZSA9IGxlYWY/LnZpZXcgJiYgJ2ZpbGUnIGluIGxlYWYudmlldyA/IGxlYWYudmlldy5maWxlIGFzIFRGaWxlIHwgbnVsbCA6IG51bGw7XG4gICAgaWYgKGZpbGUgJiYgZmlsZS5leHRlbnNpb24gPT09ICdtZCcgJiYgZmlsZUhhc1JlbW90ZVBhdGgoYXBwLCBmaWxlKSkgcmV0dXJuIGZpbGU7XG4gIH1cblxuICByZXR1cm4gYWN0aXZlO1xufVxuXG5mdW5jdGlvbiBmaWxlSGFzUmVtb3RlUGF0aChhcHA6IEFwcCwgZmlsZTogVEZpbGUpOiBib29sZWFuIHtcbiAgY29uc3QgY2FjaGUgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gIHJldHVybiBCb29sZWFuKGNhY2hlPy5mcm9udG1hdHRlcj8ucmVtb3RlX3BhdGggfHwgY2FjaGU/LmZyb250bWF0dGVyPy5wcm90b25fcGF0aCk7XG59XG4iLCAiaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IENvbnRleHRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJlbW90ZUZvbGRlcihmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBTdHJpbmcoZm9sZGVyUGF0aCB8fCAnJykudHJpbSgpLnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgY29uc3Qgcm9vdCA9IHJlbW90ZVJvb3QucmVwbGFjZSgvXFwvKyQvZywgJycpO1xuICBpZiAoIXJvb3QpIHJldHVybiBub3JtYWxpemVkO1xuICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZCA9PT0gcm9vdCkgcmV0dXJuIHJvb3Q7XG4gIGlmICghbm9ybWFsaXplZC5zdGFydHNXaXRoKGAke3Jvb3R9L2ApKSByZXR1cm4gcm9vdDtcbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luUmVtb3RlUGF0aChwYXJlbnRQYXRoOiBzdHJpbmcsIGNoaWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY2xlYW5DaGlsZCA9IFN0cmluZyhjaGlsZE5hbWUgfHwgJycpLnRyaW0oKS5yZXBsYWNlKC9eXFwvK3xcXC8rJC9nLCAnJyk7XG4gIGlmICghY2xlYW5DaGlsZCkgcmV0dXJuIHBhcmVudFBhdGg7XG4gIHJldHVybiBgJHtwYXJlbnRQYXRoLnJlcGxhY2UoL1xcLyskL2csICcnKX0vJHtjbGVhbkNoaWxkfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJlbnRSZW1vdGVQYXRoKGN1cnJlbnRQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJvb3QgPSByZW1vdGVSb290LnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgaWYgKGN1cnJlbnRQYXRoID09PSByb290KSByZXR1cm4gcm9vdDtcbiAgY29uc3QgcGFyZW50ID0gY3VycmVudFBhdGgucmVwbGFjZSgvXFwvKyQvZywgJycpLnJlcGxhY2UoL1xcL1teL10rJC8sICcnKTtcbiAgcmV0dXJuIHBhcmVudCAmJiBwYXJlbnQuc3RhcnRzV2l0aChyb290KSA/IHBhcmVudCA6IHJvb3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoTmFtZShmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgcmVtb3RlUm9vdCk7XG4gIGlmIChub3JtYWxpemVkID09PSByZW1vdGVSb290KSByZXR1cm4gJ0V4dGVybmFsIEZpbGVzJztcbiAgcmV0dXJuIG5vcm1hbGl6ZWQuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbikucG9wKCkgfHwgbm9ybWFsaXplZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVtb3RlUm9vdChmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGZvbGRlclBhdGgsIHJlbW90ZVJvb3QpID09PSByZW1vdGVSb290O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY2VuZGFudE9yU2FtZShjYW5kaWRhdGU6IHN0cmluZywgYmFzZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjYW5kaWRhdGUgPT09IGJhc2UgfHwgU3RyaW5nKGNhbmRpZGF0ZSB8fCAnJykuc3RhcnRzV2l0aChgJHtiYXNlfS9gKTtcbn1cblxuLyoqXG4gKiBSZXBsYWNlcyB3aG9sZS1wYXRoIG9jY3VycmVuY2VzIG9mIGBvbGRQYXRoYCAoYW5kIHBhdGhzIGJlbmVhdGggaXQpIGluIGB0ZXh0YC5cbiAqIEEgc2libGluZyB0aGF0IG9ubHkgc2hhcmVzIGEgcHJlZml4LCBsaWtlIGBMZWdhbCBPcHNgIHdoZW4gcmVuYW1pbmcgYExlZ2FsYCwgaXMgbGVmdCBhbG9uZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VQYXRoUHJlZml4KHRleHQ6IHN0cmluZywgb2xkUGF0aDogc3RyaW5nLCBuZXdQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIW9sZFBhdGgpIHJldHVybiBTdHJpbmcodGV4dCB8fCAnJyk7XG4gIC8vIFNwYWNlcyBhcmUgdmFsaWQgaW5zaWRlIGZvbGRlciBuYW1lcywgc28gYSBmb2xsb3dpbmcgc3BhY2UgaXMgbm90IHRyZWF0ZWQgYXMgYSBwYXRoIGJvdW5kYXJ5LlxuICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cChgJHtlc2NhcGVSZWdFeHAob2xkUGF0aCl9KD89JHxbL1wiJ1xcYClcXFxcXXw+LDtcXFxcdFxcXFxyXFxcXG5dKWAsICdnbScpO1xuICByZXR1cm4gU3RyaW5nKHRleHQgfHwgJycpLnJlcGxhY2UocGF0dGVybiwgKCkgPT4gbmV3UGF0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGl2ZVJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nLCByZW1vdGVSb290OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbm9ybWFsaXplUmVtb3RlRm9sZGVyKHJlbW90ZVBhdGgsIHJlbW90ZVJvb3QpLnNsaWNlKHJlbW90ZVJvb3QubGVuZ3RoKS5yZXBsYWNlKC9eXFwvLywgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FmZVJlbGF0aXZlUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJvb3QgPSByZW1vdGVSb290LnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgY29uc3Qgcm9vdFBhdHRlcm4gPSByb290ID8gbmV3IFJlZ0V4cChgXiR7ZXNjYXBlUmVnRXhwKHJvb3QpfS8/YCkgOiBudWxsO1xuICByZXR1cm4gU3RyaW5nKHJlbW90ZVBhdGggfHwgJycpXG4gICAgLnJlcGxhY2Uocm9vdFBhdHRlcm4gfHwgL14vLCAnJylcbiAgICAucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5tYXAoKHBhcnQpID0+IHBhcnQucmVwbGFjZSgvW1xcXFw6Kj9cIjw+fF0vZywgJy0nKSlcbiAgICAuam9pbignLycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlQ29udGV4dFR5cGUocmVtb3RlRm9sZGVyOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZywgY29udGV4dFR5cGVzOiBzdHJpbmdbXSk6IENvbnRleHRUeXBlIHtcbiAgY29uc3QgZmlyc3QgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIocmVtb3RlRm9sZGVyLCByZW1vdGVSb290KVxuICAgIC5zbGljZShyZW1vdGVSb290Lmxlbmd0aClcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5maWx0ZXIoQm9vbGVhbilbMF07XG4gIHJldHVybiBjb250ZXh0VHlwZXMuaW5jbHVkZXMoZmlyc3QpID8gZmlyc3QgYXMgQ29udGV4dFR5cGUgOiAnR2VuZXJhbCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVDb250ZXh0TmFtZShyZW1vdGVGb2xkZXI6IHN0cmluZywgcmVtb3RlUm9vdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHMgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIocmVtb3RlRm9sZGVyLCByZW1vdGVSb290KVxuICAgIC5zbGljZShyZW1vdGVSb290Lmxlbmd0aClcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gIGlmIChwYXJ0cy5sZW5ndGggPj0gMikgcmV0dXJuIHBhcnRzWzFdO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxICYmIHBhcnRzWzBdICE9PSAnR2VuZXJhbCcpIHJldHVybiBwYXJ0c1swXTtcbiAgcmV0dXJuICdHZW5lcmFsJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUG9zaXhQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZmlsZVBhdGguc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgc3Bhd25TeW5jIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzJztcbmltcG9ydCB7IERvY3VtZW50VHlwZSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBub3JtYWxpemVEb2N1bWVudFR5cGUgfSBmcm9tICcuLi9kb21haW4vZG9jdW1lbnRUeXBlJztcbmltcG9ydCB7IGJ1aWxkRXh0ZXJuYWxGaWxlTm90ZSwgZXh0ZXJuYWxGaWxlTm90ZUZvbGRlciwgbWFya0V4dGVybmFsRmlsZVRleHRNaXNzaW5nLCB1cGRhdGVFeHRlcm5hbEZpbGVUZXh0Rm9yRm9sZGVyUmVuYW1lIH0gZnJvbSAnLi4vZG9tYWluL2V4dGVybmFsRmlsZU5vdGUnO1xuaW1wb3J0IHsgZGVmYXVsdFRpdGxlRm9yRmlsZSwgbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUsIHNsdWdUaXRsZSB9IGZyb20gJy4uL2RvbWFpbi9maWxlbmFtZSc7XG5pbXBvcnQgeyBwYXJzZUZyb250bWF0dGVyIH0gZnJvbSAnLi4vZG9tYWluL2Zyb250bWF0dGVyJztcbmltcG9ydCB7IGRlcml2ZUNvbnRleHROYW1lLCBkZXJpdmVDb250ZXh0VHlwZSwgam9pblJlbW90ZVBhdGgsIHBhcmVudFJlbW90ZVBhdGgsIHJlcGxhY2VQYXRoUHJlZml4IH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcbmltcG9ydCB7IGdldFZhdWx0UGF0aCwgdW5pcXVlTWFya2Rvd25QYXRoLCB2YXVsdFJlbGF0aXZlUGF0aCB9IGZyb20gJy4uL3BsYXRmb3JtL29ic2lkaWFuVmF1bHQnO1xuaW1wb3J0IHsgaXNNaXNzaW5nUmVtb3RlUGF0aEVycm9yLCBQcm90b25Ecml2ZUNsaVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3Byb3RvbkRyaXZlQ2xpUHJvdmlkZXInO1xuaW1wb3J0IHsgTG9naW5SZXN1bHQsIFNldHVwU3RhdHVzLCBTdG9yYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvc3RvcmFnZVByb3ZpZGVyJztcbmltcG9ydCB7IENhY2hlU2VydmljZSB9IGZyb20gJy4vY2FjaGVTZXJ2aWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWdpc3RlckZpbGVJbnB1dCB7XG4gIGRlc3RpbmF0aW9uRm9sZGVyOiBzdHJpbmc7XG4gIGRvY3VtZW50VHlwZTogRG9jdW1lbnRUeXBlO1xuICBmaWxlUGF0aDogc3RyaW5nO1xuICBzaGFyZUxpbms6IGJvb2xlYW47XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVwbG9hZEZpbGVuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0ZXJGaWxlUmVzdWx0IHtcbiAgbGluazogc3RyaW5nO1xuICBub3RlUGF0aDogc3RyaW5nO1xuICByZW1vdGVQYXRoOiBzdHJpbmc7XG4gIHN0b3JhZ2VGb2xkZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgY2hhbmdlZDogbnVtYmVyO1xuICBlcnJvcnM6IG51bWJlcjtcbiAgZm91bmQ6IG51bWJlcjtcbiAgbWlzc2luZzogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRmlsZUV4dGVybmFsaXplclNlcnZpY2Uge1xuICByZWFkb25seSBwcm92aWRlcjogU3RvcmFnZVByb3ZpZGVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSByZWFkb25seSBzZXR0aW5nczogRmlsZUV4dGVybmFsaXplclNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUyxcbiAgICBwcm92aWRlcj86IFN0b3JhZ2VQcm92aWRlcixcbiAgKSB7XG4gICAgdGhpcy5wcm92aWRlciA9IHByb3ZpZGVyIHx8IG5ldyBQcm90b25Ecml2ZUNsaVByb3ZpZGVyKHsgY2xpUGF0aDogc2V0dGluZ3MucHJvdG9uQ2xpUGF0aCB9KTtcbiAgfVxuXG4gIGFzeW5jIGNoZWNrU2V0dXAoKTogUHJvbWlzZTxTZXR1cFN0YXR1cz4ge1xuICAgIGlmICghdGhpcy5wcm92aWRlci5jaGVja1NldHVwKSB7XG4gICAgICByZXR1cm4geyByZWFkeTogdHJ1ZSwgY2hlY2tzOiBbeyBsYWJlbDogJ1N0b3JhZ2UgcHJvdmlkZXInLCBvazogdHJ1ZSwgZGV0YWlsOiAnTm8gc2V0dXAgY2hlY2tzIGZvciB0aGlzIHByb3ZpZGVyLicgfV0gfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvdmlkZXIuY2hlY2tTZXR1cCh0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QpO1xuICB9XG5cbiAgYXN5bmMgbG9naW4ob25Vcmw/OiAodXJsOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gICAgaWYgKCF0aGlzLnByb3ZpZGVyLmxvZ2luKSB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgc3RvcmFnZSBwcm92aWRlciBoYXMgbm8gc2lnbi1pbiBzdGVwLicpO1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVyLmxvZ2luKG9uVXJsKTtcbiAgfVxuXG4gIGFzeW5jIHJlZ2lzdGVyRmlsZShpbnB1dDogUmVnaXN0ZXJGaWxlSW5wdXQpOiBQcm9taXNlPFJlZ2lzdGVyRmlsZVJlc3VsdD4ge1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290KSB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgRXh0ZXJuYWxpemVyIHJlbW90ZSByb290IGlzIG5vdCBjb25maWd1cmVkLicpO1xuICAgIGNvbnN0IHZhdWx0UGF0aCA9IGdldFZhdWx0UGF0aCh0aGlzLmFwcCk7XG4gICAgY29uc3QgbG9jYWxGaWxlID0gcGF0aC5yZXNvbHZlKGlucHV0LmZpbGVQYXRoKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMobG9jYWxGaWxlKSkgdGhyb3cgbmV3IEVycm9yKGBGaWxlIG5vdCBmb3VuZDogJHtsb2NhbEZpbGV9YCk7XG5cbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBjb25zdCB0aXRsZSA9IHNsdWdUaXRsZShpbnB1dC50aXRsZSB8fCBkZWZhdWx0VGl0bGVGb3JGaWxlKGxvY2FsRmlsZSkpO1xuICAgIGNvbnN0IHVwbG9hZEZpbGVuYW1lID0gbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUoaW5wdXQudXBsb2FkRmlsZW5hbWUsIGxvY2FsRmlsZSk7XG4gICAgY29uc3QgZG9jdW1lbnRUeXBlID0gbm9ybWFsaXplRG9jdW1lbnRUeXBlKGlucHV0LmRvY3VtZW50VHlwZSwgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKTtcbiAgICBjb25zdCByZW1vdGVGb2xkZXIgPSBpbnB1dC5kZXN0aW5hdGlvbkZvbGRlcjtcbiAgICBjb25zdCByZW1vdGVQYXRoID0gam9pblJlbW90ZVBhdGgocmVtb3RlRm9sZGVyLCB1cGxvYWRGaWxlbmFtZSk7XG5cbiAgICBjb25zdCB1cGxvYWRlZCA9IGF3YWl0IHRoaXMucHJvdmlkZXIudXBsb2FkRmlsZSh7XG4gICAgICBsb2NhbFBhdGg6IGxvY2FsRmlsZSxcbiAgICAgIHJlbW90ZUZvbGRlcixcbiAgICAgIHJlbW90ZU5hbWU6IHVwbG9hZEZpbGVuYW1lLFxuICAgIH0pO1xuXG4gICAgdGhpcy5jYWNoZSh2YXVsdFBhdGgpLnNlZWRGcm9tTG9jYWxGaWxlKGxvY2FsRmlsZSwgcmVtb3RlUGF0aCwgdXBsb2FkZWQubW9kaWZpZWRUaW1lKTtcblxuICAgIGNvbnN0IG5vdGVGb2xkZXIgPSBleHRlcm5hbEZpbGVOb3RlRm9sZGVyKHRoaXMuc2V0dGluZ3MuZXh0ZXJuYWxOb3Rlc0ZvbGRlciwgZG9jdW1lbnRUeXBlLCB0aGlzLnNldHRpbmdzLmRvY3VtZW50VHlwZXMpO1xuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihub3RlRm9sZGVyKS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgIGNvbnN0IG5vdGVSZWwgPSBhd2FpdCB1bmlxdWVNYXJrZG93blBhdGgodGhpcy5hcHAsIHBhdGgucG9zaXguam9pbihub3RlRm9sZGVyLCBgJHt0aXRsZX0ubWRgKSk7XG4gICAgY29uc3Qgc2l6ZSA9IGZzLnN0YXRTeW5jKGxvY2FsRmlsZSkuc2l6ZTtcbiAgICBjb25zdCBub3RlID0gYnVpbGRFeHRlcm5hbEZpbGVOb3RlKHtcbiAgICAgIHRpdGxlLFxuICAgICAgZG9jdW1lbnRUeXBlLFxuICAgICAgcmVtb3RlRm9sZGVyLFxuICAgICAgcHJvdmlkZXI6IHRoaXMuc2V0dGluZ3MucHJvdmlkZXIsXG4gICAgICByZW1vdGVQYXRoLFxuICAgICAgc2hhcmVMaW5rOiBpbnB1dC5zaGFyZUxpbmsgPyAncGVuZGluZycgOiAnbm9uZScsXG4gICAgICBvcmlnaW5hbEZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKGxvY2FsRmlsZSksXG4gICAgICB1cGxvYWRGaWxlbmFtZSxcbiAgICAgIHNpemUsXG4gICAgICBjb250ZXh0VHlwZTogZGVyaXZlQ29udGV4dFR5cGUocmVtb3RlRm9sZGVyLCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QsIHRoaXMuc2V0dGluZ3MuY29udGV4dFR5cGVzKSxcbiAgICAgIGNvbnRleHROYW1lOiBkZXJpdmVDb250ZXh0TmFtZShyZW1vdGVGb2xkZXIsIHRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCksXG4gICAgICBkYXRlLFxuICAgIH0sIHRoaXMuc2V0dGluZ3MuZG9jdW1lbnRUeXBlcyk7XG5cbiAgICBjb25zdCBjcmVhdGVkID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5vdGVSZWwsIG5vdGUpO1xuICAgIHJldHVybiB7XG4gICAgICBsaW5rOiBgW1ske2NyZWF0ZWQuYmFzZW5hbWV9XV1gLFxuICAgICAgbm90ZVBhdGg6IHBhdGguam9pbih2YXVsdFBhdGgsIGNyZWF0ZWQucGF0aCksXG4gICAgICByZW1vdGVQYXRoLFxuICAgICAgc3RvcmFnZUZvbGRlcjogcmVtb3RlRm9sZGVyLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBvcGVuRXh0ZXJuYWxGaWxlKG5vdGU6IFRGaWxlLCBvcGVuID0gdHJ1ZSk6IFByb21pc2U8eyBjYWNoZUhpdDogYm9vbGVhbjsgb3BlbmVkOiBzdHJpbmc7IHJlbW90ZVBhdGg6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgdmF1bHRQYXRoID0gZ2V0VmF1bHRQYXRoKHRoaXMuYXBwKTtcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlKTtcbiAgICBjb25zdCBmbSA9IHBhcnNlRnJvbnRtYXR0ZXIodGV4dCk7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IGZtLnJlbW90ZV9wYXRoIHx8IGZtLnByb3Rvbl9wYXRoO1xuICAgIGlmICghcmVtb3RlUGF0aCkgdGhyb3cgbmV3IEVycm9yKCdBY3RpdmUgbm90ZSBoYXMgbm8gcmVtb3RlX3BhdGggcHJvcGVydHkuJyk7XG5cbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuY2FjaGUodmF1bHRQYXRoKTtcbiAgICBjb25zdCBjYWNoZVBhdGggPSBjYWNoZS5jYWNoZVBhdGhGb3JSZW1vdGUocmVtb3RlUGF0aCk7XG4gICAgY29uc3QgY2FjaGVIaXQgPSBmcy5leGlzdHNTeW5jKGNhY2hlUGF0aCk7XG5cbiAgICBpZiAoIWNhY2hlSGl0KSB7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKGNhY2hlUGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgY29uc3QgdGVtcERpciA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihjYWNoZS5jYWNoZVJvb3QoKSwgJy5kb3dubG9hZC0nKSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkb3dubG9hZGVkID0gYXdhaXQgdGhpcy5wcm92aWRlci5kb3dubG9hZEZpbGUocmVtb3RlUGF0aCwgdGVtcERpcik7XG4gICAgICAgIGZzLnJlbmFtZVN5bmMoZG93bmxvYWRlZC5wYXRoLCBjYWNoZVBhdGgpO1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgdGhpcy5wcm92aWRlci5zdGF0KHJlbW90ZVBhdGgpO1xuICAgICAgICBjb25zdCBpbmRleCA9IGNhY2hlLnJlYWRJbmRleCgpO1xuICAgICAgICBpbmRleFtyZW1vdGVQYXRoXSA9IHtcbiAgICAgICAgICBjYWNoZVBhdGg6IHBhdGgucmVsYXRpdmUodmF1bHRQYXRoLCBjYWNoZVBhdGgpLFxuICAgICAgICAgIHJlbW90ZVRpbWU6IGluZm8ubW9kaWZpZWRUaW1lLFxuICAgICAgICAgIGNhY2hlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG4gICAgICAgIGNhY2hlLndyaXRlSW5kZXgoaW5kZXgpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZnMucm1TeW5jKHRlbXBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3Blbikgb3BlbkZpbGUoY2FjaGVQYXRoKTtcbiAgICByZXR1cm4geyBvcGVuZWQ6IGNhY2hlUGF0aCwgY2FjaGVIaXQsIHJlbW90ZVBhdGggfTtcbiAgfVxuXG4gIGFzeW5jIHJlbmFtZUZvbGRlcihvbGRQYXRoOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgYXdhaXQgdGhpcy5wcm92aWRlci5yZW5hbWVGb2xkZXIob2xkUGF0aCwgbmV3TmFtZSk7XG4gICAgY29uc3QgbmV3UGF0aCA9IGpvaW5SZW1vdGVQYXRoKHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290KSwgbmV3TmFtZSk7XG4gICAgY29uc3QgY2hhbmdlZCA9IGF3YWl0IHRoaXMudXBkYXRlVmF1bHRQYXRoUmVmZXJlbmNlcyhvbGRQYXRoLCBuZXdQYXRoKTtcbiAgICB0aGlzLmNhY2hlKGdldFZhdWx0UGF0aCh0aGlzLmFwcCkpLnJlbWFwRm9sZGVyKG9sZFBhdGgsIG5ld1BhdGgpO1xuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgdHJhc2hGb2xkZXIoZm9sZGVyUGF0aDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBhd2FpdCB0aGlzLnByb3ZpZGVyLnRyYXNoRm9sZGVyKGZvbGRlclBhdGgpO1xuICAgIHRoaXMuY2FjaGUoZ2V0VmF1bHRQYXRoKHRoaXMuYXBwKSkucmVtb3ZlRm9sZGVyKGZvbGRlclBhdGgpO1xuICAgIHJldHVybiB0aGlzLm1hcmtEZWxldGVkRm9sZGVyTm90ZXMoZm9sZGVyUGF0aCk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVWYXVsdFBhdGhSZWZlcmVuY2VzKG9sZFBhdGg6IHN0cmluZywgbmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgbGV0IGNoYW5nZWQgPSAwO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgaWYgKCF0ZXh0LmluY2x1ZGVzKG9sZFBhdGgpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGZtID0gcGFyc2VGcm9udG1hdHRlcih0ZXh0KTtcbiAgICAgIGNvbnN0IHVwZGF0ZWQgPSBmbS50eXBlID09PSAnZXh0ZXJuYWwtZmlsZSdcbiAgICAgICAgPyB1cGRhdGVFeHRlcm5hbEZpbGVUZXh0Rm9yRm9sZGVyUmVuYW1lKHRleHQsIG9sZFBhdGgsIG5ld1BhdGgsIHRvZGF5LCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QsIHRoaXMuc2V0dGluZ3MuY29udGV4dFR5cGVzKVxuICAgICAgICA6IHJlcGxhY2VQYXRoUHJlZml4KHRleHQsIG9sZFBhdGgsIG5ld1BhdGgpO1xuICAgICAgaWYgKHVwZGF0ZWQgIT09IHRleHQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWQpO1xuICAgICAgICBjaGFuZ2VkICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgbWFya0RlbGV0ZWRGb2xkZXJOb3Rlcyhmb2xkZXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBsZXQgY2hhbmdlZCA9IDA7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKSkge1xuICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICBpZiAoIXRleHQuaW5jbHVkZXMoZm9sZGVyUGF0aCkpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgdXBkYXRlZCA9IG1hcmtFeHRlcm5hbEZpbGVUZXh0TWlzc2luZyh0ZXh0LCBmb2xkZXJQYXRoLCB0b2RheSwgJ0V4dGVybmFsIHN0b3JhZ2UgZm9sZGVyIG1vdmVkIHRvIHRyYXNoJyk7XG4gICAgICBpZiAodXBkYXRlZCAhPT0gdGV4dCkge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZCk7XG4gICAgICAgIGNoYW5nZWQgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICBhc3luYyB2YWxpZGF0ZUV4dGVybmFsRmlsZU5vdGVzKCk6IFByb21pc2U8VmFsaWRhdGlvblJlc3VsdD4ge1xuICAgIGxldCBmb3VuZCA9IDA7XG4gICAgbGV0IG1pc3NpbmcgPSAwO1xuICAgIGxldCBlcnJvcnMgPSAwO1xuICAgIGxldCBjaGFuZ2VkID0gMDtcbiAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIGNvbnN0IGZtID0gcGFyc2VGcm9udG1hdHRlcih0ZXh0KTtcbiAgICAgIGNvbnN0IHJlbW90ZVBhdGggPSBmbS5yZW1vdGVfcGF0aCB8fCBmbS5wcm90b25fcGF0aDtcbiAgICAgIGlmIChmbS50eXBlICE9PSAnZXh0ZXJuYWwtZmlsZScgfHwgIXJlbW90ZVBhdGgpIGNvbnRpbnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5wcm92aWRlci5zdGF0KHJlbW90ZVBhdGgpO1xuICAgICAgICBmb3VuZCArPSAxO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCFpc01pc3NpbmdSZW1vdGVQYXRoRXJyb3IoZXJyb3IpKSB7XG4gICAgICAgICAgZXJyb3JzICs9IDE7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgdmFsaWRhdGUgJHtmaWxlLnBhdGh9OmAsIGVycm9yKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBtaXNzaW5nICs9IDE7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBtYXJrRXh0ZXJuYWxGaWxlVGV4dE1pc3NpbmcodGV4dCwgcmVtb3RlUGF0aCwgdG9kYXksICdFeHRlcm5hbCBmaWxlIG5vdCBmb3VuZCBkdXJpbmcgdmFsaWRhdGlvbicpO1xuICAgICAgICBpZiAodXBkYXRlZCAhPT0gdGV4dCkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB1cGRhdGVkKTtcbiAgICAgICAgICBjaGFuZ2VkICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBmb3VuZCwgbWlzc2luZywgY2hhbmdlZCwgZXJyb3JzIH07XG4gIH1cblxuICBhc3luYyBvcGVuQ3JlYXRlZE5vdGUoYWJzb2x1dGVOb3RlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdmF1bHRQYXRoID0gZ2V0VmF1bHRQYXRoKHRoaXMuYXBwKTtcbiAgICBjb25zdCByZWwgPSB2YXVsdFJlbGF0aXZlUGF0aCh2YXVsdFBhdGgsIGFic29sdXRlTm90ZVBhdGgpO1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocmVsKTtcbiAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAnZXh0ZW5zaW9uJyBpbiBmaWxlKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSkub3BlbkZpbGUoZmlsZSBhcyBURmlsZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYWNoZSh2YXVsdFBhdGg6IHN0cmluZyk6IENhY2hlU2VydmljZSB7XG4gICAgcmV0dXJuIG5ldyBDYWNoZVNlcnZpY2UodmF1bHRQYXRoLCB0aGlzLnNldHRpbmdzLmNhY2hlRm9sZGVyLCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgc3Bhd25TeW5jKGZzLmV4aXN0c1N5bmMoJy91c3IvYmluL29wZW4nKSA/ICcvdXNyL2Jpbi9vcGVuJyA6ICdvcGVuJywgW2ZpbGVQYXRoXSwgeyBzdGRpbzogJ2lnbm9yZScgfSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgc3Bhd25TeW5jKCdjbWQnLCBbJy9jJywgJ3N0YXJ0JywgJycsIGZpbGVQYXRoXSwgeyBzdGRpbzogJ2lnbm9yZScgfSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNwYXduU3luYygneGRnLW9wZW4nLCBbZmlsZVBhdGhdLCB7IHN0ZGlvOiAnaWdub3JlJyB9KTtcbn1cbiIsICJpbXBvcnQgeyBEb2N1bWVudFR5cGUgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbm9ybWFsaXplUmVtb3RlRm9sZGVyIH0gZnJvbSAnLi9wYXRocyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVEb2N1bWVudFR5cGUodmFsdWU6IHN0cmluZywgZG9jdW1lbnRUeXBlczogc3RyaW5nW10pOiBEb2N1bWVudFR5cGUge1xuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplZExhYmVsKHZhbHVlKTtcbiAgcmV0dXJuIGRvY3VtZW50VHlwZXMuZmluZCgodHlwZSkgPT4gbm9ybWFsaXplZExhYmVsKHR5cGUpID09PSBub3JtYWxpemVkKSB8fCBmYWxsYmFja0RvY3VtZW50VHlwZShkb2N1bWVudFR5cGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZURvY3VtZW50VHlwZShyZW1vdGVGb2xkZXI6IHN0cmluZywgcmVtb3RlUm9vdDogc3RyaW5nLCBkb2N1bWVudFR5cGVzOiBzdHJpbmdbXSk6IERvY3VtZW50VHlwZSB7XG4gIGNvbnN0IHBhcnRzID0gbm9ybWFsaXplUmVtb3RlRm9sZGVyKHJlbW90ZUZvbGRlciwgcmVtb3RlUm9vdClcbiAgICAuc2xpY2UocmVtb3RlUm9vdC5sZW5ndGgpXG4gICAgLnNwbGl0KCcvJylcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xuXG4gIGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgIGNvbnN0IG1hdGNoID0gZG9jdW1lbnRUeXBlcy5maW5kKCh0eXBlKSA9PiBub3JtYWxpemVkTGFiZWwodHlwZSkgPT09IG5vcm1hbGl6ZWRMYWJlbChwYXJ0c1tpXSkpO1xuICAgIGlmIChtYXRjaCkgcmV0dXJuIG1hdGNoO1xuICB9XG5cbiAgcmV0dXJuIGZhbGxiYWNrRG9jdW1lbnRUeXBlKGRvY3VtZW50VHlwZXMpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVkTGFiZWwodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUgfHwgJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stX10rL2csICcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xufVxuXG5mdW5jdGlvbiBmYWxsYmFja0RvY3VtZW50VHlwZShkb2N1bWVudFR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHJldHVybiBkb2N1bWVudFR5cGVzLmZpbmQoKHR5cGUpID0+IG5vcm1hbGl6ZWRMYWJlbCh0eXBlKSA9PT0gJ290aGVyJykgfHwgZG9jdW1lbnRUeXBlc1swXSB8fCAnT3RoZXInO1xufVxuIiwgImltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBDT01NQU5EX09QRU5fRVhURVJOQUxfRklMRSwgRG9jdW1lbnRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IG5vcm1hbGl6ZURvY3VtZW50VHlwZSB9IGZyb20gJy4vZG9jdW1lbnRUeXBlJztcbmltcG9ydCB7IHBhcnNlRnJvbnRtYXR0ZXIsIHNldEZyb250bWF0dGVyRmllbGRzLCB5YW1sU2NhbGFyLCB5YW1sU3RyaW5nIH0gZnJvbSAnLi9mcm9udG1hdHRlcic7XG5pbXBvcnQge1xuICBkZXJpdmVDb250ZXh0TmFtZSxcbiAgZGVyaXZlQ29udGV4dFR5cGUsXG4gIGRlc2NlbmRhbnRPclNhbWUsXG4gIHJlcGxhY2VQYXRoUHJlZml4LFxufSBmcm9tICcuL3BhdGhzJztcbmltcG9ydCB7IHNsdWdUaXRsZSB9IGZyb20gJy4vZmlsZW5hbWUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsRmlsZU5vdGVJbnB1dCB7XG4gIGNvbnRleHROYW1lOiBzdHJpbmc7XG4gIGNvbnRleHRUeXBlOiBzdHJpbmc7XG4gIGRhdGU6IHN0cmluZztcbiAgZG9jdW1lbnRUeXBlOiBEb2N1bWVudFR5cGU7XG4gIG9yaWdpbmFsRmlsZW5hbWU6IHN0cmluZztcbiAgcHJvdmlkZXI6IHN0cmluZztcbiAgcmVtb3RlUGF0aDogc3RyaW5nO1xuICByZW1vdGVGb2xkZXI6IHN0cmluZztcbiAgc2hhcmVMaW5rOiBzdHJpbmc7XG4gIHNpemU6IG51bWJlcjtcbiAgdGl0bGU6IHN0cmluZztcbiAgdXBsb2FkRmlsZW5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVybmFsRmlsZU5vdGVGb2xkZXIocm9vdEZvbGRlcjogc3RyaW5nLCBkb2N1bWVudFR5cGU6IHN0cmluZywgZG9jdW1lbnRUeXBlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5wb3NpeC5qb2luKHJvb3RGb2xkZXIsIG5vcm1hbGl6ZURvY3VtZW50VHlwZShkb2N1bWVudFR5cGUsIGRvY3VtZW50VHlwZXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRXh0ZXJuYWxGaWxlTm90ZShpbnB1dDogRXh0ZXJuYWxGaWxlTm90ZUlucHV0LCBkb2N1bWVudFR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHRpdGxlID0gc2x1Z1RpdGxlKGlucHV0LnRpdGxlKTtcbiAgY29uc3QgZG9jdW1lbnRUeXBlID0gbm9ybWFsaXplRG9jdW1lbnRUeXBlKGlucHV0LmRvY3VtZW50VHlwZSwgZG9jdW1lbnRUeXBlcyk7XG4gIHJldHVybiBgLS0tXG50aXRsZTogJHt0aXRsZX1cbnR5cGU6IGV4dGVybmFsLWZpbGVcbnN0YXR1czogYWN0aXZlXG5kb2N1bWVudF90eXBlOiAke3lhbWxTY2FsYXIoZG9jdW1lbnRUeXBlKX1cbnN0b3JhZ2U6IGV4dGVybmFsXG5zdG9yYWdlX3Byb3ZpZGVyOiAke2lucHV0LnByb3ZpZGVyfVxuc3RvcmFnZV9mb2xkZXI6ICR7eWFtbFN0cmluZyhpbnB1dC5yZW1vdGVGb2xkZXIpfVxucmVtb3RlX3BhdGg6ICR7eWFtbFN0cmluZyhpbnB1dC5yZW1vdGVQYXRoKX1cbnNoYXJlX2xpbms6ICR7aW5wdXQuc2hhcmVMaW5rID09PSAnbm9uZScgPyAnbm9uZScgOiB5YW1sU3RyaW5nKGlucHV0LnNoYXJlTGluayl9XG5vcmlnaW5hbF9maWxlbmFtZTogJHt5YW1sU3RyaW5nKGlucHV0Lm9yaWdpbmFsRmlsZW5hbWUpfVxudXBsb2FkX2ZpbGVuYW1lOiAke3lhbWxTdHJpbmcoaW5wdXQudXBsb2FkRmlsZW5hbWUpfVxuZmlsZV9zaXplX2J5dGVzOiAke2lucHV0LnNpemV9XG5jb250ZXh0X3R5cGU6ICR7aW5wdXQuY29udGV4dFR5cGV9XG5jb250ZXh0X25hbWU6ICR7eWFtbFN0cmluZyhpbnB1dC5jb250ZXh0TmFtZSl9XG5jcmVhdGVkOiAke2lucHV0LmRhdGV9XG51cGRhdGVkOiAke2lucHV0LmRhdGV9XG4tLS1cblxuIyAke3RpdGxlfVxuXG5TdG9yZWQgb3V0c2lkZSB0aGUgdmF1bHQuXG5cblN0b3JhZ2UgZm9sZGVyOiBcXGAke2lucHV0LnJlbW90ZUZvbGRlcn1cXGBcblxuIyMgT3BlblxuXG5cXGBcXGBcXGBtZXRhLWJpbmQtYnV0dG9uXG5sYWJlbDogT3BlbiBFeHRlcm5hbCBGaWxlXG5zdHlsZTogcHJpbWFyeVxuYWN0aW9uOlxuICB0eXBlOiBjb21tYW5kXG4gIGNvbW1hbmQ6ICR7Q09NTUFORF9PUEVOX0VYVEVSTkFMX0ZJTEV9XG5cXGBcXGBcXGBcblxuIyMgU3VtbWFyeVxuXG4tXG5gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRXh0ZXJuYWxGaWxlVGV4dEZvckZvbGRlclJlbmFtZShcbiAgdGV4dDogc3RyaW5nLFxuICBvbGRQYXRoOiBzdHJpbmcsXG4gIG5ld1BhdGg6IHN0cmluZyxcbiAgdG9kYXk6IHN0cmluZyxcbiAgcmVtb3RlUm9vdDogc3RyaW5nLFxuICBjb250ZXh0VHlwZXM6IHN0cmluZ1tdLFxuKTogc3RyaW5nIHtcbiAgY29uc3QgZm0gPSBwYXJzZUZyb250bWF0dGVyKHRleHQpO1xuICBjb25zdCBvbGRTdG9yYWdlID0gZm0uc3RvcmFnZV9mb2xkZXIgfHwgJyc7XG4gIGNvbnN0IG9sZFJlbW90ZSA9IGZtLnJlbW90ZV9wYXRoIHx8IGZtLnByb3Rvbl9wYXRoIHx8ICcnO1xuICBjb25zdCBhZmZlY3RlZCA9IGRlc2NlbmRhbnRPclNhbWUob2xkU3RvcmFnZSwgb2xkUGF0aCkgfHwgZGVzY2VuZGFudE9yU2FtZShvbGRSZW1vdGUsIG9sZFBhdGgpO1xuICBpZiAoIWFmZmVjdGVkKSByZXR1cm4gdGV4dDtcblxuICBjb25zdCByZXBsYWNlZCA9IHJlcGxhY2VQYXRoUHJlZml4KHRleHQsIG9sZFBhdGgsIG5ld1BhdGgpO1xuICBjb25zdCBuZXdTdG9yYWdlID0gb2xkU3RvcmFnZSA/IHJlcGxhY2VQYXRoUHJlZml4KG9sZFN0b3JhZ2UsIG9sZFBhdGgsIG5ld1BhdGgpIDogJyc7XG4gIGNvbnN0IHVwZGF0ZXMgPSB7XG4gICAgdXBkYXRlZDogeyB2YWx1ZTogdG9kYXkgfSxcbiAgICAuLi4obmV3U3RvcmFnZSA/IHtcbiAgICAgIGNvbnRleHRfdHlwZTogeyB2YWx1ZTogZGVyaXZlQ29udGV4dFR5cGUobmV3U3RvcmFnZSwgcmVtb3RlUm9vdCwgY29udGV4dFR5cGVzKSB9LFxuICAgICAgY29udGV4dF9uYW1lOiB7IHZhbHVlOiBkZXJpdmVDb250ZXh0TmFtZShuZXdTdG9yYWdlLCByZW1vdGVSb290KSwgcXVvdGU6IHRydWUgfSxcbiAgICB9IDoge30pLFxuICB9O1xuICByZXR1cm4gc2V0RnJvbnRtYXR0ZXJGaWVsZHMocmVwbGFjZWQsIHVwZGF0ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya0V4dGVybmFsRmlsZVRleHRNaXNzaW5nKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGZvbGRlck9yRmlsZVBhdGg6IHN0cmluZyxcbiAgdG9kYXk6IHN0cmluZyxcbiAgcmVhc29uID0gJ0V4dGVybmFsIGZpbGUgbm90IGZvdW5kJyxcbik6IHN0cmluZyB7XG4gIGNvbnN0IGZtID0gcGFyc2VGcm9udG1hdHRlcih0ZXh0KTtcbiAgY29uc3QgYWZmZWN0ZWQgPSBkZXNjZW5kYW50T3JTYW1lKGZtLnN0b3JhZ2VfZm9sZGVyIHx8ICcnLCBmb2xkZXJPckZpbGVQYXRoKSB8fFxuICAgIGRlc2NlbmRhbnRPclNhbWUoZm0ucmVtb3RlX3BhdGggfHwgZm0ucHJvdG9uX3BhdGggfHwgJycsIGZvbGRlck9yRmlsZVBhdGgpO1xuICBpZiAoIWFmZmVjdGVkKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHNldEZyb250bWF0dGVyRmllbGRzKHRleHQsIHtcbiAgICBzdGF0dXM6IHsgdmFsdWU6ICdtaXNzaW5nJyB9LFxuICAgIHVwZGF0ZWQ6IHsgdmFsdWU6IHRvZGF5IH0sXG4gICAgbWlzc2luZ19yZWFzb246IHsgdmFsdWU6IHJlYXNvbiwgcXVvdGU6IHRydWUgfSxcbiAgfSk7XG59XG4iLCAiZXhwb3J0IHR5cGUgRnJvbnRtYXR0ZXIgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEZyb250bWF0dGVyVXBkYXRlIHtcbiAgcXVvdGU/OiBib29sZWFuO1xuICByYXc/OiBib29sZWFuO1xuICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRnJvbnRtYXR0ZXIodGV4dDogc3RyaW5nKTogRnJvbnRtYXR0ZXIge1xuICBjb25zdCBtYXRjaCA9IFN0cmluZyh0ZXh0IHx8ICcnKS5tYXRjaCgvXi0tLVxccj9cXG4oW1xcc1xcU10qPylcXHI/XFxuLS0tLyk7XG4gIGNvbnN0IG91dDogRnJvbnRtYXR0ZXIgPSB7fTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG91dDtcbiAgZm9yIChjb25zdCBsaW5lIG9mIG1hdGNoWzFdLnNwbGl0KC9cXHI/XFxuLykpIHtcbiAgICBjb25zdCBpZHggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBpZiAoaWR4ID09PSAtMSkgY29udGludWU7XG4gICAgY29uc3Qga2V5ID0gbGluZS5zbGljZSgwLCBpZHgpLnRyaW0oKTtcbiAgICBsZXQgdmFsdWUgPSBsaW5lLnNsaWNlKGlkeCArIDEpLnRyaW0oKTtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL15cInxcIiQvZywgJycpO1xuICAgIG91dFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHlhbWxTdHJpbmcodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoU3RyaW5nKHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5YW1sU2NhbGFyKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgJy0nKS5yZXBsYWNlKC9cXHMrL2csICctJykudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEZyb250bWF0dGVyRmllbGRzKHRleHQ6IHN0cmluZywgdXBkYXRlczogUmVjb3JkPHN0cmluZywgRnJvbnRtYXR0ZXJVcGRhdGU+KTogc3RyaW5nIHtcbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKHRleHQgfHwgJycpO1xuICBjb25zdCBtYXRjaCA9IHNvdXJjZS5tYXRjaCgvXi0tLVxccj9cXG4oW1xcc1xcU10qPylcXHI/XFxuLS0tLyk7XG4gIGlmICghbWF0Y2gpIHJldHVybiBzb3VyY2U7XG5cbiAgY29uc3QgcmVtYWluaW5nID0geyAuLi51cGRhdGVzIH07XG4gIGNvbnN0IGxpbmVzID0gbWF0Y2hbMV0uc3BsaXQoL1xccj9cXG4vKS5tYXAoKGxpbmUpID0+IHtcbiAgICBjb25zdCBpZHggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIGxpbmU7XG4gICAgY29uc3Qga2V5ID0gbGluZS5zbGljZSgwLCBpZHgpLnRyaW0oKTtcbiAgICBjb25zdCB1cGRhdGUgPSByZW1haW5pbmdba2V5XTtcbiAgICBpZiAoIXVwZGF0ZSkgcmV0dXJuIGxpbmU7XG4gICAgZGVsZXRlIHJlbWFpbmluZ1trZXldO1xuICAgIHJldHVybiBgJHtrZXl9OiAke2Zyb250bWF0dGVyVmFsdWUodXBkYXRlKX1gO1xuICB9KTtcblxuICBmb3IgKGNvbnN0IFtrZXksIHVwZGF0ZV0gb2YgT2JqZWN0LmVudHJpZXMocmVtYWluaW5nKSkge1xuICAgIGxpbmVzLnB1c2goYCR7a2V5fTogJHtmcm9udG1hdHRlclZhbHVlKHVwZGF0ZSl9YCk7XG4gIH1cblxuICBjb25zdCBlb2wgPSBzb3VyY2UuaW5jbHVkZXMoJ1xcclxcbicpID8gJ1xcclxcbicgOiAnXFxuJztcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKC9eLS0tXFxyP1xcbltcXHNcXFNdKj9cXHI/XFxuLS0tLywgYC0tLSR7ZW9sfSR7bGluZXMuam9pbihlb2wpfSR7ZW9sfS0tLWApO1xufVxuXG5mdW5jdGlvbiBmcm9udG1hdHRlclZhbHVlKHVwZGF0ZTogRnJvbnRtYXR0ZXJVcGRhdGUpOiBzdHJpbmcge1xuICBpZiAodXBkYXRlLnJhdykgcmV0dXJuIFN0cmluZyh1cGRhdGUudmFsdWUpO1xuICBpZiAodXBkYXRlLnZhbHVlID09PSAnbm9uZScpIHJldHVybiAnbm9uZSc7XG4gIGlmICh1cGRhdGUucXVvdGUpIHJldHVybiB5YW1sU3RyaW5nKHVwZGF0ZS52YWx1ZSk7XG4gIHJldHVybiBTdHJpbmcodXBkYXRlLnZhbHVlKTtcbn1cbiIsICJpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2x1Z1RpdGxlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgJy0nKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUoaW5wdXQ6IHN0cmluZywgc291cmNlRmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc291cmNlRXh0ID0gcGF0aC5leHRuYW1lKHNvdXJjZUZpbGUgfHwgJycpO1xuICBsZXQgZmlsZW5hbWUgPSBTdHJpbmcoaW5wdXQgfHwgJycpLnRyaW0oKTtcbiAgaWYgKCFmaWxlbmFtZSAmJiBzb3VyY2VGaWxlKSBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoc291cmNlRmlsZSk7XG4gIGlmICghZmlsZW5hbWUpIHRocm93IG5ldyBFcnJvcignVXBsb2FkIGZpbGVuYW1lIGlzIHJlcXVpcmVkLicpO1xuICBpZiAoL1tcXFxcLzoqP1wiPD58XS8udGVzdChmaWxlbmFtZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VwbG9hZCBmaWxlbmFtZSBjYW5ub3QgY29udGFpbiAvIFxcXFwgOiAqID8gXCIgPCA+IHwnKTtcbiAgfVxuICBpZiAoIXBhdGguZXh0bmFtZShmaWxlbmFtZSkgJiYgc291cmNlRXh0KSBmaWxlbmFtZSArPSBzb3VyY2VFeHQ7XG4gIHJldHVybiBmaWxlbmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRUaXRsZUZvckZpbGUoZmlsZVBhdGg6IHN0cmluZywgbm93ID0gbmV3IERhdGUoKSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGUgPSBub3cudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gIGNvbnN0IHBhcnNlZCA9IHBhdGgucGFyc2UoZmlsZVBhdGggfHwgJycpO1xuICByZXR1cm4gc2x1Z1RpdGxlKGAke2RhdGV9ICR7cGFyc2VkLm5hbWUgfHwgJ0V4dGVybmFsIEZpbGUnfWApO1xufVxuIiwgImltcG9ydCB7IGV4ZWNGaWxlIGFzIGV4ZWNGaWxlQ2FsbGJhY2ssIHNwYXduLCBzcGF3blN5bmMgfSBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ25vZGU6dXRpbCc7XG5pbXBvcnQgeyBqb2luUmVtb3RlUGF0aCB9IGZyb20gJy4uL2RvbWFpbi9wYXRocyc7XG5pbXBvcnQgeyBMb2dpblJlc3VsdCwgU2V0dXBDaGVjaywgU2V0dXBTdGF0dXMsIFN0b3JhZ2VQcm92aWRlciwgU3RvcmVkRmlsZSwgVXBsb2FkRmlsZUlucHV0IH0gZnJvbSAnLi9zdG9yYWdlUHJvdmlkZXInO1xuXG5jb25zdCBleGVjRmlsZSA9IHByb21pc2lmeShleGVjRmlsZUNhbGxiYWNrKTtcblxuZXhwb3J0IGNvbnN0IFBST1RPTl9DTElfSU5TVEFMTF9VUkwgPSAnaHR0cHM6Ly9wcm90b24ubWUvc3VwcG9ydC9kcml2ZS1jbGknO1xuY29uc3QgUFJPVE9OX0RFRkFVTFRfUk9PVCA9ICcvbXktZmlsZXMnO1xuY29uc3QgTE9HSU5fVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDA7XG5cbmV4cG9ydCB0eXBlIENsaVByb2JlID0gKGNhbmRpZGF0ZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByb3RvbkRyaXZlQ2xpUHJvdmlkZXJPcHRpb25zIHtcbiAgLyoqIEV4cGxpY2l0IENMSSBwYXRoIGZyb20gcGx1Z2luIHNldHRpbmdzLiBFbXB0eSBtZWFucyBhdXRvLWRldGVjdC4gKi9cbiAgY2xpUGF0aD86IHN0cmluZztcbiAgLyoqIE92ZXJyaWRlcyBob3cgY2FuZGlkYXRlIENMSSBwYXRocyBhcmUgdGVzdGVkLiBVc2VkIGJ5IHRlc3RzLiAqL1xuICBwcm9iZT86IENsaVByb2JlO1xufVxuXG5pbnRlcmZhY2UgUHJvdG9uSXRlbSB7XG4gIGFjdGl2ZVJldmlzaW9uPzoge1xuICAgIGNsYWltZWRTaXplPzogbnVtYmVyO1xuICAgIGNyZWF0aW9uVGltZT86IHN0cmluZztcbiAgICBzdG9yYWdlU2l6ZT86IG51bWJlcjtcbiAgfTtcbiAgY3JlYXRpb25UaW1lPzogc3RyaW5nO1xuICBtZWRpYVR5cGU/OiBzdHJpbmc7XG4gIG1vZGlmaWNhdGlvblRpbWU/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmcgfCB7IG9rPzogYm9vbGVhbjsgdmFsdWU/OiBzdHJpbmcgfTtcbiAgdG90YWxTdG9yYWdlU2l6ZT86IG51bWJlcjtcbiAgdHlwZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvbkRyaXZlQ2xpUHJvdmlkZXIgaW1wbGVtZW50cyBTdG9yYWdlUHJvdmlkZXIge1xuICBwcml2YXRlIHJlc29sdmVkQ2xpUGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBQcm90b25Ecml2ZUNsaVByb3ZpZGVyT3B0aW9ucyA9IHt9KSB7fVxuXG4gIC8qKiBSZXNvbHZlcyB0aGUgQ0xJIGxhemlseSBzbyB0aGUgcGx1Z2luIHN0aWxsIGxvYWRzIHdoZW4gUHJvdG9uIGlzIG5vdCBpbnN0YWxsZWQgeWV0LiAqL1xuICBjbGlQYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLnJlc29sdmVkQ2xpUGF0aCkgdGhpcy5yZXNvbHZlZENsaVBhdGggPSBmaW5kUHJvdG9uRHJpdmVDbGkodGhpcy5vcHRpb25zLmNsaVBhdGgsIHRoaXMub3B0aW9ucy5wcm9iZSk7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZWRDbGlQYXRoO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tTZXR1cChyZW1vdGVSb290OiBzdHJpbmcpOiBQcm9taXNlPFNldHVwU3RhdHVzPiB7XG4gICAgY29uc3QgY2hlY2tzOiBTZXR1cENoZWNrW10gPSBbXTtcbiAgICBsZXQgY2xpUGF0aDogc3RyaW5nO1xuICAgIHRyeSB7XG4gICAgICBjbGlQYXRoID0gdGhpcy5jbGlQYXRoKCk7XG4gICAgICBjaGVja3MucHVzaCh7IGxhYmVsOiAnUHJvdG9uIERyaXZlIENMSScsIG9rOiB0cnVlLCBkZXRhaWw6IGNsaVBhdGggfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjaGVja3MucHVzaCh7XG4gICAgICAgIGxhYmVsOiAnUHJvdG9uIERyaXZlIENMSScsXG4gICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgZGV0YWlsOiBgTm90IGZvdW5kLiBJbnN0YWxsIGl0IGZyb20gJHtQUk9UT05fQ0xJX0lOU1RBTExfVVJMfSwgb3Igc2V0IHRoZSBDTEkgcGF0aCBpbiBzZXR0aW5ncy5gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4geyByZWFkeTogZmFsc2UsIGNoZWNrcyB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3QgPSByZW1vdGVSb290LnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ2xpc3QnLCByb290IHx8IFBST1RPTl9ERUZBVUxUX1JPT1QsICctLWpzb24nXSk7XG4gICAgICBjaGVja3MucHVzaCh7IGxhYmVsOiAnU2lnbmVkIGluJywgb2s6IHRydWUsIGRldGFpbDogJ1Byb3RvbiBEcml2ZSByZXNwb25kZWQuJyB9KTtcbiAgICAgIGNoZWNrcy5wdXNoKHJvb3RcbiAgICAgICAgPyB7IGxhYmVsOiAnUmVtb3RlIHJvb3QnLCBvazogdHJ1ZSwgZGV0YWlsOiByb290IH1cbiAgICAgICAgOiB7IGxhYmVsOiAnUmVtb3RlIHJvb3QnLCBvazogZmFsc2UsIGRldGFpbDogJ05vdCBjb25maWd1cmVkLiBTZXQgdGhlIHJlbW90ZSByb290IGluIHNldHRpbmdzLicgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChpc01pc3NpbmdSZW1vdGVQYXRoRXJyb3IoZXJyb3IpICYmIHJvb3QpIHtcbiAgICAgICAgY2hlY2tzLnB1c2goeyBsYWJlbDogJ1NpZ25lZCBpbicsIG9rOiB0cnVlLCBkZXRhaWw6ICdQcm90b24gRHJpdmUgcmVzcG9uZGVkLicgfSk7XG4gICAgICAgIGNoZWNrcy5wdXNoKHsgbGFiZWw6ICdSZW1vdGUgcm9vdCcsIG9rOiBmYWxzZSwgZGV0YWlsOiBgJHtyb290fSB3YXMgbm90IGZvdW5kLCBvciB0aGlzIGFjY291bnQgY2Fubm90IHNlZSBpdC5gIH0pO1xuICAgICAgfSBlbHNlIGlmIChpc0F1dGhFcnJvcihlcnJvcikpIHtcbiAgICAgICAgY2hlY2tzLnB1c2goeyBsYWJlbDogJ1NpZ25lZCBpbicsIG9rOiBmYWxzZSwgZGV0YWlsOiAnTm90IHNpZ25lZCBpbi4gVXNlIFwiTG9nIGluIHRvIFByb3RvblwiLicgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGVja3MucHVzaCh7IGxhYmVsOiAnU2lnbmVkIGluJywgb2s6IGZhbHNlLCBkZXRhaWw6IGZpcnN0TGluZShlcnJvcikgfHwgYCR7Y2xpUGF0aH0gY291bGQgbm90IHJlYWNoIFByb3RvbiBEcml2ZS5gIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IHJlYWR5OiBjaGVja3MuZXZlcnkoKGNoZWNrKSA9PiBjaGVjay5vayksIGNoZWNrcyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYHByb3Rvbi1kcml2ZSBhdXRoIGxvZ2luYCwgd2hpY2ggY29tcGxldGVzIGluIHRoZSBicm93c2VyLCBhbmQgd2FpdHMgZm9yIGl0IHRvIGZpbmlzaC5cbiAgICogYG9uVXJsYCByZWNlaXZlcyB0aGUgZmlyc3Qgc2lnbi1pbiBsaW5rIHRoZSBDTEkgcHJpbnRzLCBpbiBjYXNlIHRoZSBicm93c2VyIGRpZCBub3Qgb3BlbiBvbiBpdHMgb3duLlxuICAgKi9cbiAgbG9naW4ob25Vcmw/OiAodXJsOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gICAgY29uc3QgY2xpUGF0aCA9IHRoaXMuY2xpUGF0aCgpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjaGlsZCA9IHNwYXduKGNsaVBhdGgsIFsnYXV0aCcsICdsb2dpbiddLCB7IHN0ZGlvOiBbJ2lnbm9yZScsICdwaXBlJywgJ3BpcGUnXSB9KTtcbiAgICAgIGxldCBvdXRwdXQgPSAnJztcbiAgICAgIGxldCB1cmxSZXBvcnRlZCA9IGZhbHNlO1xuICAgICAgY29uc3QgY29sbGVjdCA9IChjaHVuazogQnVmZmVyKSA9PiB7XG4gICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBjb25zdCB1cmwgPSB1cmxSZXBvcnRlZCA/IG51bGwgOiBmaW5kVXJsKG91dHB1dCk7XG4gICAgICAgIGlmICh1cmwgJiYgb25VcmwpIHtcbiAgICAgICAgICB1cmxSZXBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgb25VcmwodXJsKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoaWxkLnN0ZG91dD8ub24oJ2RhdGEnLCBjb2xsZWN0KTtcbiAgICAgIGNoaWxkLnN0ZGVycj8ub24oJ2RhdGEnLCBjb2xsZWN0KTtcbiAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNoaWxkLmtpbGwoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUHJvdG9uIGxvZ2luIHRpbWVkIG91dC4gVHJ5IGFnYWluLCBvciBydW4gYHByb3Rvbi1kcml2ZSBhdXRoIGxvZ2luYCBpbiBhIHRlcm1pbmFsLicpKTtcbiAgICAgIH0sIExPR0lOX1RJTUVPVVRfTVMpO1xuICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcbiAgICAgIGNoaWxkLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIGlmIChjb2RlID09PSAwKSByZXNvbHZlKHsgb3V0cHV0LCB1cmw6IGZpbmRVcmwob3V0cHV0KSB9KTtcbiAgICAgICAgZWxzZSByZWplY3QobmV3IEVycm9yKGBQcm90b24gbG9naW4gZmFpbGVkIChleGl0ICR7Y29kZX0pLiR7b3V0cHV0LnRyaW0oKSA/IGBcXG4ke291dHB1dC50cmltKCl9YCA6ICcnfWApKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlRm9sZGVyKHBhcmVudFBhdGg6IHN0cmluZywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ2NyZWF0ZS1mb2xkZXInLCBwYXJlbnRQYXRoLCBuYW1lLCAnLS1qc29uJ10pO1xuICB9XG5cbiAgYXN5bmMgZG93bmxvYWRGaWxlKHJlbW90ZVBhdGg6IHN0cmluZywgZGVzdGluYXRpb25Gb2xkZXI6IHN0cmluZyk6IFByb21pc2U8U3RvcmVkRmlsZT4ge1xuICAgIGF3YWl0IHRoaXMucnVuKFsnZmlsZXN5c3RlbScsICdkb3dubG9hZCcsICctZicsICdyZW1vdmUnLCByZW1vdGVQYXRoLCBkZXN0aW5hdGlvbkZvbGRlcl0pO1xuICAgIGNvbnN0IGRvd25sb2FkZWQgPSBwYXRoLmpvaW4oZGVzdGluYXRpb25Gb2xkZXIsIHBhdGguYmFzZW5hbWUocmVtb3RlUGF0aCkpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkb3dubG9hZGVkKSkgdGhyb3cgbmV3IEVycm9yKCdEb3dubG9hZCBjb21wbGV0ZWQsIGJ1dCBleHBlY3RlZCBmaWxlIHdhcyBub3QgZm91bmQuJyk7XG4gICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGRvd25sb2FkZWQpO1xuICAgIHJldHVybiB7XG4gICAgICBtb2RpZmllZFRpbWU6IHN0YXQubXRpbWUudG9JU09TdHJpbmcoKSxcbiAgICAgIHBhdGg6IGRvd25sb2FkZWQsXG4gICAgICBzaXplOiBzdGF0LnNpemUsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGxpc3RGb2xkZXJzKHBhcmVudFBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCByYXcgPSBhd2FpdCB0aGlzLnJ1bihbJ2ZpbGVzeXN0ZW0nLCAnbGlzdCcsIHBhcmVudFBhdGgsICctLWpzb24nXSk7XG4gICAgY29uc3QgaXRlbXMgPSBKU09OLnBhcnNlKHJhdyB8fCAnW10nKSBhcyBQcm90b25JdGVtW107XG4gICAgcmV0dXJuIGl0ZW1zXG4gICAgICAuZmlsdGVyKChpdGVtKSA9PiBpdGVtICYmIGl0ZW0udHlwZSA9PT0gJ2ZvbGRlcicpXG4gICAgICAubWFwKHByb3Rvbkl0ZW1OYW1lKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSk7XG4gIH1cblxuICBhc3luYyByZW5hbWVGb2xkZXIob2xkUGF0aDogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnJ1bihbJ2ZpbGVzeXN0ZW0nLCAncmVuYW1lJywgb2xkUGF0aCwgbmV3TmFtZV0pO1xuICB9XG5cbiAgYXN5bmMgc3RhdChyZW1vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFN0b3JlZEZpbGU+IHtcbiAgICBjb25zdCByYXcgPSBhd2FpdCB0aGlzLnJ1bihbJ2ZpbGVzeXN0ZW0nLCAnaW5mbycsIHJlbW90ZVBhdGgsICctLWpzb24nXSk7XG4gICAgY29uc3QgaXRlbSA9IEpTT04ucGFyc2UocmF3IHx8ICd7fScpIGFzIFByb3Rvbkl0ZW07XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGlmaWVkVGltZTogbmV3ZXN0VGltZShpdGVtKSxcbiAgICAgIHBhdGg6IHJlbW90ZVBhdGgsXG4gICAgICBzaXplOiBpdGVtLnRvdGFsU3RvcmFnZVNpemUgfHwgaXRlbS5hY3RpdmVSZXZpc2lvbj8uY2xhaW1lZFNpemUgfHwgaXRlbS5hY3RpdmVSZXZpc2lvbj8uc3RvcmFnZVNpemUgfHwgMCxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgdHJhc2hGb2xkZXIocmVtb3RlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ3RyYXNoJywgcmVtb3RlUGF0aF0pO1xuICB9XG5cbiAgYXN5bmMgdXBsb2FkRmlsZShpbnB1dDogVXBsb2FkRmlsZUlucHV0KTogUHJvbWlzZTxTdG9yZWRGaWxlPiB7XG4gICAgY29uc3QgcHJlcGFyZWQgPSBwcmVwYXJlVXBsb2FkRmlsZShpbnB1dC5sb2NhbFBhdGgsIGlucHV0LnJlbW90ZU5hbWUpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1bihbJ2ZpbGVzeXN0ZW0nLCAndXBsb2FkJywgJy1mJywgJ3JlcGxhY2UnLCAnLWQnLCAnbWVyZ2UnLCBwcmVwYXJlZC51cGxvYWRQYXRoLCBpbnB1dC5yZW1vdGVGb2xkZXIsICctLWpzb24nXSk7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0KGpvaW5SZW1vdGVQYXRoKGlucHV0LnJlbW90ZUZvbGRlciwgaW5wdXQucmVtb3RlTmFtZSkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBwcmVwYXJlZC5jbGVhbnVwKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBydW4oYXJnczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjRmlsZSh0aGlzLmNsaVBhdGgoKSwgYXJncywgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdC5zdGRvdXQgfHwgJyc7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IGRlY29yYXRlQ2xpRXJyb3IodGhpcy5jbGlQYXRoKCksIGFyZ3MsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3RvbkRyaXZlQ2xpQ2FuZGlkYXRlcyhjb25maWd1cmVkUGF0aCA9ICcnLCBlbnY6IE5vZGVKUy5Qcm9jZXNzRW52ID0gcHJvY2Vzcy5lbnYsIGhvbWUgPSBvcy5ob21lZGlyKCkpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgY29uZmlndXJlZFBhdGgudHJpbSgpLFxuICAgIGVudi5QUk9UT05fRFJJVkVfQ0xJLFxuICAgICdwcm90b24tZHJpdmUnLFxuICAgIHBhdGguam9pbihob21lLCAnLmxvY2FsL2Jpbi9wcm90b24tZHJpdmUnKSxcbiAgICAnL29wdC9ob21lYnJldy9iaW4vcHJvdG9uLWRyaXZlJyxcbiAgICAnL3Vzci9sb2NhbC9iaW4vcHJvdG9uLWRyaXZlJyxcbiAgXS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoY2FuZGlkYXRlcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFByb3RvbkRyaXZlQ2xpKGNvbmZpZ3VyZWRQYXRoID0gJycsIHByb2JlOiBDbGlQcm9iZSA9IHByb2JlQ2xpKTogc3RyaW5nIHtcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgcHJvdG9uRHJpdmVDbGlDYW5kaWRhdGVzKGNvbmZpZ3VyZWRQYXRoKSkge1xuICAgIGlmIChwcm9iZShjYW5kaWRhdGUpKSByZXR1cm4gY2FuZGlkYXRlO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBwcm90b24tZHJpdmUgQ0xJLiBJbnN0YWxsIGl0IG9yIHNldCB0aGUgQ0xJIHBhdGggaW4gRmlsZSBFeHRlcm5hbGl6ZXIgc2V0dGluZ3MuJyk7XG59XG5cbmZ1bmN0aW9uIHByb2JlQ2xpKGNhbmRpZGF0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBzcGF3blN5bmMoY2FuZGlkYXRlLCBbJy0taGVscCddLCB7IGVuY29kaW5nOiAndXRmOCcgfSkuc3RhdHVzID09PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBdXRoRXJyb3IoZXJyb3I6IHVua25vd24pOiBib29sZWFuIHtcbiAgLy8gTG9vayBhdCB0aGUgQ0xJJ3Mgb3duIG91dHB1dCBmaXJzdDogdGhlIHdyYXBwZWQgbWVzc2FnZSBhbHNvIGVjaG9lcyB0aGUgY29tbWFuZCBhbmQgaXRzIHBhdGhzLlxuICBjb25zdCBlcnIgPSBlcnJvciBhcyB7IG1lc3NhZ2U/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH07XG4gIGNvbnN0IG91dHB1dCA9IGAke2Vycj8uc3RkZXJyIHx8ICcnfVxcbiR7ZXJyPy5zdGRvdXQgfHwgJyd9YC50cmltKCkgfHwgZXJyPy5tZXNzYWdlIHx8ICcnO1xuICByZXR1cm4gL25vdCAobG9nZ2VkfHNpZ25lZCkgaW58bG9nID9pbnxzaWduID9pbnx1bmF1dGhvcmlbc3pdZWR8dW5hdXRoZW50aWNhdGVkfGF1dGhlbnRpY2F0fFxcYjQwMVxcYnxzZXNzaW9uIChoYXMgKT9leHBpcmVkL2kudGVzdChvdXRwdXQpO1xufVxuXG5mdW5jdGlvbiBlcnJvclRleHQoZXJyb3I6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCBlcnIgPSBlcnJvciBhcyB7IG1lc3NhZ2U/OiBzdHJpbmc7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH07XG4gIHJldHVybiBgJHtlcnI/Lm1lc3NhZ2UgfHwgJyd9XFxuJHtlcnI/LnN0ZGVyciB8fCAnJ31cXG4ke2Vycj8uc3Rkb3V0IHx8ICcnfWAudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gZmlyc3RMaW5lKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHtcbiAgY29uc3QgZXJyID0gZXJyb3IgYXMgeyBtZXNzYWdlPzogc3RyaW5nOyBzdGRlcnI/OiBzdHJpbmcgfTtcbiAgcmV0dXJuIFN0cmluZyhlcnI/LnN0ZGVyciB8fCBlcnI/Lm1lc3NhZ2UgfHwgJycpLnRyaW0oKS5zcGxpdCgvXFxyP1xcbi8pWzBdIHx8ICcnO1xufVxuXG5mdW5jdGlvbiBmaW5kVXJsKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBtYXRjaCA9IHRleHQubWF0Y2goL2h0dHBzOlxcL1xcL1xcUysvKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNaXNzaW5nUmVtb3RlUGF0aEVycm9yKGVycm9yOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBlcnJvclRleHQoZXJyb3IpO1xuICByZXR1cm4gbWVzc2FnZS5pbmNsdWRlcygnbm90IGZvdW5kJykgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCdkb2VzIG5vdCBleGlzdCcpIHx8XG4gICAgbWVzc2FnZS5pbmNsdWRlcygnbm8gc3VjaCBmaWxlJykgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCc0MDQnKTtcbn1cblxuZnVuY3Rpb24gcHJvdG9uSXRlbU5hbWUoaXRlbTogUHJvdG9uSXRlbSk6IHN0cmluZyB7XG4gIGlmICghaXRlbSkgcmV0dXJuICcnO1xuICBpZiAodHlwZW9mIGl0ZW0ubmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLm5hbWU7XG4gIGlmIChpdGVtLm5hbWUgJiYgdHlwZW9mIGl0ZW0ubmFtZS52YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLm5hbWUudmFsdWU7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gbmV3ZXN0VGltZShpdGVtOiBQcm90b25JdGVtKTogc3RyaW5nIHtcbiAgcmV0dXJuIGl0ZW0ubW9kaWZpY2F0aW9uVGltZSB8fCBpdGVtLmFjdGl2ZVJldmlzaW9uPy5jcmVhdGlvblRpbWUgfHwgaXRlbS5jcmVhdGlvblRpbWUgfHwgJyc7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVVcGxvYWRGaWxlKGxvY2FsUGF0aDogc3RyaW5nLCByZW1vdGVOYW1lOiBzdHJpbmcpOiB7IGNsZWFudXA6ICgpID0+IHZvaWQ7IHVwbG9hZFBhdGg6IHN0cmluZyB9IHtcbiAgaWYgKHBhdGguYmFzZW5hbWUobG9jYWxQYXRoKSA9PT0gcmVtb3RlTmFtZSkgcmV0dXJuIHsgdXBsb2FkUGF0aDogbG9jYWxQYXRoLCBjbGVhbnVwOiAoKSA9PiB1bmRlZmluZWQgfTtcbiAgY29uc3QgdGVtcERpciA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2ZpbGUtZXh0ZXJuYWxpemVyLXVwbG9hZC0nKSk7XG4gIGNvbnN0IHVwbG9hZFBhdGggPSBwYXRoLmpvaW4odGVtcERpciwgcmVtb3RlTmFtZSk7XG4gIGZzLmNvcHlGaWxlU3luYyhsb2NhbFBhdGgsIHVwbG9hZFBhdGgpO1xuICByZXR1cm4ge1xuICAgIHVwbG9hZFBhdGgsXG4gICAgY2xlYW51cDogKCkgPT4gZnMucm1TeW5jKHRlbXBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVjb3JhdGVDbGlFcnJvcihjbGlQYXRoOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBlcnJvcjogdW5rbm93bik6IEVycm9yIHtcbiAgY29uc3QgZXJyID0gZXJyb3IgYXMgRXJyb3IgJiB7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH07XG4gIGNvbnN0IGRldGFpbHMgPSBbXG4gICAgZXJyLm1lc3NhZ2UsXG4gICAgZXJyLnN0ZGVyciAmJiBgc3RkZXJyOiAke2Vyci5zdGRlcnIudHJpbSgpfWAsXG4gICAgZXJyLnN0ZG91dCAmJiBgc3Rkb3V0OiAke2Vyci5zdGRvdXQudHJpbSgpfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICBjb25zdCB3cmFwcGVkID0gbmV3IEVycm9yKGAke2NsaVBhdGh9ICR7YXJncy5qb2luKCcgJyl9IGZhaWxlZCR7ZGV0YWlscyA/IGBcXG4ke2RldGFpbHN9YCA6ICcnfWApO1xuICAod3JhcHBlZCBhcyBFcnJvciAmIHsgc3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmcgfSkuc3RkZXJyID0gZXJyLnN0ZGVycjtcbiAgKHdyYXBwZWQgYXMgRXJyb3IgJiB7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH0pLnN0ZG91dCA9IGVyci5zdGRvdXQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuIiwgImltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBzYWZlUmVsYXRpdmVSZW1vdGVQYXRoIH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcblxuaW50ZXJmYWNlIENhY2hlRW50cnkge1xuICBjYWNoZWRBdDogc3RyaW5nO1xuICBjYWNoZVBhdGg6IHN0cmluZztcbiAgcmVtb3RlVGltZTogc3RyaW5nO1xufVxuXG50eXBlIENhY2hlSW5kZXggPSBSZWNvcmQ8c3RyaW5nLCBDYWNoZUVudHJ5PjtcblxuZXhwb3J0IGNsYXNzIENhY2hlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdmF1bHRQYXRoOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjYWNoZUZvbGRlcjogc3RyaW5nLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVtb3RlUm9vdDogc3RyaW5nLFxuICApIHt9XG5cbiAgY2FjaGVQYXRoRm9yUmVtb3RlKHJlbW90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLmNhY2hlUm9vdCgpLCBzYWZlUmVsYXRpdmVSZW1vdGVQYXRoKHJlbW90ZVBhdGgsIHRoaXMucmVtb3RlUm9vdCkpO1xuICB9XG5cbiAgc2VlZEZyb21Mb2NhbEZpbGUobG9jYWxQYXRoOiBzdHJpbmcsIHJlbW90ZVBhdGg6IHN0cmluZywgcmVtb3RlVGltZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2FjaGVQYXRoID0gdGhpcy5jYWNoZVBhdGhGb3JSZW1vdGUocmVtb3RlUGF0aCk7XG4gICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShjYWNoZVBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICBmcy5jb3B5RmlsZVN5bmMobG9jYWxQYXRoLCBjYWNoZVBhdGgpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5yZWFkSW5kZXgoKTtcbiAgICBpbmRleFtyZW1vdGVQYXRoXSA9IHtcbiAgICAgIGNhY2hlUGF0aDogcGF0aC5yZWxhdGl2ZSh0aGlzLnZhdWx0UGF0aCwgY2FjaGVQYXRoKSxcbiAgICAgIHJlbW90ZVRpbWUsXG4gICAgICBjYWNoZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG4gICAgdGhpcy53cml0ZUluZGV4KGluZGV4KTtcbiAgfVxuXG4gIGhhcyhyZW1vdGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyh0aGlzLmNhY2hlUGF0aEZvclJlbW90ZShyZW1vdGVQYXRoKSk7XG4gIH1cblxuICByZW1hcEZvbGRlcihvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG9sZENhY2hlUGF0aCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKG9sZFBhdGgpO1xuICAgIGNvbnN0IG5ld0NhY2hlUGF0aCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKG5ld1BhdGgpO1xuICAgIG1lcmdlTW92ZVBhdGgob2xkQ2FjaGVQYXRoLCBuZXdDYWNoZVBhdGgpO1xuICAgIHJlbW92ZUVtcHR5UGFyZW50cyhwYXRoLmRpcm5hbWUob2xkQ2FjaGVQYXRoKSwgdGhpcy5jYWNoZVJvb3QoKSk7XG5cbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmVhZEluZGV4KCk7XG4gICAgY29uc3QgbmV4dDogQ2FjaGVJbmRleCA9IHt9O1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGluZGV4KSkge1xuICAgICAgaWYgKGtleSA9PT0gb2xkUGF0aCB8fCBrZXkuc3RhcnRzV2l0aChgJHtvbGRQYXRofS9gKSkge1xuICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkucmVwbGFjZShvbGRQYXRoLCBuZXdQYXRoKTtcbiAgICAgICAgbmV4dFtuZXdLZXldID0ge1xuICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgIGNhY2hlUGF0aDogcGF0aC5yZWxhdGl2ZSh0aGlzLnZhdWx0UGF0aCwgdGhpcy5jYWNoZVBhdGhGb3JSZW1vdGUobmV3S2V5KSksXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53cml0ZUluZGV4KG5leHQpO1xuICB9XG5cbiAgcmVtb3ZlRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKGZvbGRlclBhdGgpO1xuICAgIGZzLnJtU3luYyh0YXJnZXQsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICByZW1vdmVFbXB0eVBhcmVudHMocGF0aC5kaXJuYW1lKHRhcmdldCksIHRoaXMuY2FjaGVSb290KCkpO1xuXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnJlYWRJbmRleCgpO1xuICAgIGNvbnN0IG5leHQ6IENhY2hlSW5kZXggPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhpbmRleCkpIHtcbiAgICAgIGlmIChrZXkgIT09IGZvbGRlclBhdGggJiYgIWtleS5zdGFydHNXaXRoKGAke2ZvbGRlclBhdGh9L2ApKSBuZXh0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdGhpcy53cml0ZUluZGV4KG5leHQpO1xuICB9XG5cbiAgY2FjaGVSb290KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnZhdWx0UGF0aCwgdGhpcy5jYWNoZUZvbGRlcik7XG4gIH1cblxuICBpbmRleFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuY2FjaGVSb290KCksICcuY2FjaGUtaW5kZXguanNvbicpO1xuICB9XG5cbiAgcmVhZEluZGV4KCk6IENhY2hlSW5kZXgge1xuICAgIGNvbnN0IGluZGV4UGF0aCA9IHRoaXMuaW5kZXhQYXRoKCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGluZGV4UGF0aCkpIHJldHVybiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGluZGV4UGF0aCwgJ3V0ZjgnKSkgYXMgQ2FjaGVJbmRleDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUluZGV4KGluZGV4OiBDYWNoZUluZGV4KTogdm9pZCB7XG4gICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZSh0aGlzLmluZGV4UGF0aCgpKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmluZGV4UGF0aCgpLCBKU09OLnN0cmluZ2lmeShpbmRleCwgbnVsbCwgMikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlTW92ZVBhdGgoZnJvbVBhdGg6IHN0cmluZywgdG9QYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZyb21QYXRoKSkgcmV0dXJuO1xuICBpZiAoIWZzLmV4aXN0c1N5bmModG9QYXRoKSkge1xuICAgIGZzLm1rZGlyU3luYyhwYXRoLmRpcm5hbWUodG9QYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgZnMucmVuYW1lU3luYyhmcm9tUGF0aCwgdG9QYXRoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZyb21QYXRoKTtcbiAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgIGZzLm1rZGlyU3luYyh0b1BhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBmcy5yZWFkZGlyU3luYyhmcm9tUGF0aCkpIHtcbiAgICAgIG1lcmdlTW92ZVBhdGgocGF0aC5qb2luKGZyb21QYXRoLCBuYW1lKSwgcGF0aC5qb2luKHRvUGF0aCwgbmFtZSkpO1xuICAgIH1cbiAgICBmcy5ybVN5bmMoZnJvbVBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKHRvUGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGZzLnJtU3luYyh0b1BhdGgsIHsgZm9yY2U6IHRydWUgfSk7XG4gICAgZnMucmVuYW1lU3luYyhmcm9tUGF0aCwgdG9QYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVFbXB0eVBhcmVudHMoc3RhcnRQYXRoOiBzdHJpbmcsIHN0b3BQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgbGV0IGN1cnJlbnQgPSBzdGFydFBhdGg7XG4gIGNvbnN0IHN0b3AgPSBwYXRoLnJlc29sdmUoc3RvcFBhdGgpO1xuICB3aGlsZSAocGF0aC5yZXNvbHZlKGN1cnJlbnQpLnN0YXJ0c1dpdGgoc3RvcCkgJiYgcGF0aC5yZXNvbHZlKGN1cnJlbnQpICE9PSBzdG9wKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGN1cnJlbnQpICYmIGZzLnJlYWRkaXJTeW5jKGN1cnJlbnQpLmxlbmd0aCA9PT0gMCkgZnMucm1kaXJTeW5jKGN1cnJlbnQpO1xuICAgICAgZWxzZSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN1cnJlbnQgPSBwYXRoLmRpcm5hbWUoY3VycmVudCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgRG9jdW1lbnRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IG5vcm1hbGl6ZURvY3VtZW50VHlwZSB9IGZyb20gJy4uL2RvbWFpbi9kb2N1bWVudFR5cGUnO1xuaW1wb3J0IHsgZGVmYXVsdFRpdGxlRm9yRmlsZSwgbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUgfSBmcm9tICcuLi9kb21haW4vZmlsZW5hbWUnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNlcnZpY2UsIFJlZ2lzdGVyRmlsZUlucHV0IH0gZnJvbSAnLi4vc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgRm9sZGVyUGlja2VyTW9kYWwgfSBmcm9tICcuL2ZvbGRlclBpY2tlck1vZGFsJztcblxuaW50ZXJmYWNlIE5hdGl2ZUZpbGVSZXN1bHQge1xuICBjYW5jZWxlZD86IGJvb2xlYW47XG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWdpc3RlckZpbGVNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZXM6IFJlZ2lzdGVyRmlsZUlucHV0O1xuICBwcml2YXRlIGRlc3RpbmF0aW9uRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgZXJyb3JFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBmaWxlU3RhdHVzRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcGFzdGVQYXRoU2V0dGluZzogU2V0dGluZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRpdGxlSW5wdXQ6IHsgc2V0VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRpdGxlV2FzQXV0byA9IHRydWU7XG4gIHByaXZhdGUgdXBsb2FkRmlsZW5hbWVJbnB1dDogeyBzZXRWYWx1ZSh2YWx1ZTogc3RyaW5nKTogdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdXBsb2FkRmlsZW5hbWVXYXNBdXRvID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2U6IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2V0dGluZ3M6IEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnZhbHVlcyA9IHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIHVwbG9hZEZpbGVuYW1lOiAnJyxcbiAgICAgIGRvY3VtZW50VHlwZTogJ090aGVyJyxcbiAgICAgIGRlc3RpbmF0aW9uRm9sZGVyOiBzZXR0aW5ncy5yZW1vdGVSb290LFxuICAgICAgc2hhcmVMaW5rOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItbW9kYWwnKTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnUmVnaXN0ZXIgRXh0ZXJuYWwgRmlsZScgfSk7XG5cbiAgICB0aGlzLmVycm9yRWwgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItZXJyb3InIH0pO1xuICAgIHRoaXMuZXJyb3JFbC5oaWRlKCk7XG5cbiAgICBjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGZpbGVJbnB1dC50eXBlID0gJ2ZpbGUnO1xuICAgIGZpbGVJbnB1dC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItaGlkZGVuJyk7XG4gICAgY29udGVudEVsLmFwcGVuZENoaWxkKGZpbGVJbnB1dCk7XG4gICAgZmlsZUlucHV0Lm9uY2hhbmdlID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2hvc2VuID0gZmlsZUlucHV0LmZpbGVzICYmIGZpbGVJbnB1dC5maWxlc1swXTtcbiAgICAgIGNvbnN0IGNob3NlblBhdGggPSBnZXRGaWxlUGF0aEZyb21JbnB1dEZpbGUoY2hvc2VuKTtcbiAgICAgIGlmICghY2hvc2VuUGF0aCkge1xuICAgICAgICB0aGlzLnNob3dQYXN0ZVBhdGhGaWVsZCgpO1xuICAgICAgICB0aGlzLnNob3dFcnJvcignVGhlIGZhbGxiYWNrIHBpY2tlciBjb3VsZCBub3QgZXhwb3NlIHRoZSBzZWxlY3RlZCBmaWxlIHBhdGguIFBhc3RlIHRoZSBwYXRoIGJlbG93IGluc3RlYWQuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVBhdGgoY2hvc2VuUGF0aCk7XG4gICAgfTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdMb2NhbCBmaWxlJylcbiAgICAgIC5zZXREZXNjKCdDaG9vc2UgdGhlIGZpbGUgZnJvbSB5b3VyIGNvbXB1dGVyLiBUaGUgcGx1Z2luIHVwbG9hZHMgaXQgdG8gdGhlIHNlbGVjdGVkIGV4dGVybmFsIHN0b3JhZ2UgZm9sZGVyIGFuZCBjcmVhdGVzIGFuIE9ic2lkaWFuIG5vdGUgZm9yIGl0LicpXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ0Nob29zZSBmaWxlJyk7XG4gICAgICAgIGJ1dHRvbi5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hvb3NlV2l0aEVsZWN0cm9uRGlhbG9nKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnBhdGgpIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRGaWxlUGF0aChyZXN1bHQucGF0aCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQuY2FuY2VsZWQpIHJldHVybjtcbiAgICAgICAgICAgIGZpbGVJbnB1dC5jbGljaygpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdOYXRpdmUgZmlsZSBwaWNrZXIgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1Bhc3RlUGF0aEZpZWxkKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvcignVGhlIG5hdGl2ZSBmaWxlIHBpY2tlciBmYWlsZWQuIFBhc3RlIHRoZSBmaWxlIHBhdGggYmVsb3cgaW5zdGVhZC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLmZpbGVTdGF0dXNFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItcGF0aCcsXG4gICAgICB0ZXh0OiAnTm8gZmlsZSBzZWxlY3RlZCB5ZXQuJyxcbiAgICB9KTtcblxuICAgIHRoaXMucGFzdGVQYXRoU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdQYXN0ZSBmaWxlIHBhdGgnKVxuICAgICAgLnNldERlc2MoJ0ZhbGxiYWNrIG9ubHkuIFRoaXMgYXBwZWFycyB3aGVuIE9ic2lkaWFuIGNhbm5vdCBnZXQgYSB1c2FibGUgcGF0aCBmcm9tIHRoZSBmaWxlIHBpY2tlci4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcignL3BhdGgvdG8vZmlsZS5wZGYnKTtcbiAgICAgICAgdGV4dC5vbkNoYW5nZSgodmFsdWUpID0+IHRoaXMuc2V0RmlsZVBhdGgodmFsdWUudHJpbSgpLCBmYWxzZSkpO1xuICAgICAgfSk7XG4gICAgdGhpcy5wYXN0ZVBhdGhTZXR0aW5nLnNldHRpbmdFbC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItaGlkZGVuJyk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgnTm90ZSB0aXRsZScpXG4gICAgICAuc2V0RGVzYygnVGhpcyBiZWNvbWVzIHRoZSB0aXRsZSBvZiB0aGUgT2JzaWRpYW4gbm90ZS4gSXQgZG9lcyBub3QgcmVuYW1lIHRoZSB1cGxvYWRlZCBleHRlcm5hbCBmaWxlLicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgICB0aGlzLnRpdGxlSW5wdXQgPSB0ZXh0O1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKCdDaG9vc2UgYSBmaWxlIHRvIGdlbmVyYXRlIGEgdGl0bGUnKTtcbiAgICAgICAgdGV4dC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbHVlcy50aXRsZSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICB0aGlzLnRpdGxlV2FzQXV0byA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ1VwbG9hZCBmaWxlbmFtZScpXG4gICAgICAuc2V0RGVzYygnVGhpcyBpcyB0aGUgZmlsZW5hbWUgc3RvcmVkIGV4dGVybmFsbHkuIElmIHlvdSBvbWl0IHRoZSBleHRlbnNpb24sIHRoZSBzb3VyY2UgZmlsZSBleHRlbnNpb24gaXMgYWRkZWQgYXV0b21hdGljYWxseS4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGhpcy51cGxvYWRGaWxlbmFtZUlucHV0ID0gdGV4dDtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcignQ2hvb3NlIGEgZmlsZSB0byBnZW5lcmF0ZSBhIGZpbGVuYW1lJyk7XG4gICAgICAgIHRleHQub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgdGhpcy51cGxvYWRGaWxlbmFtZVdhc0F1dG8gPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmhpZGVFcnJvcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ0RvY3VtZW50IHR5cGUnKVxuICAgICAgLnNldERlc2MoJ1RoaXMgY29udHJvbHMgd2hlcmUgdGhlIE9ic2lkaWFuIGV4dGVybmFsLWZpbGUgbm90ZSBpcyBmaWxlZC4gSXQgZG9lcyBub3QgZm9yY2UgYW4gZXh0ZXJuYWwgZm9sZGVyIGxheW91dC4nKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKSBkcm9wZG93bi5hZGRPcHRpb24odHlwZSwgdHlwZSk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMudmFsdWVzLmRvY3VtZW50VHlwZSk7XG4gICAgICAgIGRyb3Bkb3duLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsdWVzLmRvY3VtZW50VHlwZSA9IG5vcm1hbGl6ZURvY3VtZW50VHlwZSh2YWx1ZSwgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKSBhcyBEb2N1bWVudFR5cGU7XG4gICAgICAgICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdEZXN0aW5hdGlvbiBmb2xkZXInKVxuICAgICAgLnNldERlc2MoJ0Nob29zZSB0aGUgZXhhY3QgZXh0ZXJuYWwgc3RvcmFnZSBmb2xkZXIgd2hlcmUgdGhpcyBmaWxlIHNob3VsZCBiZSB1cGxvYWRlZC4nKVxuICAgICAgLmFkZEJ1dHRvbigoYnV0dG9uKSA9PiBidXR0b25cbiAgICAgICAgLnNldEJ1dHRvblRleHQoJ0Nob29zZSBmb2xkZXInKVxuICAgICAgICAub25DbGljaygoKSA9PiB0aGlzLm9wZW5Gb2xkZXJQaWNrZXIoKSkpO1xuXG4gICAgdGhpcy5kZXN0aW5hdGlvbkVsID0gY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1wYXRoJyxcbiAgICAgIHRleHQ6IGBEZXN0aW5hdGlvbjogJHt0aGlzLnZhbHVlcy5kZXN0aW5hdGlvbkZvbGRlcn1gLFxuICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ0NyZWF0ZSBzaGFyZSBsaW5rJylcbiAgICAgIC5zZXREZXNjKCdOb3QgaW1wbGVtZW50ZWQgeWV0IGZvciBwcm92aWRlci1uZXV0cmFsIHN0b3JhZ2UuIExlYXZlIG9mZiBmb3Igbm93LicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+IHtcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMudmFsdWVzLnNoYXJlTGluayk7XG4gICAgICAgIHRvZ2dsZS5zZXREaXNhYmxlZCh0cnVlKTtcbiAgICAgICAgdG9nZ2xlLm9uQ2hhbmdlKCh2YWx1ZSkgPT4geyB0aGlzLnZhbHVlcy5zaGFyZUxpbmsgPSB2YWx1ZTsgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5hZGRCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnUmVnaXN0ZXIgZmlsZScpO1xuICAgICAgICBidXR0b24uc2V0Q3RhKCk7XG4gICAgICAgIGJ1dHRvbi5vbkNsaWNrKCgpID0+IHsgdm9pZCB0aGlzLnN1Ym1pdCgpOyB9KTtcbiAgICAgIH0pXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ0NhbmNlbCcpO1xuICAgICAgICBidXR0b24ub25DbGljaygoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNldEZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcsIHVwZGF0ZVRpdGxlID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZpb3VzRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMudmFsdWVzLmZpbGVQYXRoIHx8ICcnKTtcbiAgICB0aGlzLnZhbHVlcy5maWxlUGF0aCA9IGZpbGVQYXRoO1xuICAgIGlmICh0aGlzLmZpbGVTdGF0dXNFbCkge1xuICAgICAgdGhpcy5maWxlU3RhdHVzRWwuc2V0VGV4dChmaWxlUGF0aCA/IGBTZWxlY3RlZCBzb3VyY2UgZmlsZTogJHtmaWxlUGF0aH1gIDogJ05vIGZpbGUgc2VsZWN0ZWQgeWV0LicpO1xuICAgIH1cblxuICAgIGlmIChmaWxlUGF0aCAmJiAodGhpcy51cGxvYWRGaWxlbmFtZVdhc0F1dG8gfHwgIXRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lIHx8IHRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lID09PSBwcmV2aW91c0ZpbGVOYW1lKSkge1xuICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMudXBsb2FkRmlsZW5hbWVXYXNBdXRvID0gdHJ1ZTtcbiAgICAgIHRoaXMudXBsb2FkRmlsZW5hbWVJbnB1dD8uc2V0VmFsdWUodGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUpO1xuICAgIH1cblxuICAgIGlmIChmaWxlUGF0aCAmJiB1cGRhdGVUaXRsZSAmJiAodGhpcy50aXRsZVdhc0F1dG8gfHwgIXRoaXMudmFsdWVzLnRpdGxlKSkge1xuICAgICAgY29uc3QgZ2VuZXJhdGVkID0gZGVmYXVsdFRpdGxlRm9yRmlsZShmaWxlUGF0aCk7XG4gICAgICB0aGlzLnZhbHVlcy50aXRsZSA9IGdlbmVyYXRlZDtcbiAgICAgIHRoaXMudGl0bGVXYXNBdXRvID0gdHJ1ZTtcbiAgICAgIHRoaXMudGl0bGVJbnB1dD8uc2V0VmFsdWUoZ2VuZXJhdGVkKTtcbiAgICB9XG4gICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd1Bhc3RlUGF0aEZpZWxkKCk6IHZvaWQge1xuICAgIHRoaXMucGFzdGVQYXRoU2V0dGluZz8uc2V0dGluZ0VsLnJlbW92ZUNsYXNzKCdmaWxlLWV4dGVybmFsaXplci1oaWRkZW4nKTtcbiAgfVxuXG4gIHByaXZhdGUgb3BlbkZvbGRlclBpY2tlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ0NvbmZpZ3VyZSBGaWxlIEV4dGVybmFsaXplciByZW1vdGUgcm9vdCBpbiBwbHVnaW4gc2V0dGluZ3MgZmlyc3QuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5ldyBGb2xkZXJQaWNrZXJNb2RhbCh0aGlzLmFwcCwgdGhpcy5zZXJ2aWNlLCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QsIHRoaXMudmFsdWVzLmRlc3RpbmF0aW9uRm9sZGVyLCAoZm9sZGVyUGF0aCkgPT4ge1xuICAgICAgdGhpcy52YWx1ZXMuZGVzdGluYXRpb25Gb2xkZXIgPSBmb2xkZXJQYXRoO1xuICAgICAgdGhpcy51cGRhdGVEZXN0aW5hdGlvblByZXZpZXcoKTtcbiAgICAgIHRoaXMuaGlkZUVycm9yKCk7XG4gICAgfSkub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVEZXN0aW5hdGlvblByZXZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbkVsPy5zZXRUZXh0KGBEZXN0aW5hdGlvbjogJHt0aGlzLnZhbHVlcy5kZXN0aW5hdGlvbkZvbGRlcn1gKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd0Vycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5lcnJvckVsKSByZXR1cm47XG4gICAgdGhpcy5lcnJvckVsLnNldFRleHQobWVzc2FnZSk7XG4gICAgdGhpcy5lcnJvckVsLnNob3coKTtcbiAgfVxuXG4gIHByaXZhdGUgaGlkZUVycm9yKCk6IHZvaWQge1xuICAgIHRoaXMuZXJyb3JFbD8uaGlkZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzdWJtaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnZhbHVlcy5maWxlUGF0aCkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ0Nob29zZSBhIGZpbGUgZmlyc3QuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy52YWx1ZXMudGl0bGUpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKCdBZGQgYSBub3RlIHRpdGxlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSBub3JtYWxpemVVcGxvYWRGaWxlbmFtZSh0aGlzLnZhbHVlcy51cGxvYWRGaWxlbmFtZSwgdGhpcy52YWx1ZXMuZmlsZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVwbG9hZEZpbGVuYW1lSW5wdXQ/LnNldFZhbHVlKHRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lKTtcbiAgICB0aGlzLnZhbHVlcy5kb2N1bWVudFR5cGUgPSBub3JtYWxpemVEb2N1bWVudFR5cGUodGhpcy52YWx1ZXMuZG9jdW1lbnRUeXBlLCB0aGlzLnNldHRpbmdzLmRvY3VtZW50VHlwZXMpO1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290KSB7XG4gICAgICB0aGlzLnNob3dFcnJvcignQ29uZmlndXJlIEZpbGUgRXh0ZXJuYWxpemVyIHJlbW90ZSByb290IGluIHBsdWdpbiBzZXR0aW5ncyBmaXJzdC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ1VwbG9hZGluZyBleHRlcm5hbCBmaWxlLi4uJywgMCk7XG4gICAgYXdhaXQgc2xlZXAoNzUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2VydmljZS5yZWdpc3RlckZpbGUodGhpcy52YWx1ZXMpO1xuICAgICAgcHJvZ3Jlc3MuaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShgQ3JlYXRlZCAke3Jlc3VsdC5saW5rfWApO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLm9wZW5DcmVhdGVkTm90ZShyZXN1bHQubm90ZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBwcm9ncmVzcy5oaWRlKCk7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhpcy5zaG93RXJyb3IobWVzc2FnZSk7XG4gICAgICBuZXcgTm90aWNlKCdSZWdpc3RlciBGaWxlIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignUmVnaXN0ZXIgRmlsZSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlUGF0aEZyb21JbnB1dEZpbGUoZmlsZTogRmlsZSB8IG51bGwpOiBzdHJpbmcge1xuICByZXR1cm4gZmlsZSAmJiAoJ3BhdGgnIGluIGZpbGUgfHwgJ3dlYmtpdFJlbGF0aXZlUGF0aCcgaW4gZmlsZSlcbiAgICA/IFN0cmluZygoZmlsZSBhcyBGaWxlICYgeyBwYXRoPzogc3RyaW5nIH0pLnBhdGggfHwgZmlsZS53ZWJraXRSZWxhdGl2ZVBhdGggfHwgJycpXG4gICAgOiAnJztcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hvb3NlV2l0aEVsZWN0cm9uRGlhbG9nKCk6IFByb21pc2U8TmF0aXZlRmlsZVJlc3VsdD4ge1xuICBjb25zdCBkaWFsb2cgPSBnZXRFbGVjdHJvbkRpYWxvZygpO1xuICBpZiAoIWRpYWxvZyB8fCB0eXBlb2YgZGlhbG9nLnNob3dPcGVuRGlhbG9nICE9PSAnZnVuY3Rpb24nKSByZXR1cm4ge307XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtcbiAgICB0aXRsZTogJ0Nob29zZSBleHRlcm5hbCBmaWxlJyxcbiAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ10sXG4gIH0pO1xuXG4gIGlmICghcmVzdWx0IHx8IHJlc3VsdC5jYW5jZWxlZCkgcmV0dXJuIHsgY2FuY2VsZWQ6IHRydWUgfTtcbiAgaWYgKCFyZXN1bHQuZmlsZVBhdGhzIHx8ICFyZXN1bHQuZmlsZVBhdGhzLmxlbmd0aCkgcmV0dXJuIHsgcGF0aDogJycgfTtcbiAgcmV0dXJuIHsgcGF0aDogcmVzdWx0LmZpbGVQYXRoc1swXSB9O1xufVxuXG5mdW5jdGlvbiBnZXRFbGVjdHJvbkRpYWxvZygpOiB7IHNob3dPcGVuRGlhbG9nPzogKG9wdGlvbnM6IHVua25vd24pID0+IFByb21pc2U8eyBjYW5jZWxlZD86IGJvb2xlYW47IGZpbGVQYXRocz86IHN0cmluZ1tdIH0+IH0gfCBudWxsIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJykgYXMge1xuICAgICAgZGlhbG9nPzogdW5rbm93bjtcbiAgICAgIHJlbW90ZT86IHsgZGlhbG9nPzogdW5rbm93biB9O1xuICAgIH07XG4gICAgcmV0dXJuIChlbGVjdHJvbi5yZW1vdGU/LmRpYWxvZyB8fCBlbGVjdHJvbi5kaWFsb2cgfHwgbnVsbCkgYXMgeyBzaG93T3BlbkRpYWxvZz86IChvcHRpb25zOiB1bmtub3duKSA9PiBQcm9taXNlPHsgY2FuY2VsZWQ/OiBib29sZWFuOyBmaWxlUGF0aHM/OiBzdHJpbmdbXSB9PiB9IHwgbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBqb2luUmVtb3RlUGF0aCwgbm9ybWFsaXplUmVtb3RlRm9sZGVyLCBwYXJlbnRSZW1vdGVQYXRoLCBwYXRoTmFtZSwgaXNSZW1vdGVSb290LCBkZXNjZW5kYW50T3JTYW1lIH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcbmltcG9ydCB7IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlybVRleHRNb2RhbCwgTmV3Rm9sZGVyTW9kYWwsIFJlbmFtZUZvbGRlck1vZGFsIH0gZnJvbSAnLi9zaW1wbGVNb2RhbHMnO1xuXG5leHBvcnQgY2xhc3MgRm9sZGVyUGlja2VyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBmb2xkZXJDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBsb2FkaW5nID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgZXJyb3JFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwYXRoRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VsZWN0ZWRQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgdHJlZUVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VydmljZTogRmlsZUV4dGVybmFsaXplclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSByZW1vdGVSb290OiBzdHJpbmcsXG4gICAgaW5pdGlhbFBhdGg6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hvb3NlOiAoZm9sZGVyUGF0aDogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuc2VsZWN0ZWRQYXRoID0gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGluaXRpYWxQYXRoLCByZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZGVkLmFkZChyZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy5tb2RhbEVsLmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1tb2RhbC1mcmFtZScpO1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQ2hvb3NlIERlc3RpbmF0aW9uIEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1oZWxwJyxcbiAgICAgIHRleHQ6ICdTZWxlY3QgYSBmb2xkZXIgaW4gdGhlIHRyZWUuIEZvbGRlciBsaXN0cyBhcmUgY2FjaGVkIHdoaWxlIHRoaXMgcGlja2VyIGlzIG9wZW4sIGFuZCBuZWFyYnkgZm9sZGVycyBwcmVsb2FkIGluIHRoZSBiYWNrZ3JvdW5kLicsXG4gICAgfSk7XG5cbiAgICB0aGlzLnBhdGhFbCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWN1cnJlbnQtcGF0aCcgfSk7XG4gICAgdGhpcy5lcnJvckVsID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItZXJyb3InIH0pO1xuICAgIHRoaXMuZXJyb3JFbC5oaWRlKCk7XG5cbiAgICBjb25zdCB0b29sYmFyID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdG9vbGJhcicgfSk7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24odG9vbGJhciwgJ1VzZSBzZWxlY3RlZCBmb2xkZXInLCAnbW9kLWN0YScsICgpID0+IHRoaXMuY2hvb3NlKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdOZXcgZm9sZGVyJywgJycsICgpID0+IHRoaXMuY3JlYXRlRm9sZGVyU2VsZWN0ZWQoKSk7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24odG9vbGJhciwgJ1JlbmFtZSBzZWxlY3RlZCcsICcnLCAoKSA9PiB0aGlzLnJlbmFtZVNlbGVjdGVkKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdEZWxldGUgc2VsZWN0ZWQnLCAnbW9kLXdhcm5pbmcnLCAoKSA9PiB0aGlzLmRlbGV0ZVNlbGVjdGVkKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdSZWZyZXNoJywgJycsICgpID0+IHRoaXMucmVmcmVzaFNlbGVjdGVkKCkpO1xuXG4gICAgdGhpcy50cmVlRWwgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1mb2xkZXItdHJlZScgfSk7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgdm9pZCB0aGlzLmVuc3VyZUxvYWRlZCh0aGlzLnJlbW90ZVJvb3QsIHRydWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaG9vc2UoKTogdm9pZCB7XG4gICAgdGhpcy5vbkNob29zZSh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCdXR0b24ocGFyZW50OiBIVE1MRWxlbWVudCwgdGV4dDogc3RyaW5nLCBjbHM6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCk6IEhUTUxCdXR0b25FbGVtZW50IHtcbiAgICBjb25zdCBidXR0b24gPSBwYXJlbnQuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dCB9KTtcbiAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgIGlmIChjbHMpIGJ1dHRvbi5hZGRDbGFzcyhjbHMpO1xuICAgIGJ1dHRvbi5vbmNsaWNrID0gb25DbGljaztcbiAgICByZXR1cm4gYnV0dG9uO1xuICB9XG5cbiAgcHJpdmF0ZSBleHBhbmRBbmNlc3RvcnMoZm9sZGVyUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGN1cnJlbnQgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSB0aGlzLnJlbW90ZVJvb3QpIHtcbiAgICAgIHRoaXMuZXhwYW5kZWQuYWRkKHBhcmVudFJlbW90ZVBhdGgoY3VycmVudCwgdGhpcy5yZW1vdGVSb290KSk7XG4gICAgICBjdXJyZW50ID0gcGFyZW50UmVtb3RlUGF0aChjdXJyZW50LCB0aGlzLnJlbW90ZVJvb3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudHJlZUVsIHx8ICF0aGlzLnBhdGhFbCkgcmV0dXJuO1xuICAgIHRoaXMucGF0aEVsLnNldFRleHQoYFNlbGVjdGVkIGZvbGRlcjogJHt0aGlzLnNlbGVjdGVkUGF0aH1gKTtcbiAgICB0aGlzLnRyZWVFbC5lbXB0eSgpO1xuICAgIHRoaXMucmVuZGVyTm9kZSh0aGlzLnJlbW90ZVJvb3QsIDApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJOb2RlKGZvbGRlclBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy50cmVlRWwpIHJldHVybjtcbiAgICBjb25zdCByb3cgPSB0aGlzLnRyZWVFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLXJvdycgfSk7XG4gICAgaWYgKGZvbGRlclBhdGggPT09IHRoaXMuc2VsZWN0ZWRQYXRoKSByb3cuYWRkQ2xhc3MoJ2lzLXNlbGVjdGVkJyk7XG4gICAgcm93LnN0eWxlLnNldFByb3BlcnR5KCctLWRlcHRoJywgU3RyaW5nKGRlcHRoKSk7XG5cbiAgICBjb25zdCB0b2dnbGUgPSByb3cuY3JlYXRlRWwoJ2J1dHRvbicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdHJlZS10b2dnbGUnIH0pO1xuICAgIHRvZ2dsZS50eXBlID0gJ2J1dHRvbic7XG4gICAgY29uc3QgbG9hZGVkQ2hpbGRyZW4gPSB0aGlzLmZvbGRlckNhY2hlLmdldChmb2xkZXJQYXRoKTtcbiAgICBjb25zdCBoYXNMb2FkZWRDaGlsZHJlbiA9IEFycmF5LmlzQXJyYXkobG9hZGVkQ2hpbGRyZW4pICYmIGxvYWRlZENoaWxkcmVuLmxlbmd0aCA+IDA7XG4gICAgdG9nZ2xlLnNldFRleHQodGhpcy5leHBhbmRlZC5oYXMoZm9sZGVyUGF0aCkgPyAnXHUyNUJFJyA6ICdcdTI1QjgnKTtcbiAgICB0b2dnbGUub25jbGljayA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB2b2lkIHRoaXMudG9nZ2xlRm9sZGVyKGZvbGRlclBhdGgpO1xuICAgIH07XG5cbiAgICBjb25zdCBuYW1lID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRyZWUtbmFtZScgfSk7XG4gICAgbmFtZS50eXBlID0gJ2J1dHRvbic7XG4gICAgbmFtZS5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogcGF0aE5hbWUoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KSB9KTtcbiAgICBuYW1lLm9uY2xpY2sgPSAoKSA9PiB0aGlzLnNlbGVjdEZvbGRlcihmb2xkZXJQYXRoKTtcbiAgICBuYW1lLm9uZGJsY2xpY2sgPSAoKSA9PiB7IHZvaWQgdGhpcy50b2dnbGVGb2xkZXIoZm9sZGVyUGF0aCk7IH07XG4gICAgcm93LmNyZWF0ZUVsKCdzcGFuJywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLXN0YXR1cycsIHRleHQ6IHRoaXMubG9hZGluZy5oYXMoZm9sZGVyUGF0aCkgPyAnTG9hZGluZy4uLicgOiAnJyB9KTtcblxuICAgIGlmICh0aGlzLmV4cGFuZGVkLmhhcyhmb2xkZXJQYXRoKSkge1xuICAgICAgaWYgKCFsb2FkZWRDaGlsZHJlbikge1xuICAgICAgICB0aGlzLnRyZWVFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLW11dGVkJywgdGV4dDogJ0xvYWRpbmcuLi4nIH0pLnN0eWxlLnNldFByb3BlcnR5KCctLWRlcHRoJywgU3RyaW5nKGRlcHRoICsgMSkpO1xuICAgICAgfSBlbHNlIGlmICghaGFzTG9hZGVkQ2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy50cmVlRWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdHJlZS1tdXRlZCcsIHRleHQ6ICdObyBzdWJmb2xkZXJzJyB9KS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1kZXB0aCcsIFN0cmluZyhkZXB0aCArIDEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgbG9hZGVkQ2hpbGRyZW4pIHRoaXMucmVuZGVyTm9kZShqb2luUmVtb3RlUGF0aChmb2xkZXJQYXRoLCBjaGlsZCksIGRlcHRoICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZWxlY3RGb2xkZXIoZm9sZGVyUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFBhdGggPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB2b2lkIHRoaXMuZW5zdXJlTG9hZGVkKHRoaXMuc2VsZWN0ZWRQYXRoLCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdG9nZ2xlRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmV4cGFuZGVkLmhhcyhmb2xkZXJQYXRoKSkge1xuICAgICAgdGhpcy5leHBhbmRlZC5kZWxldGUoZm9sZGVyUGF0aCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5leHBhbmRlZC5hZGQoZm9sZGVyUGF0aCk7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVMb2FkZWQoZm9sZGVyUGF0aCwgdHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUxvYWRlZChmb2xkZXJQYXRoOiBzdHJpbmcsIHByZWxvYWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGZvbGRlclBhdGgsIHRoaXMucmVtb3RlUm9vdCk7XG4gICAgaWYgKHRoaXMuZm9sZGVyQ2FjaGUuaGFzKG5vcm1hbGl6ZWQpIHx8IHRoaXMubG9hZGluZy5oYXMobm9ybWFsaXplZCkpIHJldHVybjtcbiAgICB0aGlzLmxvYWRpbmcuYWRkKG5vcm1hbGl6ZWQpO1xuICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGF3YWl0IHRoaXMuc2VydmljZS5wcm92aWRlci5saXN0Rm9sZGVycyhub3JtYWxpemVkKTtcbiAgICAgIHRoaXMuZm9sZGVyQ2FjaGUuc2V0KG5vcm1hbGl6ZWQsIGNoaWxkcmVuKTtcbiAgICAgIGlmIChwcmVsb2FkKSB0aGlzLnByZWxvYWRDaGlsZHJlbihub3JtYWxpemVkLCBjaGlsZHJlbik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubG9hZGluZy5kZWxldGUobm9ybWFsaXplZCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHByZWxvYWRDaGlsZHJlbihwYXJlbnRQYXRoOiBzdHJpbmcsIGNoaWxkcmVuOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4uc2xpY2UoMCwgMTIpKSB7XG4gICAgICBjb25zdCBjaGlsZFBhdGggPSBqb2luUmVtb3RlUGF0aChwYXJlbnRQYXRoLCBjaGlsZCk7XG4gICAgICBpZiAoIXRoaXMuZm9sZGVyQ2FjaGUuaGFzKGNoaWxkUGF0aCkgJiYgIXRoaXMubG9hZGluZy5oYXMoY2hpbGRQYXRoKSkge1xuICAgICAgICB2b2lkIHRoaXMuc2VydmljZS5wcm92aWRlci5saXN0Rm9sZGVycyhjaGlsZFBhdGgpLnRoZW4oKGZvbGRlcnMpID0+IHRoaXMuZm9sZGVyQ2FjaGUuc2V0KGNoaWxkUGF0aCwgZm9sZGVycykpLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWZyZXNoU2VsZWN0ZWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUodGhpcy5zZWxlY3RlZFBhdGgpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlTG9hZGVkKHRoaXMuc2VsZWN0ZWRQYXRoLCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRm9sZGVyU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgbmV3IE5ld0ZvbGRlck1vZGFsKHRoaXMuYXBwLCB0aGlzLnNlbGVjdGVkUGF0aCwgKGZvbGRlck5hbWUpID0+IHsgdm9pZCB0aGlzLnBlcmZvcm1DcmVhdGVGb2xkZXIoZm9sZGVyTmFtZSk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGVyZm9ybUNyZWF0ZUZvbGRlcihmb2xkZXJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXJlbnRQYXRoID0gdGhpcy5zZWxlY3RlZFBhdGg7XG4gICAgY29uc3QgbmV3UGF0aCA9IGpvaW5SZW1vdGVQYXRoKHBhcmVudFBhdGgsIGZvbGRlck5hbWUpO1xuICAgIGNvbnN0IG5vdGljZSA9IG5ldyBOb3RpY2UoJ0NyZWF0aW5nIHJlbW90ZSBmb2xkZXIuLi4nLCAwKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLnByb3ZpZGVyLmNyZWF0ZUZvbGRlcihwYXJlbnRQYXRoLCBmb2xkZXJOYW1lKTtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmZvbGRlckNhY2hlLmdldChwYXJlbnRQYXRoKSB8fCBbXTtcbiAgICAgIGlmICghY3VycmVudC5pbmNsdWRlcyhmb2xkZXJOYW1lKSkgdGhpcy5mb2xkZXJDYWNoZS5zZXQocGFyZW50UGF0aCwgWy4uLmN1cnJlbnQsIGZvbGRlck5hbWVdLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSkpO1xuICAgICAgdGhpcy5mb2xkZXJDYWNoZS5zZXQobmV3UGF0aCwgW10pO1xuICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSBuZXdQYXRoO1xuICAgICAgdGhpcy5leHBhbmRlZC5hZGQocGFyZW50UGF0aCk7XG4gICAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyhuZXdQYXRoKTtcbiAgICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgICAgbmV3IE5vdGljZSgnRm9sZGVyIGNyZWF0ZWQuJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICBuZXcgTm90aWNlKCdDcmVhdGUgZm9sZGVyIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignQ3JlYXRlIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuYW1lU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgaWYgKGlzUmVtb3RlUm9vdCh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ1RoZSByb290IGZvbGRlciBjYW5ub3QgYmUgcmVuYW1lZCBoZXJlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXcgUmVuYW1lRm9sZGVyTW9kYWwodGhpcy5hcHAsIHRoaXMuc2VsZWN0ZWRQYXRoLCBwYXRoTmFtZSh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSwgKG5ld05hbWUpID0+IHsgdm9pZCB0aGlzLnBlcmZvcm1SZW5hbWUobmV3TmFtZSk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGVyZm9ybVJlbmFtZShuZXdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBvbGRQYXRoID0gdGhpcy5zZWxlY3RlZFBhdGg7XG4gICAgY29uc3QgbmV3UGF0aCA9IGpvaW5SZW1vdGVQYXRoKHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KSwgbmV3TmFtZSk7XG4gICAgY29uc3Qgbm90aWNlID0gbmV3IE5vdGljZSgnUmVuYW1pbmcgZm9sZGVyIGFuZCB1cGRhdGluZyBub3Rlcy4uLicsIDApO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNlcnZpY2UucmVuYW1lRm9sZGVyKG9sZFBhdGgsIG5ld05hbWUpO1xuICAgICAgdGhpcy5yZW1hcEZvbGRlckNhY2hlKG9sZFBhdGgsIG5ld1BhdGgpO1xuICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSBuZXdQYXRoO1xuICAgICAgdGhpcy5leHBhbmRBbmNlc3RvcnMobmV3UGF0aCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ0ZvbGRlciByZW5hbWVkIGFuZCBhZmZlY3RlZCBub3RlcyB1cGRhdGVkLicpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgbmV3IE5vdGljZSgnUmVuYW1lIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignUmVuYW1lIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVsZXRlU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgaWYgKGlzUmVtb3RlUm9vdCh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ1RoZSByb290IGZvbGRlciBjYW5ub3QgYmUgZGVsZXRlZCBoZXJlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmb2xkZXJOYW1lID0gcGF0aE5hbWUodGhpcy5zZWxlY3RlZFBhdGgsIHRoaXMucmVtb3RlUm9vdCk7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBUaGlzIHdpbGwgbW92ZSAke3RoaXMuc2VsZWN0ZWRQYXRofSB0byByZW1vdGUgdHJhc2ggYW5kIHJlbW92ZSBtYXRjaGluZyBsb2NhbCBjYWNoZSBmaWxlcy4gRXhpc3RpbmcgT2JzaWRpYW4gbm90ZXMgdGhhdCByZWZlcmVuY2UgZmlsZXMgdW5kZXIgdGhpcyBmb2xkZXIgd2lsbCBiZSBtYXJrZWQgbWlzc2luZy5gO1xuICAgIG5ldyBDb25maXJtVGV4dE1vZGFsKHRoaXMuYXBwLCAnRGVsZXRlIEZvbGRlcicsIG1lc3NhZ2UsIGZvbGRlck5hbWUsICdEZWxldGUgZm9sZGVyJywgKCkgPT4geyB2b2lkIHRoaXMucGVyZm9ybURlbGV0ZSgpOyB9KS5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1EZWxldGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgb2xkUGF0aCA9IHRoaXMuc2VsZWN0ZWRQYXRoO1xuICAgIGNvbnN0IG5vdGljZSA9IG5ldyBOb3RpY2UoJ01vdmluZyBmb2xkZXIgdG8gdHJhc2guLi4nLCAwKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLnRyYXNoRm9sZGVyKG9sZFBhdGgpO1xuICAgICAgdGhpcy5yZW1vdmVGb2xkZXJGcm9tQ2FjaGUob2xkUGF0aCk7XG4gICAgICB0aGlzLnNlbGVjdGVkUGF0aCA9IHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgICAgbmV3IE5vdGljZSgnRm9sZGVyIG1vdmVkIHRvIHRyYXNoLicpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgbmV3IE5vdGljZSgnRGVsZXRlIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignRGVsZXRlIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtYXBGb2xkZXJDYWNoZShvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5mb2xkZXJDYWNoZS5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChkZXNjZW5kYW50T3JTYW1lKGtleSwgb2xkUGF0aCkpIG5leHQuc2V0KGtleS5yZXBsYWNlKG9sZFBhdGgsIG5ld1BhdGgpLCB2YWx1ZSk7XG4gICAgICBlbHNlIG5leHQuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLmZvbGRlckNhY2hlLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgbmV4dC5lbnRyaWVzKCkpIHRoaXMuZm9sZGVyQ2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIHRoaXMuZm9sZGVyQ2FjaGUuZGVsZXRlKHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KSk7XG4gICAgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUocGFyZW50UmVtb3RlUGF0aChuZXdQYXRoLCB0aGlzLnJlbW90ZVJvb3QpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRm9sZGVyRnJvbUNhY2hlKGZvbGRlclBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudFJlbW90ZVBhdGgoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICBjb25zdCBuYW1lID0gcGF0aE5hbWUoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICBjb25zdCBzaWJsaW5ncyA9IHRoaXMuZm9sZGVyQ2FjaGUuZ2V0KHBhcmVudCk7XG4gICAgaWYgKHNpYmxpbmdzKSB0aGlzLmZvbGRlckNhY2hlLnNldChwYXJlbnQsIHNpYmxpbmdzLmZpbHRlcigoZm9sZGVyKSA9PiBmb2xkZXIgIT09IG5hbWUpKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBBcnJheS5mcm9tKHRoaXMuZm9sZGVyQ2FjaGUua2V5cygpKSkge1xuICAgICAgaWYgKGRlc2NlbmRhbnRPclNhbWUoa2V5LCBmb2xkZXJQYXRoKSkgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUoa2V5KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dFcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZXJyb3JFbCkgcmV0dXJuO1xuICAgIHRoaXMuZXJyb3JFbC5zZXRUZXh0KG1lc3NhZ2UpO1xuICAgIHRoaXMuZXJyb3JFbC5zaG93KCk7XG4gIH1cblxuICBwcml2YXRlIGhpZGVFcnJvcigpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yRWw/LmhpZGUoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlybVRleHRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSB0eXBlZCA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQ29uc3RydWN0b3JQYXJhbWV0ZXJzPHR5cGVvZiBNb2RhbD5bMF0sXG4gICAgcHJpdmF0ZSByZWFkb25seSB0aXRsZVRleHQ6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGV4cGVjdGVkVGV4dDogc3RyaW5nLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uTGFiZWw6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ29uZmlybTogKCkgPT4gdm9pZCxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIHRoaXMuY29udGVudEVsLmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1tb2RhbCcpO1xuICAgIHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogdGhpcy50aXRsZVRleHQgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiB0aGlzLm1lc3NhZ2UgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiBgVHlwZSAke3RoaXMuZXhwZWN0ZWRUZXh0fSB0byBjb25maXJtLmAgfSk7XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcpO1xuICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgaW5wdXQuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLWNvbmZpcm0taW5wdXQnKTtcbiAgICBpbnB1dC5vbmlucHV0ID0gKCkgPT4geyB0aGlzLnR5cGVkID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IGNvbmZpcm0gPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6IHRoaXMuYWN0aW9uTGFiZWwgfSk7XG4gICAgY29uZmlybS50eXBlID0gJ2J1dHRvbic7XG4gICAgY29uZmlybS5hZGRDbGFzcygnbW9kLXdhcm5pbmcnKTtcbiAgICBjb25maXJtLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy50eXBlZCAhPT0gdGhpcy5leHBlY3RlZFRleHQpIHJldHVybjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMub25Db25maXJtKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNhbmNlbCA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NhbmNlbCcgfSk7XG4gICAgY2FuY2VsLnR5cGUgPSAnYnV0dG9uJztcbiAgICBjYW5jZWwub25jbGljayA9ICgpID0+IHRoaXMuY2xvc2UoKTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVGb2xkZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8dHlwZW9mIE1vZGFsPlswXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGN1cnJlbnRQYXRoOiBzdHJpbmcsXG4gICAgY3VycmVudE5hbWU6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uUmVuYW1lOiAobmV3TmFtZTogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMubmV3TmFtZSA9IGN1cnJlbnROYW1lO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnUmVuYW1lIEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiB0aGlzLmN1cnJlbnRQYXRoIH0pO1xuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnaW5wdXQnKTtcbiAgICBpbnB1dC50eXBlID0gJ3RleHQnO1xuICAgIGlucHV0LnZhbHVlID0gdGhpcy5uZXdOYW1lO1xuICAgIGlucHV0LmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1jb25maXJtLWlucHV0Jyk7XG4gICAgaW5wdXQub25pbnB1dCA9ICgpID0+IHsgdGhpcy5uZXdOYW1lID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IHJlbmFtZSA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1JlbmFtZScgfSk7XG4gICAgcmVuYW1lLnR5cGUgPSAnYnV0dG9uJztcbiAgICByZW5hbWUuYWRkQ2xhc3MoJ21vZC1jdGEnKTtcbiAgICByZW5hbWUub25jbGljayA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5uZXdOYW1lIHx8IHRoaXMubmV3TmFtZS5pbmNsdWRlcygnLycpKSByZXR1cm47XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLm9uUmVuYW1lKHRoaXMubmV3TmFtZSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNhbmNlbCA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NhbmNlbCcgfSk7XG4gICAgY2FuY2VsLnR5cGUgPSAnYnV0dG9uJztcbiAgICBjYW5jZWwub25jbGljayA9ICgpID0+IHRoaXMuY2xvc2UoKTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlucHV0LnNlbGVjdCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdGb2xkZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBmb2xkZXJOYW1lID0gJyc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8dHlwZW9mIE1vZGFsPlswXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcmVudFBhdGg6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ3JlYXRlOiAoZm9sZGVyTmFtZTogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnTmV3IEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiBgQ3JlYXRlIGEgZm9sZGVyIHVuZGVyICR7dGhpcy5wYXJlbnRQYXRofWAgfSk7XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcpO1xuICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgaW5wdXQucGxhY2Vob2xkZXIgPSAnRm9sZGVyIG5hbWUnO1xuICAgIGlucHV0LmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1jb25maXJtLWlucHV0Jyk7XG4gICAgaW5wdXQub25pbnB1dCA9ICgpID0+IHsgdGhpcy5mb2xkZXJOYW1lID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IGNyZWF0ZSA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NyZWF0ZSBmb2xkZXInIH0pO1xuICAgIGNyZWF0ZS50eXBlID0gJ2J1dHRvbic7XG4gICAgY3JlYXRlLmFkZENsYXNzKCdtb2QtY3RhJyk7XG4gICAgY3JlYXRlLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZm9sZGVyTmFtZSB8fCB0aGlzLmZvbGRlck5hbWUuaW5jbHVkZXMoJy8nKSkgcmV0dXJuO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5vbkNyZWF0ZSh0aGlzLmZvbGRlck5hbWUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjYW5jZWwgPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDYW5jZWwnIH0pO1xuICAgIGNhbmNlbC50eXBlID0gJ2J1dHRvbic7XG4gICAgY2FuY2VsLm9uY2xpY2sgPSAoKSA9PiB0aGlzLmNsb3NlKCk7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTm90aWNlLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgeyBTZXR1cFN0YXR1cyB9IGZyb20gJy4uL3Byb3ZpZGVycy9zdG9yYWdlUHJvdmlkZXInO1xuaW1wb3J0IHR5cGUgRmlsZUV4dGVybmFsaXplclBsdWdpbiBmcm9tICcuLi9tYWluJztcbmltcG9ydCB7IG5vcm1hbGl6ZVNldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MnO1xuXG5leHBvcnQgY2xhc3MgRmlsZUV4dGVybmFsaXplclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcmVhZG9ubHkgcGx1Z2luOiBGaWxlRXh0ZXJuYWxpemVyUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnRmlsZSBFeHRlcm5hbGl6ZXInIH0pO1xuXG4gICAgdGhpcy5kaXNwbGF5U2V0dXAoY29udGFpbmVyRWwpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnU3RvcmFnZScgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdSZW1vdGUgcm9vdCcpXG4gICAgICAuc2V0RGVzYygnVG9wLWxldmVsIGV4dGVybmFsIHN0b3JhZ2UgZm9sZGVyIHVzZWQgYnkgdGhlIGZvbGRlciBwaWNrZXIuJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignL3JlbW90ZS9wYXRoL3RvL2ZpbGVzJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbW90ZVJvb3QpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5yZW1vdGVSb290ID0gdmFsdWUudHJpbSgpLnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnRXh0ZXJuYWwgbm90ZXMgZm9sZGVyJylcbiAgICAgIC5zZXREZXNjKCdWYXVsdCBmb2xkZXIgd2hlcmUgZXh0ZXJuYWwtZmlsZSBub3RlcyBhcmUgY3JlYXRlZC4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdFeHRlcm5hbCBGaWxlcycpXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5leHRlcm5hbE5vdGVzRm9sZGVyKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZXh0ZXJuYWxOb3Rlc0ZvbGRlciA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQ2FjaGUgZm9sZGVyJylcbiAgICAgIC5zZXREZXNjKCdWYXVsdC1sb2NhbCBjYWNoZSBmb2xkZXIgZm9yIGRvd25sb2FkZWQvb3BlbmVkIGV4dGVybmFsIGZpbGVzLicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4gdGV4dFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ0ZpbGUgRXh0ZXJuYWxpemVyIENhY2hlJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNhY2hlRm9sZGVyKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY2FjaGVGb2xkZXIgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0RvY3VtZW50IHR5cGVzJylcbiAgICAgIC5zZXREZXNjKCdDb21tYS1zZXBhcmF0ZWQgbm90ZSBmaWxpbmcgY2F0ZWdvcmllcy4gSW5jbHVkZSBPdGhlciBhcyBhIGNhdGNoLWFsbC4nKVxuICAgICAgLmFkZFRleHRBcmVhKCh0ZXh0KSA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignRG9jdW1lbnRzLCBJbWFnZXMsIE1lZGlhLCBBcmNoaXZlcywgT3RoZXInKVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZG9jdW1lbnRUeXBlcy5qb2luKCcsICcpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZG9jdW1lbnRUeXBlcyA9IHNwbGl0TGlzdCh2YWx1ZSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XG4gICAgICAgIH0pKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0NvbnRleHQgdHlwZXMnKVxuICAgICAgLnNldERlc2MoJ0NvbW1hLXNlcGFyYXRlZCBmaXJzdC1sZXZlbCByZW1vdGUgZm9sZGVyIG5hbWVzIHVzZWQgZm9yIGNvbnRleHQgbWV0YWRhdGEuJylcbiAgICAgIC5hZGRUZXh0QXJlYSgodGV4dCkgPT4gdGV4dFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ1Byb2plY3RzLCBBcmVhcywgUGVvcGxlLCBPcmdhbml6YXRpb25zLCBHZW5lcmFsJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbnRleHRUeXBlcy5qb2luKCcsICcpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY29udGV4dFR5cGVzID0gc3BsaXRMaXN0KHZhbHVlKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNwbGF5U2V0dXAoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnU2V0dXAgb24gdGhpcyBjb21wdXRlcicgfSk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1oZWxwJyxcbiAgICAgIHRleHQ6ICdFYWNoIHBlcnNvbiBzaWducyBpbiB0byBQcm90b24gb24gdGhlaXIgb3duIGNvbXB1dGVyLiBOb3RoaW5nIHNlY3JldCBpcyBzdG9yZWQgaW4gdGhlIHZhdWx0LicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdGF0dXNFbCA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXNldHVwLXN0YXR1cycgfSk7XG4gICAgY29uc3QgbG9naW5MaW5rRWwgPSBjb250YWluZXJFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1oZWxwJyB9KTtcbiAgICBsb2dpbkxpbmtFbC5oaWRlKCk7XG5cbiAgICBjb25zdCByZWZyZXNoID0gYXN5bmMgKCkgPT4ge1xuICAgICAgc3RhdHVzRWwuZW1wdHkoKTtcbiAgICAgIHN0YXR1c0VsLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6ICdDaGVja2luZy4uLicgfSk7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5wbHVnaW4uZ2V0U2VydmljZSgpO1xuICAgICAgaWYgKCFzZXJ2aWNlKSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICByZW5kZXJTdGF0dXMoc3RhdHVzRWwsIGF3YWl0IHNlcnZpY2UuY2hlY2tTZXR1cCgpKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHN0YXR1c0VsLmVtcHR5KCk7XG4gICAgICAgIHN0YXR1c0VsLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IGBDaGVjayBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1N0YXR1cycpXG4gICAgICAuc2V0RGVzYygnQ2hlY2tzIHRoZSBQcm90b24gRHJpdmUgQ0xJLCB5b3VyIHNpZ24taW4sIGFuZCBhY2Nlc3MgdG8gdGhlIHJlbW90ZSByb290LicpXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+IGJ1dHRvblxuICAgICAgICAuc2V0QnV0dG9uVGV4dCgnQ2hlY2sgYWdhaW4nKVxuICAgICAgICAub25DbGljaygoKSA9PiB7IHZvaWQgcmVmcmVzaCgpOyB9KSlcbiAgICAgIC5hZGRCdXR0b24oKGJ1dHRvbikgPT4gYnV0dG9uXG4gICAgICAgIC5zZXRCdXR0b25UZXh0KCdMb2cgaW4gdG8gUHJvdG9uJylcbiAgICAgICAgLnNldEN0YSgpXG4gICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5wbHVnaW4uZ2V0U2VydmljZSgpO1xuICAgICAgICAgIGlmICghc2VydmljZSkgcmV0dXJuO1xuICAgICAgICAgIGJ1dHRvbi5zZXREaXNhYmxlZCh0cnVlKTtcbiAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ0ZpbmlzaCBzaWduaW5nIGluIHRvIFByb3RvbiBpbiB5b3VyIGJyb3dzZXIuLi4nLCAwKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc2VydmljZS5sb2dpbigodXJsKSA9PiB7XG4gICAgICAgICAgICAgIGxvZ2luTGlua0VsLmVtcHR5KCk7XG4gICAgICAgICAgICAgIGxvZ2luTGlua0VsLmFwcGVuZFRleHQoXCJJZiB5b3VyIGJyb3dzZXIgZGlkbid0IG9wZW4sIFwiKTtcbiAgICAgICAgICAgICAgbG9naW5MaW5rRWwuY3JlYXRlRWwoJ2EnLCB7IGhyZWY6IHVybCwgdGV4dDogJ29wZW4gdGhlIFByb3RvbiBzaWduLWluIHBhZ2UnIH0pO1xuICAgICAgICAgICAgICBsb2dpbkxpbmtFbC5hcHBlbmRUZXh0KCcuJyk7XG4gICAgICAgICAgICAgIGxvZ2luTGlua0VsLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbmV3IE5vdGljZSgnU2lnbmVkIGluIHRvIFByb3Rvbi4nKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbmV3IE5vdGljZShgUHJvdG9uIHNpZ24taW4gZGlkIG5vdCBmaW5pc2g6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAsIDEwMDAwKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgcHJvZ3Jlc3MuaGlkZSgpO1xuICAgICAgICAgICAgbG9naW5MaW5rRWwuaGlkZSgpO1xuICAgICAgICAgICAgYnV0dG9uLnNldERpc2FibGVkKGZhbHNlKTtcbiAgICAgICAgICAgIHZvaWQgcmVmcmVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnUHJvdG9uIERyaXZlIENMSSBwYXRoJylcbiAgICAgIC5zZXREZXNjKCdMZWF2ZSBlbXB0eSB0byBmaW5kIHByb3Rvbi1kcml2ZSBhdXRvbWF0aWNhbGx5IChQQVRILCB+Ly5sb2NhbC9iaW4sIEhvbWVicmV3KS4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdBdXRvLWRldGVjdCcpXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5wcm90b25DbGlQYXRoKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9uQ2xpUGF0aCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuXG4gICAgdm9pZCByZWZyZXNoKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MgPSBub3JtYWxpemVTZXR0aW5ncyh0aGlzLnBsdWdpbi5zZXR0aW5ncyk7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyU3RhdHVzKGVsOiBIVE1MRWxlbWVudCwgc3RhdHVzOiBTZXR1cFN0YXR1cyk6IHZvaWQge1xuICBlbC5lbXB0eSgpO1xuICBmb3IgKGNvbnN0IGNoZWNrIG9mIHN0YXR1cy5jaGVja3MpIHtcbiAgICBjb25zdCByb3cgPSBlbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6IGBmaWxlLWV4dGVybmFsaXplci1zZXR1cC1jaGVjayAke2NoZWNrLm9rID8gJ2lzLW9rJyA6ICdpcy1mYWlsZWQnfWAgfSk7XG4gICAgcm93LmNyZWF0ZUVsKCdzcGFuJywgeyB0ZXh0OiBjaGVjay5vayA/ICdcdTI3MTMgJyA6ICdcdTI3MTcgJyB9KTtcbiAgICByb3cuY3JlYXRlRWwoJ3N0cm9uZycsIHsgdGV4dDogYCR7Y2hlY2subGFiZWx9OiBgIH0pO1xuICAgIHJvdy5hcHBlbmRUZXh0KGNoZWNrLmRldGFpbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXRMaXN0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgnLCcpLm1hcCgoaXRlbSkgPT4gaXRlbS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcbn1cbiJdLAogICJtYXBwaW5n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QUM7QUFDbEUsVUFBTUEsT0FBTSxFQUFFO0FBQ2QsUUFBSTtBQUNGLFlBQU0sU0FBUyxNQUFNLEtBQUssUUFBUSwwQkFBMEI7QUFDNUQsZUFBUyxLQUFLO0FBQ2QsVUFBSSx3QkFBTyxzQ0FBc0MsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLGFBQWEsT0FBTyxPQUFPLGlCQUFpQixPQUFPLFNBQVMsS0FBSyxPQUFPLE1BQU0sb0JBQW9CLEVBQUUsR0FBRztBQUFBLElBQy9MLFNBQVMsT0FBTztBQUNkLGVBQVMsS0FBSztBQUNkLFVBQUksd0JBQU8sNkRBQTZEO0FBQ3hFLGNBQVEsTUFBTSx3Q0FBd0MsS0FBSztBQUFBLElBQzdEO0FBQUEsRUFDRjtBQUNGO0FBRUEsU0FBU0EsT0FBTSxJQUEyQjtBQUN4QyxTQUFPLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUN6RDsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9ub2RlX3BhdGgiLCAicGF0aCIsICJwYXRoIiwgImltcG9ydF9ub2RlX2ZzIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiaW1wb3J0X25vZGVfY2hpbGRfcHJvY2VzcyIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImltcG9ydF9ub2RlX3BhdGgiLCAicGF0aCIsICJwYXRoIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiZXhlY0ZpbGVDYWxsYmFjayIsICJwYXRoIiwgImZzIiwgIm9zIiwgImltcG9ydF9ub2RlX2ZzIiwgImltcG9ydF9ub2RlX3BhdGgiLCAicGF0aCIsICJmcyIsICJwYXRoIiwgImZzIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfbm9kZV9wYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJwYXRoIiwgImltcG9ydF9vYnNpZGlhbiIsICJzbGVlcCJdCn0K
