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
  provider: "proton-drive-cli",
  remoteRoot: ""
};
function normalizeSettings(input) {
  return {
    cacheFolder: nonEmpty(input?.cacheFolder, DEFAULT_SETTINGS.cacheFolder),
    contextTypes: nonEmptyList(input?.contextTypes, DEFAULT_SETTINGS.contextTypes),
    documentTypes: ensureOther(nonEmptyList(input?.documentTypes, DEFAULT_SETTINGS.documentTypes)),
    externalNotesFolder: nonEmpty(input?.externalNotesFolder, DEFAULT_SETTINGS.externalNotesFolder),
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
  return String(text || "").split(oldPath).join(newPath);
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
  const match = String(text || "").match(/^---\n([\s\S]*?)\n---/);
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
  const match = source.match(/^---\n([\s\S]*?)\n---/);
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
  return source.replace(/^---\n[\s\S]*?\n---/, `---
${lines.join("\n")}
---`);
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
var ProtonDriveCliProvider = class {
  cliPath;
  constructor(cliPath = findProtonDriveCli()) {
    this.cliPath = cliPath;
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
      const result = await execFile(this.cliPath, args, { encoding: "utf8" });
      return result.stdout || "";
    } catch (error) {
      throw decorateCliError(this.cliPath, args, error);
    }
  }
};
function findProtonDriveCli() {
  const candidates = [
    process.env.PROTON_DRIVE_CLI,
    "proton-drive",
    import_node_path5.default.join(import_node_os.default.homedir(), ".local/bin/proton-drive"),
    "/opt/homebrew/bin/proton-drive",
    "/usr/local/bin/proton-drive"
  ].filter(Boolean);
  for (const candidate of candidates) {
    const probe = (0, import_node_child_process.spawnSync)(candidate, ["--help"], { encoding: "utf8" });
    if (probe.status === 0) return candidate;
  }
  throw new Error("Could not find proton-drive CLI. Install it or set PROTON_DRIVE_CLI.");
}
function isMissingRemotePathError(error) {
  const err = error;
  const message = `${err?.message || ""}
${err?.stderr || ""}
${err?.stdout || ""}`.toLowerCase();
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
    this.provider = provider || new ProtonDriveCliProvider();
  }
  provider;
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
      const updated = fm.type === "external-file" ? updateExternalFileTextForFolderRename(text, oldPath, newPath, today, this.settings.remoteRoot, this.settings.contextTypes) : text.split(oldPath).join(newPath);
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
  async save() {
    this.plugin.settings = normalizeSettings(this.plugin.settings);
    await this.plugin.saveSettings();
  }
};
function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

// src/main.ts
var FileExternalizerPlugin = class extends import_obsidian5.Plugin {
  settings = DEFAULT_SETTINGS;
  service = null;
  async onload() {
    await this.loadSettings();
    this.service = new FileExternalizerService(this.app, this.settings);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL3BsYXRmb3JtL29ic2lkaWFuVmF1bHQudHMiLCAic3JjL2RvbWFpbi9wYXRocy50cyIsICJzcmMvc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UudHMiLCAic3JjL2RvbWFpbi9kb2N1bWVudFR5cGUudHMiLCAic3JjL2RvbWFpbi9leHRlcm5hbEZpbGVOb3RlLnRzIiwgInNyYy9kb21haW4vZnJvbnRtYXR0ZXIudHMiLCAic3JjL2RvbWFpbi9maWxlbmFtZS50cyIsICJzcmMvcHJvdmlkZXJzL3Byb3RvbkRyaXZlQ2xpUHJvdmlkZXIudHMiLCAic3JjL3NlcnZpY2VzL2NhY2hlU2VydmljZS50cyIsICJzcmMvdWkvcmVnaXN0ZXJGaWxlTW9kYWwudHMiLCAic3JjL3VpL2ZvbGRlclBpY2tlck1vZGFsLnRzIiwgInNyYy91aS9zaW1wbGVNb2RhbHMudHMiLCAic3JjL3VpL3NldHRpbmdzVGFiLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBOb3RpY2UsIFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncywgbm9ybWFsaXplU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IGZpbmRFeHRlcm5hbEZpbGVOb3RlIH0gZnJvbSAnLi9wbGF0Zm9ybS9vYnNpZGlhblZhdWx0JztcbmltcG9ydCB7IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9maWxlRXh0ZXJuYWxpemVyU2VydmljZSc7XG5pbXBvcnQgeyBSZWdpc3RlckZpbGVNb2RhbCB9IGZyb20gJy4vdWkvcmVnaXN0ZXJGaWxlTW9kYWwnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNldHRpbmdUYWIgfSBmcm9tICcuL3VpL3NldHRpbmdzVGFiJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZUV4dGVybmFsaXplclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBGaWxlRXh0ZXJuYWxpemVyU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBwcml2YXRlIHNlcnZpY2U6IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIHwgbnVsbCA9IG51bGw7XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG4gICAgdGhpcy5zZXJ2aWNlID0gbmV3IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzKTtcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdyZWdpc3Rlci1maWxlJyxcbiAgICAgIG5hbWU6ICdSZWdpc3RlciBGaWxlJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zZXJ2aWNlKSByZXR1cm47XG4gICAgICAgIG5ldyBSZWdpc3RlckZpbGVNb2RhbCh0aGlzLmFwcCwgdGhpcy5zZXJ2aWNlLCB0aGlzLnNldHRpbmdzKS5vcGVuKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnb3Blbi1leHRlcm5hbC1maWxlJyxcbiAgICAgIG5hbWU6ICdPcGVuIEV4dGVybmFsIEZpbGUnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHsgdm9pZCB0aGlzLm9wZW5FeHRlcm5hbEZpbGVDb21tYW5kKCk7IH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd2YWxpZGF0ZS1leHRlcm5hbC1maWxlLW5vdGVzJyxcbiAgICAgIG5hbWU6ICdWYWxpZGF0ZSBFeHRlcm5hbCBGaWxlIE5vdGVzJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7IHZvaWQgdGhpcy52YWxpZGF0ZUV4dGVybmFsRmlsZU5vdGVzQ29tbWFuZCgpOyB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBub3JtYWxpemVTZXR0aW5ncyh7IC4uLkRFRkFVTFRfU0VUVElOR1MsIC4uLmF3YWl0IHRoaXMubG9hZERhdGEoKSBhcyBQYXJ0aWFsPEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncz4gfSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb3BlbkV4dGVybmFsRmlsZUNvbW1hbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICBjb25zdCBub3RlRmlsZSA9IGZpbmRFeHRlcm5hbEZpbGVOb3RlKHRoaXMuYXBwKTtcbiAgICBpZiAoIW5vdGVGaWxlKSB7XG4gICAgICBuZXcgTm90aWNlKCdPcGVuIGFuIGV4dGVybmFsLWZpbGUgbm90ZSBmaXJzdC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ09wZW5pbmcgZXh0ZXJuYWwgZmlsZS4uLicsIDApO1xuICAgIGF3YWl0IHNsZWVwKDc1KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zZXJ2aWNlLm9wZW5FeHRlcm5hbEZpbGUobm90ZUZpbGUpO1xuICAgICAgcHJvZ3Jlc3MuaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShyZXN1bHQuY2FjaGVIaXQgPyAnT3BlbmVkIGNhY2hlZCBleHRlcm5hbCBmaWxlLicgOiAnRG93bmxvYWRlZCBhbmQgb3BlbmVkIGV4dGVybmFsIGZpbGUuJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ09wZW4gRXh0ZXJuYWwgRmlsZSBmYWlsZWQuIFNlZSBkZXZlbG9wZXIgY29uc29sZS4nKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ09wZW4gRXh0ZXJuYWwgRmlsZSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdmFsaWRhdGVFeHRlcm5hbEZpbGVOb3Rlc0NvbW1hbmQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2UpIHJldHVybjtcbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ1ZhbGlkYXRpbmcgZXh0ZXJuYWwtZmlsZSBub3Rlcy4uLicsIDApO1xuICAgIGF3YWl0IHNsZWVwKDc1KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zZXJ2aWNlLnZhbGlkYXRlRXh0ZXJuYWxGaWxlTm90ZXMoKTtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoYEV4dGVybmFsLWZpbGUgdmFsaWRhdGlvbiBjb21wbGV0ZTogJHtyZXN1bHQuZm91bmR9IGZvdW5kLCAke3Jlc3VsdC5taXNzaW5nfSBtaXNzaW5nLCAke3Jlc3VsdC5jaGFuZ2VkfSBub3RlcyB1cGRhdGVkJHtyZXN1bHQuZXJyb3JzID8gYCwgJHtyZXN1bHQuZXJyb3JzfSBlcnJvcnMgc2tpcHBlZGAgOiAnJ30uYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHByb2dyZXNzLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ1ZhbGlkYXRlIEV4dGVybmFsIEZpbGUgTm90ZXMgZmFpbGVkLiBTZWUgZGV2ZWxvcGVyIGNvbnNvbGUuJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdWYWxpZGF0ZSBFeHRlcm5hbCBGaWxlIE5vdGVzIGZhaWxlZDonLCBlcnJvcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG4iLCAiZXhwb3J0IGNvbnN0IFBMVUdJTl9JRCA9ICdmaWxlLWV4dGVybmFsaXplcic7XG5leHBvcnQgY29uc3QgQ09NTUFORF9SRUdJU1RFUl9GSUxFID0gYCR7UExVR0lOX0lEfTpyZWdpc3Rlci1maWxlYDtcbmV4cG9ydCBjb25zdCBDT01NQU5EX09QRU5fRVhURVJOQUxfRklMRSA9IGAke1BMVUdJTl9JRH06b3Blbi1leHRlcm5hbC1maWxlYDtcbmV4cG9ydCBjb25zdCBDT01NQU5EX1ZBTElEQVRFX0VYVEVSTkFMX0ZJTEVfTk9URVMgPSBgJHtQTFVHSU5fSUR9OnZhbGlkYXRlLWV4dGVybmFsLWZpbGUtbm90ZXNgO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9ET0NVTUVOVF9UWVBFUyA9IFsnRG9jdW1lbnRzJywgJ0ltYWdlcycsICdNZWRpYScsICdBcmNoaXZlcycsICdPdGhlciddIGFzIGNvbnN0O1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09OVEVYVF9UWVBFUyA9IFsnUHJvamVjdHMnLCAnQXJlYXMnLCAnUGVvcGxlJywgJ09yZ2FuaXphdGlvbnMnLCAnR2VuZXJhbCddIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBEb2N1bWVudFR5cGUgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBDb250ZXh0VHlwZSA9IHN0cmluZztcbiIsICJpbXBvcnQgeyBERUZBVUxUX0NPTlRFWFRfVFlQRVMsIERFRkFVTFRfRE9DVU1FTlRfVFlQRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUV4dGVybmFsaXplclNldHRpbmdzIHtcbiAgY2FjaGVGb2xkZXI6IHN0cmluZztcbiAgY29udGV4dFR5cGVzOiBzdHJpbmdbXTtcbiAgZG9jdW1lbnRUeXBlczogc3RyaW5nW107XG4gIGV4dGVybmFsTm90ZXNGb2xkZXI6IHN0cmluZztcbiAgcHJvdmlkZXI6ICdwcm90b24tZHJpdmUtY2xpJztcbiAgcmVtb3RlUm9vdDogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogRmlsZUV4dGVybmFsaXplclNldHRpbmdzID0ge1xuICBjYWNoZUZvbGRlcjogJ0ZpbGUgRXh0ZXJuYWxpemVyIENhY2hlJyxcbiAgY29udGV4dFR5cGVzOiBbLi4uREVGQVVMVF9DT05URVhUX1RZUEVTXSxcbiAgZG9jdW1lbnRUeXBlczogWy4uLkRFRkFVTFRfRE9DVU1FTlRfVFlQRVNdLFxuICBleHRlcm5hbE5vdGVzRm9sZGVyOiAnRXh0ZXJuYWwgRmlsZXMnLFxuICBwcm92aWRlcjogJ3Byb3Rvbi1kcml2ZS1jbGknLFxuICByZW1vdGVSb290OiAnJyxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTZXR0aW5ncyhpbnB1dDogUGFydGlhbDxGaWxlRXh0ZXJuYWxpemVyU2V0dGluZ3M+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyB7XG4gIHJldHVybiB7XG4gICAgY2FjaGVGb2xkZXI6IG5vbkVtcHR5KGlucHV0Py5jYWNoZUZvbGRlciwgREVGQVVMVF9TRVRUSU5HUy5jYWNoZUZvbGRlciksXG4gICAgY29udGV4dFR5cGVzOiBub25FbXB0eUxpc3QoaW5wdXQ/LmNvbnRleHRUeXBlcywgREVGQVVMVF9TRVRUSU5HUy5jb250ZXh0VHlwZXMpLFxuICAgIGRvY3VtZW50VHlwZXM6IGVuc3VyZU90aGVyKG5vbkVtcHR5TGlzdChpbnB1dD8uZG9jdW1lbnRUeXBlcywgREVGQVVMVF9TRVRUSU5HUy5kb2N1bWVudFR5cGVzKSksXG4gICAgZXh0ZXJuYWxOb3Rlc0ZvbGRlcjogbm9uRW1wdHkoaW5wdXQ/LmV4dGVybmFsTm90ZXNGb2xkZXIsIERFRkFVTFRfU0VUVElOR1MuZXh0ZXJuYWxOb3Rlc0ZvbGRlciksXG4gICAgcHJvdmlkZXI6IGlucHV0Py5wcm92aWRlciB8fCBERUZBVUxUX1NFVFRJTkdTLnByb3ZpZGVyLFxuICAgIHJlbW90ZVJvb3Q6IFN0cmluZyhpbnB1dD8ucmVtb3RlUm9vdCB8fCBERUZBVUxUX1NFVFRJTkdTLnJlbW90ZVJvb3QpLnRyaW0oKS5yZXBsYWNlKC9cXC8rJC9nLCAnJyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vbkVtcHR5KHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0cmltbWVkID0gU3RyaW5nKHZhbHVlIHx8ICcnKS50cmltKCk7XG4gIHJldHVybiB0cmltbWVkIHx8IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBub25FbXB0eUxpc3QodmFsdWU6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBmYWxsYmFjazogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IG5leHQgPSBBcnJheS5pc0FycmF5KHZhbHVlKVxuICAgID8gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcbiAgICA6IFtdO1xuICByZXR1cm4gbmV4dC5sZW5ndGggPyBBcnJheS5mcm9tKG5ldyBTZXQobmV4dCkpIDogWy4uLmZhbGxiYWNrXTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlT3RoZXIodmFsdWVzOiBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHZhbHVlcy5zb21lKCh2YWx1ZSkgPT4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ290aGVyJykgPyB2YWx1ZXMgOiBbLi4udmFsdWVzLCAnT3RoZXInXTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgdG9Qb3NpeFBhdGggfSBmcm9tICcuLi9kb21haW4vcGF0aHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmF1bHRQYXRoKGFwcDogQXBwKTogc3RyaW5nIHtcbiAgY29uc3QgYWRhcHRlciA9IGFwcC52YXVsdC5hZGFwdGVyIGFzIHsgYmFzZVBhdGg/OiBzdHJpbmc7IGdldEJhc2VQYXRoPzogKCkgPT4gc3RyaW5nIH07XG4gIGlmICh0eXBlb2YgYWRhcHRlci5nZXRCYXNlUGF0aCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGFkYXB0ZXIuZ2V0QmFzZVBhdGgoKTtcbiAgaWYgKGFkYXB0ZXIuYmFzZVBhdGgpIHJldHVybiBhZGFwdGVyLmJhc2VQYXRoO1xuICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgRXh0ZXJuYWxpemVyIHJlcXVpcmVzIHRoZSBkZXNrdG9wIGZpbGVzeXN0ZW0gYWRhcHRlci4nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhdWx0UmVsYXRpdmVQYXRoKHZhdWx0UGF0aDogc3RyaW5nLCBhYnNvbHV0ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0b1Bvc2l4UGF0aChwYXRoLnJlbGF0aXZlKHZhdWx0UGF0aCwgYWJzb2x1dGVQYXRoKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bmlxdWVNYXJrZG93blBhdGgoYXBwOiBBcHAsIHJlcXVlc3RlZFBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghYXdhaXQgYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKHJlcXVlc3RlZFBhdGgpKSByZXR1cm4gcmVxdWVzdGVkUGF0aDtcbiAgY29uc3QgZXh0ID0gcGF0aC5wb3NpeC5leHRuYW1lKHJlcXVlc3RlZFBhdGgpO1xuICBjb25zdCBiYXNlID0gcmVxdWVzdGVkUGF0aC5zbGljZSgwLCAtZXh0Lmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAyOyBpIDwgMTAwMDsgaSArPSAxKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlID0gYCR7YmFzZX0gJHtpfSR7ZXh0fWA7XG4gICAgaWYgKCFhd2FpdCBhcHAudmF1bHQuYWRhcHRlci5leGlzdHMoY2FuZGlkYXRlKSkgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjcmVhdGUgYSB1bmlxdWUgbm90ZSBwYXRoLicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZlTWFya2Rvd25GaWxlKGFwcDogQXBwKTogVEZpbGUgfCBudWxsIHtcbiAgY29uc3QgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICByZXR1cm4gZmlsZSAmJiBmaWxlLmV4dGVuc2lvbiA9PT0gJ21kJyA/IGZpbGUgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEV4dGVybmFsRmlsZU5vdGUoYXBwOiBBcHApOiBURmlsZSB8IG51bGwge1xuICBjb25zdCBhY3RpdmUgPSBhY3RpdmVNYXJrZG93bkZpbGUoYXBwKTtcbiAgaWYgKGFjdGl2ZSAmJiBmaWxlSGFzUmVtb3RlUGF0aChhcHAsIGFjdGl2ZSkpIHJldHVybiBhY3RpdmU7XG5cbiAgZm9yIChjb25zdCBsZWFmIG9mIGFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKCdtYXJrZG93bicpKSB7XG4gICAgY29uc3QgZmlsZSA9IGxlYWY/LnZpZXcgJiYgJ2ZpbGUnIGluIGxlYWYudmlldyA/IGxlYWYudmlldy5maWxlIGFzIFRGaWxlIHwgbnVsbCA6IG51bGw7XG4gICAgaWYgKGZpbGUgJiYgZmlsZS5leHRlbnNpb24gPT09ICdtZCcgJiYgZmlsZUhhc1JlbW90ZVBhdGgoYXBwLCBmaWxlKSkgcmV0dXJuIGZpbGU7XG4gIH1cblxuICByZXR1cm4gYWN0aXZlO1xufVxuXG5mdW5jdGlvbiBmaWxlSGFzUmVtb3RlUGF0aChhcHA6IEFwcCwgZmlsZTogVEZpbGUpOiBib29sZWFuIHtcbiAgY29uc3QgY2FjaGUgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gIHJldHVybiBCb29sZWFuKGNhY2hlPy5mcm9udG1hdHRlcj8ucmVtb3RlX3BhdGggfHwgY2FjaGU/LmZyb250bWF0dGVyPy5wcm90b25fcGF0aCk7XG59XG4iLCAiaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IENvbnRleHRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJlbW90ZUZvbGRlcihmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBTdHJpbmcoZm9sZGVyUGF0aCB8fCAnJykudHJpbSgpLnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgY29uc3Qgcm9vdCA9IHJlbW90ZVJvb3QucmVwbGFjZSgvXFwvKyQvZywgJycpO1xuICBpZiAoIXJvb3QpIHJldHVybiBub3JtYWxpemVkO1xuICBpZiAoIW5vcm1hbGl6ZWQgfHwgbm9ybWFsaXplZCA9PT0gcm9vdCkgcmV0dXJuIHJvb3Q7XG4gIGlmICghbm9ybWFsaXplZC5zdGFydHNXaXRoKGAke3Jvb3R9L2ApKSByZXR1cm4gcm9vdDtcbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luUmVtb3RlUGF0aChwYXJlbnRQYXRoOiBzdHJpbmcsIGNoaWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY2xlYW5DaGlsZCA9IFN0cmluZyhjaGlsZE5hbWUgfHwgJycpLnRyaW0oKS5yZXBsYWNlKC9eXFwvK3xcXC8rJC9nLCAnJyk7XG4gIGlmICghY2xlYW5DaGlsZCkgcmV0dXJuIHBhcmVudFBhdGg7XG4gIHJldHVybiBgJHtwYXJlbnRQYXRoLnJlcGxhY2UoL1xcLyskL2csICcnKX0vJHtjbGVhbkNoaWxkfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJlbnRSZW1vdGVQYXRoKGN1cnJlbnRQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJvb3QgPSByZW1vdGVSb290LnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgaWYgKGN1cnJlbnRQYXRoID09PSByb290KSByZXR1cm4gcm9vdDtcbiAgY29uc3QgcGFyZW50ID0gY3VycmVudFBhdGgucmVwbGFjZSgvXFwvKyQvZywgJycpLnJlcGxhY2UoL1xcL1teL10rJC8sICcnKTtcbiAgcmV0dXJuIHBhcmVudCAmJiBwYXJlbnQuc3RhcnRzV2l0aChyb290KSA/IHBhcmVudCA6IHJvb3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoTmFtZShmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgcmVtb3RlUm9vdCk7XG4gIGlmIChub3JtYWxpemVkID09PSByZW1vdGVSb290KSByZXR1cm4gJ0V4dGVybmFsIEZpbGVzJztcbiAgcmV0dXJuIG5vcm1hbGl6ZWQuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbikucG9wKCkgfHwgbm9ybWFsaXplZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVtb3RlUm9vdChmb2xkZXJQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGZvbGRlclBhdGgsIHJlbW90ZVJvb3QpID09PSByZW1vdGVSb290O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY2VuZGFudE9yU2FtZShjYW5kaWRhdGU6IHN0cmluZywgYmFzZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBjYW5kaWRhdGUgPT09IGJhc2UgfHwgU3RyaW5nKGNhbmRpZGF0ZSB8fCAnJykuc3RhcnRzV2l0aChgJHtiYXNlfS9gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VQYXRoUHJlZml4KHRleHQ6IHN0cmluZywgb2xkUGF0aDogc3RyaW5nLCBuZXdQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHRleHQgfHwgJycpLnNwbGl0KG9sZFBhdGgpLmpvaW4obmV3UGF0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGl2ZVJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nLCByZW1vdGVSb290OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbm9ybWFsaXplUmVtb3RlRm9sZGVyKHJlbW90ZVBhdGgsIHJlbW90ZVJvb3QpLnNsaWNlKHJlbW90ZVJvb3QubGVuZ3RoKS5yZXBsYWNlKC9eXFwvLywgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FmZVJlbGF0aXZlUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJvb3QgPSByZW1vdGVSb290LnJlcGxhY2UoL1xcLyskL2csICcnKTtcbiAgY29uc3Qgcm9vdFBhdHRlcm4gPSByb290ID8gbmV3IFJlZ0V4cChgXiR7ZXNjYXBlUmVnRXhwKHJvb3QpfS8/YCkgOiBudWxsO1xuICByZXR1cm4gU3RyaW5nKHJlbW90ZVBhdGggfHwgJycpXG4gICAgLnJlcGxhY2Uocm9vdFBhdHRlcm4gfHwgL14vLCAnJylcbiAgICAucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5tYXAoKHBhcnQpID0+IHBhcnQucmVwbGFjZSgvW1xcXFw6Kj9cIjw+fF0vZywgJy0nKSlcbiAgICAuam9pbignLycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlQ29udGV4dFR5cGUocmVtb3RlRm9sZGVyOiBzdHJpbmcsIHJlbW90ZVJvb3Q6IHN0cmluZywgY29udGV4dFR5cGVzOiBzdHJpbmdbXSk6IENvbnRleHRUeXBlIHtcbiAgY29uc3QgZmlyc3QgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIocmVtb3RlRm9sZGVyLCByZW1vdGVSb290KVxuICAgIC5zbGljZShyZW1vdGVSb290Lmxlbmd0aClcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5maWx0ZXIoQm9vbGVhbilbMF07XG4gIHJldHVybiBjb250ZXh0VHlwZXMuaW5jbHVkZXMoZmlyc3QpID8gZmlyc3QgYXMgQ29udGV4dFR5cGUgOiAnR2VuZXJhbCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVDb250ZXh0TmFtZShyZW1vdGVGb2xkZXI6IHN0cmluZywgcmVtb3RlUm9vdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHMgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIocmVtb3RlRm9sZGVyLCByZW1vdGVSb290KVxuICAgIC5zbGljZShyZW1vdGVSb290Lmxlbmd0aClcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gIGlmIChwYXJ0cy5sZW5ndGggPj0gMikgcmV0dXJuIHBhcnRzWzFdO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxICYmIHBhcnRzWzBdICE9PSAnR2VuZXJhbCcpIHJldHVybiBwYXJ0c1swXTtcbiAgcmV0dXJuICdHZW5lcmFsJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUG9zaXhQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZmlsZVBhdGguc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEFwcCwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgc3Bhd25TeW5jIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzJztcbmltcG9ydCB7IERvY3VtZW50VHlwZSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBub3JtYWxpemVEb2N1bWVudFR5cGUgfSBmcm9tICcuLi9kb21haW4vZG9jdW1lbnRUeXBlJztcbmltcG9ydCB7IGJ1aWxkRXh0ZXJuYWxGaWxlTm90ZSwgZXh0ZXJuYWxGaWxlTm90ZUZvbGRlciwgbWFya0V4dGVybmFsRmlsZVRleHRNaXNzaW5nLCB1cGRhdGVFeHRlcm5hbEZpbGVUZXh0Rm9yRm9sZGVyUmVuYW1lIH0gZnJvbSAnLi4vZG9tYWluL2V4dGVybmFsRmlsZU5vdGUnO1xuaW1wb3J0IHsgZGVmYXVsdFRpdGxlRm9yRmlsZSwgbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUsIHNsdWdUaXRsZSB9IGZyb20gJy4uL2RvbWFpbi9maWxlbmFtZSc7XG5pbXBvcnQgeyBwYXJzZUZyb250bWF0dGVyIH0gZnJvbSAnLi4vZG9tYWluL2Zyb250bWF0dGVyJztcbmltcG9ydCB7IGRlcml2ZUNvbnRleHROYW1lLCBkZXJpdmVDb250ZXh0VHlwZSwgam9pblJlbW90ZVBhdGgsIHBhcmVudFJlbW90ZVBhdGggfSBmcm9tICcuLi9kb21haW4vcGF0aHMnO1xuaW1wb3J0IHsgZ2V0VmF1bHRQYXRoLCB1bmlxdWVNYXJrZG93blBhdGgsIHZhdWx0UmVsYXRpdmVQYXRoIH0gZnJvbSAnLi4vcGxhdGZvcm0vb2JzaWRpYW5WYXVsdCc7XG5pbXBvcnQgeyBpc01pc3NpbmdSZW1vdGVQYXRoRXJyb3IsIFByb3RvbkRyaXZlQ2xpUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvcHJvdG9uRHJpdmVDbGlQcm92aWRlcic7XG5pbXBvcnQgeyBTdG9yYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvc3RvcmFnZVByb3ZpZGVyJztcbmltcG9ydCB7IENhY2hlU2VydmljZSB9IGZyb20gJy4vY2FjaGVTZXJ2aWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWdpc3RlckZpbGVJbnB1dCB7XG4gIGRlc3RpbmF0aW9uRm9sZGVyOiBzdHJpbmc7XG4gIGRvY3VtZW50VHlwZTogRG9jdW1lbnRUeXBlO1xuICBmaWxlUGF0aDogc3RyaW5nO1xuICBzaGFyZUxpbms6IGJvb2xlYW47XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHVwbG9hZEZpbGVuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0ZXJGaWxlUmVzdWx0IHtcbiAgbGluazogc3RyaW5nO1xuICBub3RlUGF0aDogc3RyaW5nO1xuICByZW1vdGVQYXRoOiBzdHJpbmc7XG4gIHN0b3JhZ2VGb2xkZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgY2hhbmdlZDogbnVtYmVyO1xuICBlcnJvcnM6IG51bWJlcjtcbiAgZm91bmQ6IG51bWJlcjtcbiAgbWlzc2luZzogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRmlsZUV4dGVybmFsaXplclNlcnZpY2Uge1xuICByZWFkb25seSBwcm92aWRlcjogU3RvcmFnZVByb3ZpZGVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSByZWFkb25seSBzZXR0aW5nczogRmlsZUV4dGVybmFsaXplclNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUyxcbiAgICBwcm92aWRlcj86IFN0b3JhZ2VQcm92aWRlcixcbiAgKSB7XG4gICAgdGhpcy5wcm92aWRlciA9IHByb3ZpZGVyIHx8IG5ldyBQcm90b25Ecml2ZUNsaVByb3ZpZGVyKCk7XG4gIH1cblxuICBhc3luYyByZWdpc3RlckZpbGUoaW5wdXQ6IFJlZ2lzdGVyRmlsZUlucHV0KTogUHJvbWlzZTxSZWdpc3RlckZpbGVSZXN1bHQ+IHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCkgdGhyb3cgbmV3IEVycm9yKCdGaWxlIEV4dGVybmFsaXplciByZW1vdGUgcm9vdCBpcyBub3QgY29uZmlndXJlZC4nKTtcbiAgICBjb25zdCB2YXVsdFBhdGggPSBnZXRWYXVsdFBhdGgodGhpcy5hcHApO1xuICAgIGNvbnN0IGxvY2FsRmlsZSA9IHBhdGgucmVzb2x2ZShpbnB1dC5maWxlUGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGxvY2FsRmlsZSkpIHRocm93IG5ldyBFcnJvcihgRmlsZSBub3QgZm91bmQ6ICR7bG9jYWxGaWxlfWApO1xuXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgY29uc3QgdGl0bGUgPSBzbHVnVGl0bGUoaW5wdXQudGl0bGUgfHwgZGVmYXVsdFRpdGxlRm9yRmlsZShsb2NhbEZpbGUpKTtcbiAgICBjb25zdCB1cGxvYWRGaWxlbmFtZSA9IG5vcm1hbGl6ZVVwbG9hZEZpbGVuYW1lKGlucHV0LnVwbG9hZEZpbGVuYW1lLCBsb2NhbEZpbGUpO1xuICAgIGNvbnN0IGRvY3VtZW50VHlwZSA9IG5vcm1hbGl6ZURvY3VtZW50VHlwZShpbnB1dC5kb2N1bWVudFR5cGUsIHRoaXMuc2V0dGluZ3MuZG9jdW1lbnRUeXBlcyk7XG4gICAgY29uc3QgcmVtb3RlRm9sZGVyID0gaW5wdXQuZGVzdGluYXRpb25Gb2xkZXI7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IGpvaW5SZW1vdGVQYXRoKHJlbW90ZUZvbGRlciwgdXBsb2FkRmlsZW5hbWUpO1xuXG4gICAgY29uc3QgdXBsb2FkZWQgPSBhd2FpdCB0aGlzLnByb3ZpZGVyLnVwbG9hZEZpbGUoe1xuICAgICAgbG9jYWxQYXRoOiBsb2NhbEZpbGUsXG4gICAgICByZW1vdGVGb2xkZXIsXG4gICAgICByZW1vdGVOYW1lOiB1cGxvYWRGaWxlbmFtZSxcbiAgICB9KTtcblxuICAgIHRoaXMuY2FjaGUodmF1bHRQYXRoKS5zZWVkRnJvbUxvY2FsRmlsZShsb2NhbEZpbGUsIHJlbW90ZVBhdGgsIHVwbG9hZGVkLm1vZGlmaWVkVGltZSk7XG5cbiAgICBjb25zdCBub3RlRm9sZGVyID0gZXh0ZXJuYWxGaWxlTm90ZUZvbGRlcih0aGlzLnNldHRpbmdzLmV4dGVybmFsTm90ZXNGb2xkZXIsIGRvY3VtZW50VHlwZSwgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKTtcbiAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIobm90ZUZvbGRlcikuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICBjb25zdCBub3RlUmVsID0gYXdhaXQgdW5pcXVlTWFya2Rvd25QYXRoKHRoaXMuYXBwLCBwYXRoLnBvc2l4LmpvaW4obm90ZUZvbGRlciwgYCR7dGl0bGV9Lm1kYCkpO1xuICAgIGNvbnN0IHNpemUgPSBmcy5zdGF0U3luYyhsb2NhbEZpbGUpLnNpemU7XG4gICAgY29uc3Qgbm90ZSA9IGJ1aWxkRXh0ZXJuYWxGaWxlTm90ZSh7XG4gICAgICB0aXRsZSxcbiAgICAgIGRvY3VtZW50VHlwZSxcbiAgICAgIHJlbW90ZUZvbGRlcixcbiAgICAgIHByb3ZpZGVyOiB0aGlzLnNldHRpbmdzLnByb3ZpZGVyLFxuICAgICAgcmVtb3RlUGF0aCxcbiAgICAgIHNoYXJlTGluazogaW5wdXQuc2hhcmVMaW5rID8gJ3BlbmRpbmcnIDogJ25vbmUnLFxuICAgICAgb3JpZ2luYWxGaWxlbmFtZTogcGF0aC5iYXNlbmFtZShsb2NhbEZpbGUpLFxuICAgICAgdXBsb2FkRmlsZW5hbWUsXG4gICAgICBzaXplLFxuICAgICAgY29udGV4dFR5cGU6IGRlcml2ZUNvbnRleHRUeXBlKHJlbW90ZUZvbGRlciwgdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290LCB0aGlzLnNldHRpbmdzLmNvbnRleHRUeXBlcyksXG4gICAgICBjb250ZXh0TmFtZTogZGVyaXZlQ29udGV4dE5hbWUocmVtb3RlRm9sZGVyLCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QpLFxuICAgICAgZGF0ZSxcbiAgICB9LCB0aGlzLnNldHRpbmdzLmRvY3VtZW50VHlwZXMpO1xuXG4gICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShub3RlUmVsLCBub3RlKTtcbiAgICByZXR1cm4ge1xuICAgICAgbGluazogYFtbJHtjcmVhdGVkLmJhc2VuYW1lfV1dYCxcbiAgICAgIG5vdGVQYXRoOiBwYXRoLmpvaW4odmF1bHRQYXRoLCBjcmVhdGVkLnBhdGgpLFxuICAgICAgcmVtb3RlUGF0aCxcbiAgICAgIHN0b3JhZ2VGb2xkZXI6IHJlbW90ZUZvbGRlcixcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgb3BlbkV4dGVybmFsRmlsZShub3RlOiBURmlsZSwgb3BlbiA9IHRydWUpOiBQcm9taXNlPHsgY2FjaGVIaXQ6IGJvb2xlYW47IG9wZW5lZDogc3RyaW5nOyByZW1vdGVQYXRoOiBzdHJpbmcgfT4ge1xuICAgIGNvbnN0IHZhdWx0UGF0aCA9IGdldFZhdWx0UGF0aCh0aGlzLmFwcCk7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQobm90ZSk7XG4gICAgY29uc3QgZm0gPSBwYXJzZUZyb250bWF0dGVyKHRleHQpO1xuICAgIGNvbnN0IHJlbW90ZVBhdGggPSBmbS5yZW1vdGVfcGF0aCB8fCBmbS5wcm90b25fcGF0aDtcbiAgICBpZiAoIXJlbW90ZVBhdGgpIHRocm93IG5ldyBFcnJvcignQWN0aXZlIG5vdGUgaGFzIG5vIHJlbW90ZV9wYXRoIHByb3BlcnR5LicpO1xuXG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLmNhY2hlKHZhdWx0UGF0aCk7XG4gICAgY29uc3QgY2FjaGVQYXRoID0gY2FjaGUuY2FjaGVQYXRoRm9yUmVtb3RlKHJlbW90ZVBhdGgpO1xuICAgIGNvbnN0IGNhY2hlSGl0ID0gZnMuZXhpc3RzU3luYyhjYWNoZVBhdGgpO1xuXG4gICAgaWYgKCFjYWNoZUhpdCkge1xuICAgICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShjYWNoZVBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IHRlbXBEaXIgPSBmcy5ta2R0ZW1wU3luYyhwYXRoLmpvaW4oY2FjaGUuY2FjaGVSb290KCksICcuZG93bmxvYWQtJykpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZG93bmxvYWRlZCA9IGF3YWl0IHRoaXMucHJvdmlkZXIuZG93bmxvYWRGaWxlKHJlbW90ZVBhdGgsIHRlbXBEaXIpO1xuICAgICAgICBmcy5yZW5hbWVTeW5jKGRvd25sb2FkZWQucGF0aCwgY2FjaGVQYXRoKTtcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IHRoaXMucHJvdmlkZXIuc3RhdChyZW1vdGVQYXRoKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYWNoZS5yZWFkSW5kZXgoKTtcbiAgICAgICAgaW5kZXhbcmVtb3RlUGF0aF0gPSB7XG4gICAgICAgICAgY2FjaGVQYXRoOiBwYXRoLnJlbGF0aXZlKHZhdWx0UGF0aCwgY2FjaGVQYXRoKSxcbiAgICAgICAgICByZW1vdGVUaW1lOiBpbmZvLm1vZGlmaWVkVGltZSxcbiAgICAgICAgICBjYWNoZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuICAgICAgICBjYWNoZS53cml0ZUluZGV4KGluZGV4KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGZzLnJtU3luYyh0ZW1wRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wZW4pIG9wZW5GaWxlKGNhY2hlUGF0aCk7XG4gICAgcmV0dXJuIHsgb3BlbmVkOiBjYWNoZVBhdGgsIGNhY2hlSGl0LCByZW1vdGVQYXRoIH07XG4gIH1cblxuICBhc3luYyByZW5hbWVGb2xkZXIob2xkUGF0aDogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGF3YWl0IHRoaXMucHJvdmlkZXIucmVuYW1lRm9sZGVyKG9sZFBhdGgsIG5ld05hbWUpO1xuICAgIGNvbnN0IG5ld1BhdGggPSBqb2luUmVtb3RlUGF0aChwYXJlbnRSZW1vdGVQYXRoKG9sZFBhdGgsIHRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCksIG5ld05hbWUpO1xuICAgIGNvbnN0IGNoYW5nZWQgPSBhd2FpdCB0aGlzLnVwZGF0ZVZhdWx0UGF0aFJlZmVyZW5jZXMob2xkUGF0aCwgbmV3UGF0aCk7XG4gICAgdGhpcy5jYWNoZShnZXRWYXVsdFBhdGgodGhpcy5hcHApKS5yZW1hcEZvbGRlcihvbGRQYXRoLCBuZXdQYXRoKTtcbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfVxuXG4gIGFzeW5jIHRyYXNoRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgYXdhaXQgdGhpcy5wcm92aWRlci50cmFzaEZvbGRlcihmb2xkZXJQYXRoKTtcbiAgICB0aGlzLmNhY2hlKGdldFZhdWx0UGF0aCh0aGlzLmFwcCkpLnJlbW92ZUZvbGRlcihmb2xkZXJQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5tYXJrRGVsZXRlZEZvbGRlck5vdGVzKGZvbGRlclBhdGgpO1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlVmF1bHRQYXRoUmVmZXJlbmNlcyhvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgIGxldCBjaGFuZ2VkID0gMDtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIGlmICghdGV4dC5pbmNsdWRlcyhvbGRQYXRoKSkgY29udGludWU7XG4gICAgICBjb25zdCBmbSA9IHBhcnNlRnJvbnRtYXR0ZXIodGV4dCk7XG4gICAgICBjb25zdCB1cGRhdGVkID0gZm0udHlwZSA9PT0gJ2V4dGVybmFsLWZpbGUnXG4gICAgICAgID8gdXBkYXRlRXh0ZXJuYWxGaWxlVGV4dEZvckZvbGRlclJlbmFtZSh0ZXh0LCBvbGRQYXRoLCBuZXdQYXRoLCB0b2RheSwgdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290LCB0aGlzLnNldHRpbmdzLmNvbnRleHRUeXBlcylcbiAgICAgICAgOiB0ZXh0LnNwbGl0KG9sZFBhdGgpLmpvaW4obmV3UGF0aCk7XG4gICAgICBpZiAodXBkYXRlZCAhPT0gdGV4dCkge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZCk7XG4gICAgICAgIGNoYW5nZWQgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICBhc3luYyBtYXJrRGVsZXRlZEZvbGRlck5vdGVzKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgIGxldCBjaGFuZ2VkID0gMDtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIGlmICghdGV4dC5pbmNsdWRlcyhmb2xkZXJQYXRoKSkgY29udGludWU7XG4gICAgICBjb25zdCB1cGRhdGVkID0gbWFya0V4dGVybmFsRmlsZVRleHRNaXNzaW5nKHRleHQsIGZvbGRlclBhdGgsIHRvZGF5LCAnRXh0ZXJuYWwgc3RvcmFnZSBmb2xkZXIgbW92ZWQgdG8gdHJhc2gnKTtcbiAgICAgIGlmICh1cGRhdGVkICE9PSB0ZXh0KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB1cGRhdGVkKTtcbiAgICAgICAgY2hhbmdlZCArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfVxuXG4gIGFzeW5jIHZhbGlkYXRlRXh0ZXJuYWxGaWxlTm90ZXMoKTogUHJvbWlzZTxWYWxpZGF0aW9uUmVzdWx0PiB7XG4gICAgbGV0IGZvdW5kID0gMDtcbiAgICBsZXQgbWlzc2luZyA9IDA7XG4gICAgbGV0IGVycm9ycyA9IDA7XG4gICAgbGV0IGNoYW5nZWQgPSAwO1xuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgY29uc3QgZm0gPSBwYXJzZUZyb250bWF0dGVyKHRleHQpO1xuICAgICAgY29uc3QgcmVtb3RlUGF0aCA9IGZtLnJlbW90ZV9wYXRoIHx8IGZtLnByb3Rvbl9wYXRoO1xuICAgICAgaWYgKGZtLnR5cGUgIT09ICdleHRlcm5hbC1maWxlJyB8fCAhcmVtb3RlUGF0aCkgY29udGludWU7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnByb3ZpZGVyLnN0YXQocmVtb3RlUGF0aCk7XG4gICAgICAgIGZvdW5kICs9IDE7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIWlzTWlzc2luZ1JlbW90ZVBhdGhFcnJvcihlcnJvcikpIHtcbiAgICAgICAgICBlcnJvcnMgKz0gMTtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYENvdWxkIG5vdCB2YWxpZGF0ZSAke2ZpbGUucGF0aH06YCwgZXJyb3IpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG1pc3NpbmcgKz0gMTtcbiAgICAgICAgY29uc3QgdXBkYXRlZCA9IG1hcmtFeHRlcm5hbEZpbGVUZXh0TWlzc2luZyh0ZXh0LCByZW1vdGVQYXRoLCB0b2RheSwgJ0V4dGVybmFsIGZpbGUgbm90IGZvdW5kIGR1cmluZyB2YWxpZGF0aW9uJyk7XG4gICAgICAgIGlmICh1cGRhdGVkICE9PSB0ZXh0KSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWQpO1xuICAgICAgICAgIGNoYW5nZWQgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGZvdW5kLCBtaXNzaW5nLCBjaGFuZ2VkLCBlcnJvcnMgfTtcbiAgfVxuXG4gIGFzeW5jIG9wZW5DcmVhdGVkTm90ZShhYnNvbHV0ZU5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB2YXVsdFBhdGggPSBnZXRWYXVsdFBhdGgodGhpcy5hcHApO1xuICAgIGNvbnN0IHJlbCA9IHZhdWx0UmVsYXRpdmVQYXRoKHZhdWx0UGF0aCwgYWJzb2x1dGVOb3RlUGF0aCk7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZWwpO1xuICAgIGlmIChmaWxlIGluc3RhbmNlb2YgT2JqZWN0ICYmICdleHRlbnNpb24nIGluIGZpbGUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKS5vcGVuRmlsZShmaWxlIGFzIFRGaWxlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNhY2hlKHZhdWx0UGF0aDogc3RyaW5nKTogQ2FjaGVTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IENhY2hlU2VydmljZSh2YXVsdFBhdGgsIHRoaXMuc2V0dGluZ3MuY2FjaGVGb2xkZXIsIHRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb3BlbkZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBzcGF3blN5bmMoZnMuZXhpc3RzU3luYygnL3Vzci9iaW4vb3BlbicpID8gJy91c3IvYmluL29wZW4nIDogJ29wZW4nLCBbZmlsZVBhdGhdLCB7IHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICBzcGF3blN5bmMoJ2NtZCcsIFsnL2MnLCAnc3RhcnQnLCAnJywgZmlsZVBhdGhdLCB7IHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICByZXR1cm47XG4gIH1cbiAgc3Bhd25TeW5jKCd4ZGctb3BlbicsIFtmaWxlUGF0aF0sIHsgc3RkaW86ICdpZ25vcmUnIH0pO1xufVxuIiwgImltcG9ydCB7IERvY3VtZW50VHlwZSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBub3JtYWxpemVSZW1vdGVGb2xkZXIgfSBmcm9tICcuL3BhdGhzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZURvY3VtZW50VHlwZSh2YWx1ZTogc3RyaW5nLCBkb2N1bWVudFR5cGVzOiBzdHJpbmdbXSk6IERvY3VtZW50VHlwZSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVkTGFiZWwodmFsdWUpO1xuICByZXR1cm4gZG9jdW1lbnRUeXBlcy5maW5kKCh0eXBlKSA9PiBub3JtYWxpemVkTGFiZWwodHlwZSkgPT09IG5vcm1hbGl6ZWQpIHx8IGZhbGxiYWNrRG9jdW1lbnRUeXBlKGRvY3VtZW50VHlwZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlRG9jdW1lbnRUeXBlKHJlbW90ZUZvbGRlcjogc3RyaW5nLCByZW1vdGVSb290OiBzdHJpbmcsIGRvY3VtZW50VHlwZXM6IHN0cmluZ1tdKTogRG9jdW1lbnRUeXBlIHtcbiAgY29uc3QgcGFydHMgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIocmVtb3RlRm9sZGVyLCByZW1vdGVSb290KVxuICAgIC5zbGljZShyZW1vdGVSb290Lmxlbmd0aClcbiAgICAuc3BsaXQoJy8nKVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG5cbiAgZm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgY29uc3QgbWF0Y2ggPSBkb2N1bWVudFR5cGVzLmZpbmQoKHR5cGUpID0+IG5vcm1hbGl6ZWRMYWJlbCh0eXBlKSA9PT0gbm9ybWFsaXplZExhYmVsKHBhcnRzW2ldKSk7XG4gICAgaWYgKG1hdGNoKSByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICByZXR1cm4gZmFsbGJhY2tEb2N1bWVudFR5cGUoZG9jdW1lbnRUeXBlcyk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZWRMYWJlbCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy1fXSsvZywgJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG59XG5cbmZ1bmN0aW9uIGZhbGxiYWNrRG9jdW1lbnRUeXBlKGRvY3VtZW50VHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgcmV0dXJuIGRvY3VtZW50VHlwZXMuZmluZCgodHlwZSkgPT4gbm9ybWFsaXplZExhYmVsKHR5cGUpID09PSAnb3RoZXInKSB8fCBkb2N1bWVudFR5cGVzWzBdIHx8ICdPdGhlcic7XG59XG4iLCAiaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IENPTU1BTkRfT1BFTl9FWFRFUk5BTF9GSUxFLCBEb2N1bWVudFR5cGUgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbm9ybWFsaXplRG9jdW1lbnRUeXBlIH0gZnJvbSAnLi9kb2N1bWVudFR5cGUnO1xuaW1wb3J0IHsgcGFyc2VGcm9udG1hdHRlciwgc2V0RnJvbnRtYXR0ZXJGaWVsZHMsIHlhbWxTY2FsYXIsIHlhbWxTdHJpbmcgfSBmcm9tICcuL2Zyb250bWF0dGVyJztcbmltcG9ydCB7XG4gIGRlcml2ZUNvbnRleHROYW1lLFxuICBkZXJpdmVDb250ZXh0VHlwZSxcbiAgZGVzY2VuZGFudE9yU2FtZSxcbiAgcmVwbGFjZVBhdGhQcmVmaXgsXG59IGZyb20gJy4vcGF0aHMnO1xuaW1wb3J0IHsgc2x1Z1RpdGxlIH0gZnJvbSAnLi9maWxlbmFtZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZXJuYWxGaWxlTm90ZUlucHV0IHtcbiAgY29udGV4dE5hbWU6IHN0cmluZztcbiAgY29udGV4dFR5cGU6IHN0cmluZztcbiAgZGF0ZTogc3RyaW5nO1xuICBkb2N1bWVudFR5cGU6IERvY3VtZW50VHlwZTtcbiAgb3JpZ2luYWxGaWxlbmFtZTogc3RyaW5nO1xuICBwcm92aWRlcjogc3RyaW5nO1xuICByZW1vdGVQYXRoOiBzdHJpbmc7XG4gIHJlbW90ZUZvbGRlcjogc3RyaW5nO1xuICBzaGFyZUxpbms6IHN0cmluZztcbiAgc2l6ZTogbnVtYmVyO1xuICB0aXRsZTogc3RyaW5nO1xuICB1cGxvYWRGaWxlbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZXJuYWxGaWxlTm90ZUZvbGRlcihyb290Rm9sZGVyOiBzdHJpbmcsIGRvY3VtZW50VHlwZTogc3RyaW5nLCBkb2N1bWVudFR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnBvc2l4LmpvaW4ocm9vdEZvbGRlciwgbm9ybWFsaXplRG9jdW1lbnRUeXBlKGRvY3VtZW50VHlwZSwgZG9jdW1lbnRUeXBlcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFeHRlcm5hbEZpbGVOb3RlKGlucHV0OiBFeHRlcm5hbEZpbGVOb3RlSW5wdXQsIGRvY3VtZW50VHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgY29uc3QgdGl0bGUgPSBzbHVnVGl0bGUoaW5wdXQudGl0bGUpO1xuICBjb25zdCBkb2N1bWVudFR5cGUgPSBub3JtYWxpemVEb2N1bWVudFR5cGUoaW5wdXQuZG9jdW1lbnRUeXBlLCBkb2N1bWVudFR5cGVzKTtcbiAgcmV0dXJuIGAtLS1cbnRpdGxlOiAke3RpdGxlfVxudHlwZTogZXh0ZXJuYWwtZmlsZVxuc3RhdHVzOiBhY3RpdmVcbmRvY3VtZW50X3R5cGU6ICR7eWFtbFNjYWxhcihkb2N1bWVudFR5cGUpfVxuc3RvcmFnZTogZXh0ZXJuYWxcbnN0b3JhZ2VfcHJvdmlkZXI6ICR7aW5wdXQucHJvdmlkZXJ9XG5zdG9yYWdlX2ZvbGRlcjogJHt5YW1sU3RyaW5nKGlucHV0LnJlbW90ZUZvbGRlcil9XG5yZW1vdGVfcGF0aDogJHt5YW1sU3RyaW5nKGlucHV0LnJlbW90ZVBhdGgpfVxuc2hhcmVfbGluazogJHtpbnB1dC5zaGFyZUxpbmsgPT09ICdub25lJyA/ICdub25lJyA6IHlhbWxTdHJpbmcoaW5wdXQuc2hhcmVMaW5rKX1cbm9yaWdpbmFsX2ZpbGVuYW1lOiAke3lhbWxTdHJpbmcoaW5wdXQub3JpZ2luYWxGaWxlbmFtZSl9XG51cGxvYWRfZmlsZW5hbWU6ICR7eWFtbFN0cmluZyhpbnB1dC51cGxvYWRGaWxlbmFtZSl9XG5maWxlX3NpemVfYnl0ZXM6ICR7aW5wdXQuc2l6ZX1cbmNvbnRleHRfdHlwZTogJHtpbnB1dC5jb250ZXh0VHlwZX1cbmNvbnRleHRfbmFtZTogJHt5YW1sU3RyaW5nKGlucHV0LmNvbnRleHROYW1lKX1cbmNyZWF0ZWQ6ICR7aW5wdXQuZGF0ZX1cbnVwZGF0ZWQ6ICR7aW5wdXQuZGF0ZX1cbi0tLVxuXG4jICR7dGl0bGV9XG5cblN0b3JlZCBvdXRzaWRlIHRoZSB2YXVsdC5cblxuU3RvcmFnZSBmb2xkZXI6IFxcYCR7aW5wdXQucmVtb3RlRm9sZGVyfVxcYFxuXG4jIyBPcGVuXG5cblxcYFxcYFxcYG1ldGEtYmluZC1idXR0b25cbmxhYmVsOiBPcGVuIEV4dGVybmFsIEZpbGVcbnN0eWxlOiBwcmltYXJ5XG5hY3Rpb246XG4gIHR5cGU6IGNvbW1hbmRcbiAgY29tbWFuZDogJHtDT01NQU5EX09QRU5fRVhURVJOQUxfRklMRX1cblxcYFxcYFxcYFxuXG4jIyBTdW1tYXJ5XG5cbi1cbmA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVFeHRlcm5hbEZpbGVUZXh0Rm9yRm9sZGVyUmVuYW1lKFxuICB0ZXh0OiBzdHJpbmcsXG4gIG9sZFBhdGg6IHN0cmluZyxcbiAgbmV3UGF0aDogc3RyaW5nLFxuICB0b2RheTogc3RyaW5nLFxuICByZW1vdGVSb290OiBzdHJpbmcsXG4gIGNvbnRleHRUeXBlczogc3RyaW5nW10sXG4pOiBzdHJpbmcge1xuICBjb25zdCBmbSA9IHBhcnNlRnJvbnRtYXR0ZXIodGV4dCk7XG4gIGNvbnN0IG9sZFN0b3JhZ2UgPSBmbS5zdG9yYWdlX2ZvbGRlciB8fCAnJztcbiAgY29uc3Qgb2xkUmVtb3RlID0gZm0ucmVtb3RlX3BhdGggfHwgZm0ucHJvdG9uX3BhdGggfHwgJyc7XG4gIGNvbnN0IGFmZmVjdGVkID0gZGVzY2VuZGFudE9yU2FtZShvbGRTdG9yYWdlLCBvbGRQYXRoKSB8fCBkZXNjZW5kYW50T3JTYW1lKG9sZFJlbW90ZSwgb2xkUGF0aCk7XG4gIGlmICghYWZmZWN0ZWQpIHJldHVybiB0ZXh0O1xuXG4gIGNvbnN0IHJlcGxhY2VkID0gcmVwbGFjZVBhdGhQcmVmaXgodGV4dCwgb2xkUGF0aCwgbmV3UGF0aCk7XG4gIGNvbnN0IG5ld1N0b3JhZ2UgPSBvbGRTdG9yYWdlID8gcmVwbGFjZVBhdGhQcmVmaXgob2xkU3RvcmFnZSwgb2xkUGF0aCwgbmV3UGF0aCkgOiAnJztcbiAgY29uc3QgdXBkYXRlcyA9IHtcbiAgICB1cGRhdGVkOiB7IHZhbHVlOiB0b2RheSB9LFxuICAgIC4uLihuZXdTdG9yYWdlID8ge1xuICAgICAgY29udGV4dF90eXBlOiB7IHZhbHVlOiBkZXJpdmVDb250ZXh0VHlwZShuZXdTdG9yYWdlLCByZW1vdGVSb290LCBjb250ZXh0VHlwZXMpIH0sXG4gICAgICBjb250ZXh0X25hbWU6IHsgdmFsdWU6IGRlcml2ZUNvbnRleHROYW1lKG5ld1N0b3JhZ2UsIHJlbW90ZVJvb3QpLCBxdW90ZTogdHJ1ZSB9LFxuICAgIH0gOiB7fSksXG4gIH07XG4gIHJldHVybiBzZXRGcm9udG1hdHRlckZpZWxkcyhyZXBsYWNlZCwgdXBkYXRlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrRXh0ZXJuYWxGaWxlVGV4dE1pc3NpbmcoXG4gIHRleHQ6IHN0cmluZyxcbiAgZm9sZGVyT3JGaWxlUGF0aDogc3RyaW5nLFxuICB0b2RheTogc3RyaW5nLFxuICByZWFzb24gPSAnRXh0ZXJuYWwgZmlsZSBub3QgZm91bmQnLFxuKTogc3RyaW5nIHtcbiAgY29uc3QgZm0gPSBwYXJzZUZyb250bWF0dGVyKHRleHQpO1xuICBjb25zdCBhZmZlY3RlZCA9IGRlc2NlbmRhbnRPclNhbWUoZm0uc3RvcmFnZV9mb2xkZXIgfHwgJycsIGZvbGRlck9yRmlsZVBhdGgpIHx8XG4gICAgZGVzY2VuZGFudE9yU2FtZShmbS5yZW1vdGVfcGF0aCB8fCBmbS5wcm90b25fcGF0aCB8fCAnJywgZm9sZGVyT3JGaWxlUGF0aCk7XG4gIGlmICghYWZmZWN0ZWQpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gc2V0RnJvbnRtYXR0ZXJGaWVsZHModGV4dCwge1xuICAgIHN0YXR1czogeyB2YWx1ZTogJ21pc3NpbmcnIH0sXG4gICAgdXBkYXRlZDogeyB2YWx1ZTogdG9kYXkgfSxcbiAgICBtaXNzaW5nX3JlYXNvbjogeyB2YWx1ZTogcmVhc29uLCBxdW90ZTogdHJ1ZSB9LFxuICB9KTtcbn1cbiIsICJleHBvcnQgdHlwZSBGcm9udG1hdHRlciA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgRnJvbnRtYXR0ZXJVcGRhdGUge1xuICBxdW90ZT86IGJvb2xlYW47XG4gIHJhdz86IGJvb2xlYW47XG4gIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGcm9udG1hdHRlcih0ZXh0OiBzdHJpbmcpOiBGcm9udG1hdHRlciB7XG4gIGNvbnN0IG1hdGNoID0gU3RyaW5nKHRleHQgfHwgJycpLm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLyk7XG4gIGNvbnN0IG91dDogRnJvbnRtYXR0ZXIgPSB7fTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG91dDtcbiAgZm9yIChjb25zdCBsaW5lIG9mIG1hdGNoWzFdLnNwbGl0KC9cXHI/XFxuLykpIHtcbiAgICBjb25zdCBpZHggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBpZiAoaWR4ID09PSAtMSkgY29udGludWU7XG4gICAgY29uc3Qga2V5ID0gbGluZS5zbGljZSgwLCBpZHgpLnRyaW0oKTtcbiAgICBsZXQgdmFsdWUgPSBsaW5lLnNsaWNlKGlkeCArIDEpLnRyaW0oKTtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL15cInxcIiQvZywgJycpO1xuICAgIG91dFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHlhbWxTdHJpbmcodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoU3RyaW5nKHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5YW1sU2NhbGFyKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgJy0nKS5yZXBsYWNlKC9cXHMrL2csICctJykudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEZyb250bWF0dGVyRmllbGRzKHRleHQ6IHN0cmluZywgdXBkYXRlczogUmVjb3JkPHN0cmluZywgRnJvbnRtYXR0ZXJVcGRhdGU+KTogc3RyaW5nIHtcbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKHRleHQgfHwgJycpO1xuICBjb25zdCBtYXRjaCA9IHNvdXJjZS5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS8pO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gc291cmNlO1xuXG4gIGNvbnN0IHJlbWFpbmluZyA9IHsgLi4udXBkYXRlcyB9O1xuICBjb25zdCBsaW5lcyA9IG1hdGNoWzFdLnNwbGl0KC9cXHI/XFxuLykubWFwKChsaW5lKSA9PiB7XG4gICAgY29uc3QgaWR4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgaWYgKGlkeCA9PT0gLTEpIHJldHVybiBsaW5lO1xuICAgIGNvbnN0IGtleSA9IGxpbmUuc2xpY2UoMCwgaWR4KS50cmltKCk7XG4gICAgY29uc3QgdXBkYXRlID0gcmVtYWluaW5nW2tleV07XG4gICAgaWYgKCF1cGRhdGUpIHJldHVybiBsaW5lO1xuICAgIGRlbGV0ZSByZW1haW5pbmdba2V5XTtcbiAgICByZXR1cm4gYCR7a2V5fTogJHtmcm9udG1hdHRlclZhbHVlKHVwZGF0ZSl9YDtcbiAgfSk7XG5cbiAgZm9yIChjb25zdCBba2V5LCB1cGRhdGVdIG9mIE9iamVjdC5lbnRyaWVzKHJlbWFpbmluZykpIHtcbiAgICBsaW5lcy5wdXNoKGAke2tleX06ICR7ZnJvbnRtYXR0ZXJWYWx1ZSh1cGRhdGUpfWApO1xuICB9XG5cbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKC9eLS0tXFxuW1xcc1xcU10qP1xcbi0tLS8sIGAtLS1cXG4ke2xpbmVzLmpvaW4oJ1xcbicpfVxcbi0tLWApO1xufVxuXG5mdW5jdGlvbiBmcm9udG1hdHRlclZhbHVlKHVwZGF0ZTogRnJvbnRtYXR0ZXJVcGRhdGUpOiBzdHJpbmcge1xuICBpZiAodXBkYXRlLnJhdykgcmV0dXJuIFN0cmluZyh1cGRhdGUudmFsdWUpO1xuICBpZiAodXBkYXRlLnZhbHVlID09PSAnbm9uZScpIHJldHVybiAnbm9uZSc7XG4gIGlmICh1cGRhdGUucXVvdGUpIHJldHVybiB5YW1sU3RyaW5nKHVwZGF0ZS52YWx1ZSk7XG4gIHJldHVybiBTdHJpbmcodXBkYXRlLnZhbHVlKTtcbn1cbiIsICJpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2x1Z1RpdGxlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICcnKS5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgJy0nKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUoaW5wdXQ6IHN0cmluZywgc291cmNlRmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc291cmNlRXh0ID0gcGF0aC5leHRuYW1lKHNvdXJjZUZpbGUgfHwgJycpO1xuICBsZXQgZmlsZW5hbWUgPSBTdHJpbmcoaW5wdXQgfHwgJycpLnRyaW0oKTtcbiAgaWYgKCFmaWxlbmFtZSAmJiBzb3VyY2VGaWxlKSBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoc291cmNlRmlsZSk7XG4gIGlmICghZmlsZW5hbWUpIHRocm93IG5ldyBFcnJvcignVXBsb2FkIGZpbGVuYW1lIGlzIHJlcXVpcmVkLicpO1xuICBpZiAoL1tcXFxcLzoqP1wiPD58XS8udGVzdChmaWxlbmFtZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VwbG9hZCBmaWxlbmFtZSBjYW5ub3QgY29udGFpbiAvIFxcXFwgOiAqID8gXCIgPCA+IHwnKTtcbiAgfVxuICBpZiAoIXBhdGguZXh0bmFtZShmaWxlbmFtZSkgJiYgc291cmNlRXh0KSBmaWxlbmFtZSArPSBzb3VyY2VFeHQ7XG4gIHJldHVybiBmaWxlbmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRUaXRsZUZvckZpbGUoZmlsZVBhdGg6IHN0cmluZywgbm93ID0gbmV3IERhdGUoKSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGUgPSBub3cudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gIGNvbnN0IHBhcnNlZCA9IHBhdGgucGFyc2UoZmlsZVBhdGggfHwgJycpO1xuICByZXR1cm4gc2x1Z1RpdGxlKGAke2RhdGV9ICR7cGFyc2VkLm5hbWUgfHwgJ0V4dGVybmFsIEZpbGUnfWApO1xufVxuIiwgImltcG9ydCB7IGV4ZWNGaWxlIGFzIGV4ZWNGaWxlQ2FsbGJhY2ssIHNwYXduU3luYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAnbm9kZTp1dGlsJztcbmltcG9ydCB7IGpvaW5SZW1vdGVQYXRoIH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcbmltcG9ydCB7IFN0b3JhZ2VQcm92aWRlciwgU3RvcmVkRmlsZSwgVXBsb2FkRmlsZUlucHV0IH0gZnJvbSAnLi9zdG9yYWdlUHJvdmlkZXInO1xuXG5jb25zdCBleGVjRmlsZSA9IHByb21pc2lmeShleGVjRmlsZUNhbGxiYWNrKTtcblxuaW50ZXJmYWNlIFByb3Rvbkl0ZW0ge1xuICBhY3RpdmVSZXZpc2lvbj86IHtcbiAgICBjbGFpbWVkU2l6ZT86IG51bWJlcjtcbiAgICBjcmVhdGlvblRpbWU/OiBzdHJpbmc7XG4gICAgc3RvcmFnZVNpemU/OiBudW1iZXI7XG4gIH07XG4gIGNyZWF0aW9uVGltZT86IHN0cmluZztcbiAgbWVkaWFUeXBlPzogc3RyaW5nO1xuICBtb2RpZmljYXRpb25UaW1lPzogc3RyaW5nO1xuICBuYW1lPzogc3RyaW5nIHwgeyBvaz86IGJvb2xlYW47IHZhbHVlPzogc3RyaW5nIH07XG4gIHRvdGFsU3RvcmFnZVNpemU/OiBudW1iZXI7XG4gIHR5cGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b25Ecml2ZUNsaVByb3ZpZGVyIGltcGxlbWVudHMgU3RvcmFnZVByb3ZpZGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBjbGlQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoY2xpUGF0aCA9IGZpbmRQcm90b25Ecml2ZUNsaSgpKSB7XG4gICAgdGhpcy5jbGlQYXRoID0gY2xpUGF0aDtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUZvbGRlcihwYXJlbnRQYXRoOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMucnVuKFsnZmlsZXN5c3RlbScsICdjcmVhdGUtZm9sZGVyJywgcGFyZW50UGF0aCwgbmFtZSwgJy0tanNvbiddKTtcbiAgfVxuXG4gIGFzeW5jIGRvd25sb2FkRmlsZShyZW1vdGVQYXRoOiBzdHJpbmcsIGRlc3RpbmF0aW9uRm9sZGVyOiBzdHJpbmcpOiBQcm9taXNlPFN0b3JlZEZpbGU+IHtcbiAgICBhd2FpdCB0aGlzLnJ1bihbJ2ZpbGVzeXN0ZW0nLCAnZG93bmxvYWQnLCAnLWYnLCAncmVtb3ZlJywgcmVtb3RlUGF0aCwgZGVzdGluYXRpb25Gb2xkZXJdKTtcbiAgICBjb25zdCBkb3dubG9hZGVkID0gcGF0aC5qb2luKGRlc3RpbmF0aW9uRm9sZGVyLCBwYXRoLmJhc2VuYW1lKHJlbW90ZVBhdGgpKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZG93bmxvYWRlZCkpIHRocm93IG5ldyBFcnJvcignRG93bmxvYWQgY29tcGxldGVkLCBidXQgZXhwZWN0ZWQgZmlsZSB3YXMgbm90IGZvdW5kLicpO1xuICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhkb3dubG9hZGVkKTtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kaWZpZWRUaW1lOiBzdGF0Lm10aW1lLnRvSVNPU3RyaW5nKCksXG4gICAgICBwYXRoOiBkb3dubG9hZGVkLFxuICAgICAgc2l6ZTogc3RhdC5zaXplLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBsaXN0Rm9sZGVycyhwYXJlbnRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ2xpc3QnLCBwYXJlbnRQYXRoLCAnLS1qc29uJ10pO1xuICAgIGNvbnN0IGl0ZW1zID0gSlNPTi5wYXJzZShyYXcgfHwgJ1tdJykgYXMgUHJvdG9uSXRlbVtdO1xuICAgIHJldHVybiBpdGVtc1xuICAgICAgLmZpbHRlcigoaXRlbSkgPT4gaXRlbSAmJiBpdGVtLnR5cGUgPT09ICdmb2xkZXInKVxuICAgICAgLm1hcChwcm90b25JdGVtTmFtZSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYikpO1xuICB9XG5cbiAgYXN5bmMgcmVuYW1lRm9sZGVyKG9sZFBhdGg6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ3JlbmFtZScsIG9sZFBhdGgsIG5ld05hbWVdKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXQocmVtb3RlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxTdG9yZWRGaWxlPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ2luZm8nLCByZW1vdGVQYXRoLCAnLS1qc29uJ10pO1xuICAgIGNvbnN0IGl0ZW0gPSBKU09OLnBhcnNlKHJhdyB8fCAne30nKSBhcyBQcm90b25JdGVtO1xuICAgIHJldHVybiB7XG4gICAgICBtb2RpZmllZFRpbWU6IG5ld2VzdFRpbWUoaXRlbSksXG4gICAgICBwYXRoOiByZW1vdGVQYXRoLFxuICAgICAgc2l6ZTogaXRlbS50b3RhbFN0b3JhZ2VTaXplIHx8IGl0ZW0uYWN0aXZlUmV2aXNpb24/LmNsYWltZWRTaXplIHx8IGl0ZW0uYWN0aXZlUmV2aXNpb24/LnN0b3JhZ2VTaXplIHx8IDAsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHRyYXNoRm9sZGVyKHJlbW90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMucnVuKFsnZmlsZXN5c3RlbScsICd0cmFzaCcsIHJlbW90ZVBhdGhdKTtcbiAgfVxuXG4gIGFzeW5jIHVwbG9hZEZpbGUoaW5wdXQ6IFVwbG9hZEZpbGVJbnB1dCk6IFByb21pc2U8U3RvcmVkRmlsZT4ge1xuICAgIGNvbnN0IHByZXBhcmVkID0gcHJlcGFyZVVwbG9hZEZpbGUoaW5wdXQubG9jYWxQYXRoLCBpbnB1dC5yZW1vdGVOYW1lKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ydW4oWydmaWxlc3lzdGVtJywgJ3VwbG9hZCcsICctZicsICdyZXBsYWNlJywgJy1kJywgJ21lcmdlJywgcHJlcGFyZWQudXBsb2FkUGF0aCwgaW5wdXQucmVtb3RlRm9sZGVyLCAnLS1qc29uJ10pO1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdChqb2luUmVtb3RlUGF0aChpbnB1dC5yZW1vdGVGb2xkZXIsIGlucHV0LnJlbW90ZU5hbWUpKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgcHJlcGFyZWQuY2xlYW51cCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcnVuKGFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY0ZpbGUodGhpcy5jbGlQYXRoLCBhcmdzLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0LnN0ZG91dCB8fCAnJztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgZGVjb3JhdGVDbGlFcnJvcih0aGlzLmNsaVBhdGgsIGFyZ3MsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRQcm90b25Ecml2ZUNsaSgpOiBzdHJpbmcge1xuICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgIHByb2Nlc3MuZW52LlBST1RPTl9EUklWRV9DTEksXG4gICAgJ3Byb3Rvbi1kcml2ZScsXG4gICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5sb2NhbC9iaW4vcHJvdG9uLWRyaXZlJyksXG4gICAgJy9vcHQvaG9tZWJyZXcvYmluL3Byb3Rvbi1kcml2ZScsXG4gICAgJy91c3IvbG9jYWwvYmluL3Byb3Rvbi1kcml2ZScsXG4gIF0uZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdO1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBjb25zdCBwcm9iZSA9IHNwYXduU3luYyhjYW5kaWRhdGUsIFsnLS1oZWxwJ10sIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICBpZiAocHJvYmUuc3RhdHVzID09PSAwKSByZXR1cm4gY2FuZGlkYXRlO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBwcm90b24tZHJpdmUgQ0xJLiBJbnN0YWxsIGl0IG9yIHNldCBQUk9UT05fRFJJVkVfQ0xJLicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNaXNzaW5nUmVtb3RlUGF0aEVycm9yKGVycm9yOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IGVyciA9IGVycm9yIGFzIHsgbWVzc2FnZT86IHN0cmluZzsgc3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmcgfTtcbiAgY29uc3QgbWVzc2FnZSA9IGAke2Vycj8ubWVzc2FnZSB8fCAnJ31cXG4ke2Vycj8uc3RkZXJyIHx8ICcnfVxcbiR7ZXJyPy5zdGRvdXQgfHwgJyd9YC50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gbWVzc2FnZS5pbmNsdWRlcygnbm90IGZvdW5kJykgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCdkb2VzIG5vdCBleGlzdCcpIHx8XG4gICAgbWVzc2FnZS5pbmNsdWRlcygnbm8gc3VjaCBmaWxlJykgfHxcbiAgICBtZXNzYWdlLmluY2x1ZGVzKCc0MDQnKTtcbn1cblxuZnVuY3Rpb24gcHJvdG9uSXRlbU5hbWUoaXRlbTogUHJvdG9uSXRlbSk6IHN0cmluZyB7XG4gIGlmICghaXRlbSkgcmV0dXJuICcnO1xuICBpZiAodHlwZW9mIGl0ZW0ubmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLm5hbWU7XG4gIGlmIChpdGVtLm5hbWUgJiYgdHlwZW9mIGl0ZW0ubmFtZS52YWx1ZSA9PT0gJ3N0cmluZycpIHJldHVybiBpdGVtLm5hbWUudmFsdWU7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gbmV3ZXN0VGltZShpdGVtOiBQcm90b25JdGVtKTogc3RyaW5nIHtcbiAgcmV0dXJuIGl0ZW0ubW9kaWZpY2F0aW9uVGltZSB8fCBpdGVtLmFjdGl2ZVJldmlzaW9uPy5jcmVhdGlvblRpbWUgfHwgaXRlbS5jcmVhdGlvblRpbWUgfHwgJyc7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVVcGxvYWRGaWxlKGxvY2FsUGF0aDogc3RyaW5nLCByZW1vdGVOYW1lOiBzdHJpbmcpOiB7IGNsZWFudXA6ICgpID0+IHZvaWQ7IHVwbG9hZFBhdGg6IHN0cmluZyB9IHtcbiAgaWYgKHBhdGguYmFzZW5hbWUobG9jYWxQYXRoKSA9PT0gcmVtb3RlTmFtZSkgcmV0dXJuIHsgdXBsb2FkUGF0aDogbG9jYWxQYXRoLCBjbGVhbnVwOiAoKSA9PiB1bmRlZmluZWQgfTtcbiAgY29uc3QgdGVtcERpciA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2ZpbGUtZXh0ZXJuYWxpemVyLXVwbG9hZC0nKSk7XG4gIGNvbnN0IHVwbG9hZFBhdGggPSBwYXRoLmpvaW4odGVtcERpciwgcmVtb3RlTmFtZSk7XG4gIGZzLmNvcHlGaWxlU3luYyhsb2NhbFBhdGgsIHVwbG9hZFBhdGgpO1xuICByZXR1cm4ge1xuICAgIHVwbG9hZFBhdGgsXG4gICAgY2xlYW51cDogKCkgPT4gZnMucm1TeW5jKHRlbXBEaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVjb3JhdGVDbGlFcnJvcihjbGlQYXRoOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBlcnJvcjogdW5rbm93bik6IEVycm9yIHtcbiAgY29uc3QgZXJyID0gZXJyb3IgYXMgRXJyb3IgJiB7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH07XG4gIGNvbnN0IGRldGFpbHMgPSBbXG4gICAgZXJyLm1lc3NhZ2UsXG4gICAgZXJyLnN0ZGVyciAmJiBgc3RkZXJyOiAke2Vyci5zdGRlcnIudHJpbSgpfWAsXG4gICAgZXJyLnN0ZG91dCAmJiBgc3Rkb3V0OiAke2Vyci5zdGRvdXQudHJpbSgpfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICBjb25zdCB3cmFwcGVkID0gbmV3IEVycm9yKGAke2NsaVBhdGh9ICR7YXJncy5qb2luKCcgJyl9IGZhaWxlZCR7ZGV0YWlscyA/IGBcXG4ke2RldGFpbHN9YCA6ICcnfWApO1xuICAod3JhcHBlZCBhcyBFcnJvciAmIHsgc3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmcgfSkuc3RkZXJyID0gZXJyLnN0ZGVycjtcbiAgKHdyYXBwZWQgYXMgRXJyb3IgJiB7IHN0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nIH0pLnN0ZG91dCA9IGVyci5zdGRvdXQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuIiwgImltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBzYWZlUmVsYXRpdmVSZW1vdGVQYXRoIH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcblxuaW50ZXJmYWNlIENhY2hlRW50cnkge1xuICBjYWNoZWRBdDogc3RyaW5nO1xuICBjYWNoZVBhdGg6IHN0cmluZztcbiAgcmVtb3RlVGltZTogc3RyaW5nO1xufVxuXG50eXBlIENhY2hlSW5kZXggPSBSZWNvcmQ8c3RyaW5nLCBDYWNoZUVudHJ5PjtcblxuZXhwb3J0IGNsYXNzIENhY2hlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdmF1bHRQYXRoOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjYWNoZUZvbGRlcjogc3RyaW5nLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVtb3RlUm9vdDogc3RyaW5nLFxuICApIHt9XG5cbiAgY2FjaGVQYXRoRm9yUmVtb3RlKHJlbW90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLmNhY2hlUm9vdCgpLCBzYWZlUmVsYXRpdmVSZW1vdGVQYXRoKHJlbW90ZVBhdGgsIHRoaXMucmVtb3RlUm9vdCkpO1xuICB9XG5cbiAgc2VlZEZyb21Mb2NhbEZpbGUobG9jYWxQYXRoOiBzdHJpbmcsIHJlbW90ZVBhdGg6IHN0cmluZywgcmVtb3RlVGltZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2FjaGVQYXRoID0gdGhpcy5jYWNoZVBhdGhGb3JSZW1vdGUocmVtb3RlUGF0aCk7XG4gICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShjYWNoZVBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICBmcy5jb3B5RmlsZVN5bmMobG9jYWxQYXRoLCBjYWNoZVBhdGgpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5yZWFkSW5kZXgoKTtcbiAgICBpbmRleFtyZW1vdGVQYXRoXSA9IHtcbiAgICAgIGNhY2hlUGF0aDogcGF0aC5yZWxhdGl2ZSh0aGlzLnZhdWx0UGF0aCwgY2FjaGVQYXRoKSxcbiAgICAgIHJlbW90ZVRpbWUsXG4gICAgICBjYWNoZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG4gICAgdGhpcy53cml0ZUluZGV4KGluZGV4KTtcbiAgfVxuXG4gIGhhcyhyZW1vdGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyh0aGlzLmNhY2hlUGF0aEZvclJlbW90ZShyZW1vdGVQYXRoKSk7XG4gIH1cblxuICByZW1hcEZvbGRlcihvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG9sZENhY2hlUGF0aCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKG9sZFBhdGgpO1xuICAgIGNvbnN0IG5ld0NhY2hlUGF0aCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKG5ld1BhdGgpO1xuICAgIG1lcmdlTW92ZVBhdGgob2xkQ2FjaGVQYXRoLCBuZXdDYWNoZVBhdGgpO1xuICAgIHJlbW92ZUVtcHR5UGFyZW50cyhwYXRoLmRpcm5hbWUob2xkQ2FjaGVQYXRoKSwgdGhpcy5jYWNoZVJvb3QoKSk7XG5cbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmVhZEluZGV4KCk7XG4gICAgY29uc3QgbmV4dDogQ2FjaGVJbmRleCA9IHt9O1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGluZGV4KSkge1xuICAgICAgaWYgKGtleSA9PT0gb2xkUGF0aCB8fCBrZXkuc3RhcnRzV2l0aChgJHtvbGRQYXRofS9gKSkge1xuICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkucmVwbGFjZShvbGRQYXRoLCBuZXdQYXRoKTtcbiAgICAgICAgbmV4dFtuZXdLZXldID0ge1xuICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgIGNhY2hlUGF0aDogcGF0aC5yZWxhdGl2ZSh0aGlzLnZhdWx0UGF0aCwgdGhpcy5jYWNoZVBhdGhGb3JSZW1vdGUobmV3S2V5KSksXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53cml0ZUluZGV4KG5leHQpO1xuICB9XG5cbiAgcmVtb3ZlRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuY2FjaGVQYXRoRm9yUmVtb3RlKGZvbGRlclBhdGgpO1xuICAgIGZzLnJtU3luYyh0YXJnZXQsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICByZW1vdmVFbXB0eVBhcmVudHMocGF0aC5kaXJuYW1lKHRhcmdldCksIHRoaXMuY2FjaGVSb290KCkpO1xuXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnJlYWRJbmRleCgpO1xuICAgIGNvbnN0IG5leHQ6IENhY2hlSW5kZXggPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhpbmRleCkpIHtcbiAgICAgIGlmIChrZXkgIT09IGZvbGRlclBhdGggJiYgIWtleS5zdGFydHNXaXRoKGAke2ZvbGRlclBhdGh9L2ApKSBuZXh0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdGhpcy53cml0ZUluZGV4KG5leHQpO1xuICB9XG5cbiAgY2FjaGVSb290KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnZhdWx0UGF0aCwgdGhpcy5jYWNoZUZvbGRlcik7XG4gIH1cblxuICBpbmRleFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuY2FjaGVSb290KCksICcuY2FjaGUtaW5kZXguanNvbicpO1xuICB9XG5cbiAgcmVhZEluZGV4KCk6IENhY2hlSW5kZXgge1xuICAgIGNvbnN0IGluZGV4UGF0aCA9IHRoaXMuaW5kZXhQYXRoKCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGluZGV4UGF0aCkpIHJldHVybiB7fTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGluZGV4UGF0aCwgJ3V0ZjgnKSkgYXMgQ2FjaGVJbmRleDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICB3cml0ZUluZGV4KGluZGV4OiBDYWNoZUluZGV4KTogdm9pZCB7XG4gICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZSh0aGlzLmluZGV4UGF0aCgpKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmluZGV4UGF0aCgpLCBKU09OLnN0cmluZ2lmeShpbmRleCwgbnVsbCwgMikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlTW92ZVBhdGgoZnJvbVBhdGg6IHN0cmluZywgdG9QYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZyb21QYXRoKSkgcmV0dXJuO1xuICBpZiAoIWZzLmV4aXN0c1N5bmModG9QYXRoKSkge1xuICAgIGZzLm1rZGlyU3luYyhwYXRoLmRpcm5hbWUodG9QYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgZnMucmVuYW1lU3luYyhmcm9tUGF0aCwgdG9QYXRoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZyb21QYXRoKTtcbiAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgIGZzLm1rZGlyU3luYyh0b1BhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBmcy5yZWFkZGlyU3luYyhmcm9tUGF0aCkpIHtcbiAgICAgIG1lcmdlTW92ZVBhdGgocGF0aC5qb2luKGZyb21QYXRoLCBuYW1lKSwgcGF0aC5qb2luKHRvUGF0aCwgbmFtZSkpO1xuICAgIH1cbiAgICBmcy5ybVN5bmMoZnJvbVBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBmcy5ta2RpclN5bmMocGF0aC5kaXJuYW1lKHRvUGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGZzLnJtU3luYyh0b1BhdGgsIHsgZm9yY2U6IHRydWUgfSk7XG4gICAgZnMucmVuYW1lU3luYyhmcm9tUGF0aCwgdG9QYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVFbXB0eVBhcmVudHMoc3RhcnRQYXRoOiBzdHJpbmcsIHN0b3BQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgbGV0IGN1cnJlbnQgPSBzdGFydFBhdGg7XG4gIGNvbnN0IHN0b3AgPSBwYXRoLnJlc29sdmUoc3RvcFBhdGgpO1xuICB3aGlsZSAocGF0aC5yZXNvbHZlKGN1cnJlbnQpLnN0YXJ0c1dpdGgoc3RvcCkgJiYgcGF0aC5yZXNvbHZlKGN1cnJlbnQpICE9PSBzdG9wKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGN1cnJlbnQpICYmIGZzLnJlYWRkaXJTeW5jKGN1cnJlbnQpLmxlbmd0aCA9PT0gMCkgZnMucm1kaXJTeW5jKGN1cnJlbnQpO1xuICAgICAgZWxzZSByZXR1cm47XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN1cnJlbnQgPSBwYXRoLmRpcm5hbWUoY3VycmVudCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgRG9jdW1lbnRUeXBlIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IG5vcm1hbGl6ZURvY3VtZW50VHlwZSB9IGZyb20gJy4uL2RvbWFpbi9kb2N1bWVudFR5cGUnO1xuaW1wb3J0IHsgZGVmYXVsdFRpdGxlRm9yRmlsZSwgbm9ybWFsaXplVXBsb2FkRmlsZW5hbWUgfSBmcm9tICcuLi9kb21haW4vZmlsZW5hbWUnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNlcnZpY2UsIFJlZ2lzdGVyRmlsZUlucHV0IH0gZnJvbSAnLi4vc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UnO1xuaW1wb3J0IHsgRmlsZUV4dGVybmFsaXplclNldHRpbmdzIH0gZnJvbSAnLi4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgRm9sZGVyUGlja2VyTW9kYWwgfSBmcm9tICcuL2ZvbGRlclBpY2tlck1vZGFsJztcblxuaW50ZXJmYWNlIE5hdGl2ZUZpbGVSZXN1bHQge1xuICBjYW5jZWxlZD86IGJvb2xlYW47XG4gIHBhdGg/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWdpc3RlckZpbGVNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZXM6IFJlZ2lzdGVyRmlsZUlucHV0O1xuICBwcml2YXRlIGRlc3RpbmF0aW9uRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgZXJyb3JFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBmaWxlU3RhdHVzRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcGFzdGVQYXRoU2V0dGluZzogU2V0dGluZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRpdGxlSW5wdXQ6IHsgc2V0VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRpdGxlV2FzQXV0byA9IHRydWU7XG4gIHByaXZhdGUgdXBsb2FkRmlsZW5hbWVJbnB1dDogeyBzZXRWYWx1ZSh2YWx1ZTogc3RyaW5nKTogdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdXBsb2FkRmlsZW5hbWVXYXNBdXRvID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2U6IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2V0dGluZ3M6IEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5ncyxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnZhbHVlcyA9IHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIHVwbG9hZEZpbGVuYW1lOiAnJyxcbiAgICAgIGRvY3VtZW50VHlwZTogJ090aGVyJyxcbiAgICAgIGRlc3RpbmF0aW9uRm9sZGVyOiBzZXR0aW5ncy5yZW1vdGVSb290LFxuICAgICAgc2hhcmVMaW5rOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItbW9kYWwnKTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnUmVnaXN0ZXIgRXh0ZXJuYWwgRmlsZScgfSk7XG5cbiAgICB0aGlzLmVycm9yRWwgPSBjb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItZXJyb3InIH0pO1xuICAgIHRoaXMuZXJyb3JFbC5oaWRlKCk7XG5cbiAgICBjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGZpbGVJbnB1dC50eXBlID0gJ2ZpbGUnO1xuICAgIGZpbGVJbnB1dC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItaGlkZGVuJyk7XG4gICAgY29udGVudEVsLmFwcGVuZENoaWxkKGZpbGVJbnB1dCk7XG4gICAgZmlsZUlucHV0Lm9uY2hhbmdlID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2hvc2VuID0gZmlsZUlucHV0LmZpbGVzICYmIGZpbGVJbnB1dC5maWxlc1swXTtcbiAgICAgIGNvbnN0IGNob3NlblBhdGggPSBnZXRGaWxlUGF0aEZyb21JbnB1dEZpbGUoY2hvc2VuKTtcbiAgICAgIGlmICghY2hvc2VuUGF0aCkge1xuICAgICAgICB0aGlzLnNob3dQYXN0ZVBhdGhGaWVsZCgpO1xuICAgICAgICB0aGlzLnNob3dFcnJvcignVGhlIGZhbGxiYWNrIHBpY2tlciBjb3VsZCBub3QgZXhwb3NlIHRoZSBzZWxlY3RlZCBmaWxlIHBhdGguIFBhc3RlIHRoZSBwYXRoIGJlbG93IGluc3RlYWQuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVBhdGgoY2hvc2VuUGF0aCk7XG4gICAgfTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdMb2NhbCBmaWxlJylcbiAgICAgIC5zZXREZXNjKCdDaG9vc2UgdGhlIGZpbGUgZnJvbSB5b3VyIGNvbXB1dGVyLiBUaGUgcGx1Z2luIHVwbG9hZHMgaXQgdG8gdGhlIHNlbGVjdGVkIGV4dGVybmFsIHN0b3JhZ2UgZm9sZGVyIGFuZCBjcmVhdGVzIGFuIE9ic2lkaWFuIG5vdGUgZm9yIGl0LicpXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ0Nob29zZSBmaWxlJyk7XG4gICAgICAgIGJ1dHRvbi5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hvb3NlV2l0aEVsZWN0cm9uRGlhbG9nKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnBhdGgpIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRGaWxlUGF0aChyZXN1bHQucGF0aCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQuY2FuY2VsZWQpIHJldHVybjtcbiAgICAgICAgICAgIGZpbGVJbnB1dC5jbGljaygpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdOYXRpdmUgZmlsZSBwaWNrZXIgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1Bhc3RlUGF0aEZpZWxkKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvcignVGhlIG5hdGl2ZSBmaWxlIHBpY2tlciBmYWlsZWQuIFBhc3RlIHRoZSBmaWxlIHBhdGggYmVsb3cgaW5zdGVhZC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLmZpbGVTdGF0dXNFbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2Jywge1xuICAgICAgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItcGF0aCcsXG4gICAgICB0ZXh0OiAnTm8gZmlsZSBzZWxlY3RlZCB5ZXQuJyxcbiAgICB9KTtcblxuICAgIHRoaXMucGFzdGVQYXRoU2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdQYXN0ZSBmaWxlIHBhdGgnKVxuICAgICAgLnNldERlc2MoJ0ZhbGxiYWNrIG9ubHkuIFRoaXMgYXBwZWFycyB3aGVuIE9ic2lkaWFuIGNhbm5vdCBnZXQgYSB1c2FibGUgcGF0aCBmcm9tIHRoZSBmaWxlIHBpY2tlci4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcignL3BhdGgvdG8vZmlsZS5wZGYnKTtcbiAgICAgICAgdGV4dC5vbkNoYW5nZSgodmFsdWUpID0+IHRoaXMuc2V0RmlsZVBhdGgodmFsdWUudHJpbSgpLCBmYWxzZSkpO1xuICAgICAgfSk7XG4gICAgdGhpcy5wYXN0ZVBhdGhTZXR0aW5nLnNldHRpbmdFbC5hZGRDbGFzcygnZmlsZS1leHRlcm5hbGl6ZXItaGlkZGVuJyk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZSgnTm90ZSB0aXRsZScpXG4gICAgICAuc2V0RGVzYygnVGhpcyBiZWNvbWVzIHRoZSB0aXRsZSBvZiB0aGUgT2JzaWRpYW4gbm90ZS4gSXQgZG9lcyBub3QgcmVuYW1lIHRoZSB1cGxvYWRlZCBleHRlcm5hbCBmaWxlLicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgICB0aGlzLnRpdGxlSW5wdXQgPSB0ZXh0O1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKCdDaG9vc2UgYSBmaWxlIHRvIGdlbmVyYXRlIGEgdGl0bGUnKTtcbiAgICAgICAgdGV4dC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbHVlcy50aXRsZSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICB0aGlzLnRpdGxlV2FzQXV0byA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ1VwbG9hZCBmaWxlbmFtZScpXG4gICAgICAuc2V0RGVzYygnVGhpcyBpcyB0aGUgZmlsZW5hbWUgc3RvcmVkIGV4dGVybmFsbHkuIElmIHlvdSBvbWl0IHRoZSBleHRlbnNpb24sIHRoZSBzb3VyY2UgZmlsZSBleHRlbnNpb24gaXMgYWRkZWQgYXV0b21hdGljYWxseS4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGhpcy51cGxvYWRGaWxlbmFtZUlucHV0ID0gdGV4dDtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcignQ2hvb3NlIGEgZmlsZSB0byBnZW5lcmF0ZSBhIGZpbGVuYW1lJyk7XG4gICAgICAgIHRleHQub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgdGhpcy51cGxvYWRGaWxlbmFtZVdhc0F1dG8gPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmhpZGVFcnJvcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ0RvY3VtZW50IHR5cGUnKVxuICAgICAgLnNldERlc2MoJ1RoaXMgY29udHJvbHMgd2hlcmUgdGhlIE9ic2lkaWFuIGV4dGVybmFsLWZpbGUgbm90ZSBpcyBmaWxlZC4gSXQgZG9lcyBub3QgZm9yY2UgYW4gZXh0ZXJuYWwgZm9sZGVyIGxheW91dC4nKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKSBkcm9wZG93bi5hZGRPcHRpb24odHlwZSwgdHlwZSk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMudmFsdWVzLmRvY3VtZW50VHlwZSk7XG4gICAgICAgIGRyb3Bkb3duLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsdWVzLmRvY3VtZW50VHlwZSA9IG5vcm1hbGl6ZURvY3VtZW50VHlwZSh2YWx1ZSwgdGhpcy5zZXR0aW5ncy5kb2N1bWVudFR5cGVzKSBhcyBEb2N1bWVudFR5cGU7XG4gICAgICAgICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKCdEZXN0aW5hdGlvbiBmb2xkZXInKVxuICAgICAgLnNldERlc2MoJ0Nob29zZSB0aGUgZXhhY3QgZXh0ZXJuYWwgc3RvcmFnZSBmb2xkZXIgd2hlcmUgdGhpcyBmaWxlIHNob3VsZCBiZSB1cGxvYWRlZC4nKVxuICAgICAgLmFkZEJ1dHRvbigoYnV0dG9uKSA9PiBidXR0b25cbiAgICAgICAgLnNldEJ1dHRvblRleHQoJ0Nob29zZSBmb2xkZXInKVxuICAgICAgICAub25DbGljaygoKSA9PiB0aGlzLm9wZW5Gb2xkZXJQaWNrZXIoKSkpO1xuXG4gICAgdGhpcy5kZXN0aW5hdGlvbkVsID0gY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1wYXRoJyxcbiAgICAgIHRleHQ6IGBEZXN0aW5hdGlvbjogJHt0aGlzLnZhbHVlcy5kZXN0aW5hdGlvbkZvbGRlcn1gLFxuICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoJ0NyZWF0ZSBzaGFyZSBsaW5rJylcbiAgICAgIC5zZXREZXNjKCdOb3QgaW1wbGVtZW50ZWQgeWV0IGZvciBwcm92aWRlci1uZXV0cmFsIHN0b3JhZ2UuIExlYXZlIG9mZiBmb3Igbm93LicpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+IHtcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMudmFsdWVzLnNoYXJlTGluayk7XG4gICAgICAgIHRvZ2dsZS5zZXREaXNhYmxlZCh0cnVlKTtcbiAgICAgICAgdG9nZ2xlLm9uQ2hhbmdlKCh2YWx1ZSkgPT4geyB0aGlzLnZhbHVlcy5zaGFyZUxpbmsgPSB2YWx1ZTsgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5hZGRCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnUmVnaXN0ZXIgZmlsZScpO1xuICAgICAgICBidXR0b24uc2V0Q3RhKCk7XG4gICAgICAgIGJ1dHRvbi5vbkNsaWNrKCgpID0+IHsgdm9pZCB0aGlzLnN1Ym1pdCgpOyB9KTtcbiAgICAgIH0pXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ0NhbmNlbCcpO1xuICAgICAgICBidXR0b24ub25DbGljaygoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHNldEZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcsIHVwZGF0ZVRpdGxlID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZpb3VzRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMudmFsdWVzLmZpbGVQYXRoIHx8ICcnKTtcbiAgICB0aGlzLnZhbHVlcy5maWxlUGF0aCA9IGZpbGVQYXRoO1xuICAgIGlmICh0aGlzLmZpbGVTdGF0dXNFbCkge1xuICAgICAgdGhpcy5maWxlU3RhdHVzRWwuc2V0VGV4dChmaWxlUGF0aCA/IGBTZWxlY3RlZCBzb3VyY2UgZmlsZTogJHtmaWxlUGF0aH1gIDogJ05vIGZpbGUgc2VsZWN0ZWQgeWV0LicpO1xuICAgIH1cblxuICAgIGlmIChmaWxlUGF0aCAmJiAodGhpcy51cGxvYWRGaWxlbmFtZVdhc0F1dG8gfHwgIXRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lIHx8IHRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lID09PSBwcmV2aW91c0ZpbGVOYW1lKSkge1xuICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMudXBsb2FkRmlsZW5hbWVXYXNBdXRvID0gdHJ1ZTtcbiAgICAgIHRoaXMudXBsb2FkRmlsZW5hbWVJbnB1dD8uc2V0VmFsdWUodGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUpO1xuICAgIH1cblxuICAgIGlmIChmaWxlUGF0aCAmJiB1cGRhdGVUaXRsZSAmJiAodGhpcy50aXRsZVdhc0F1dG8gfHwgIXRoaXMudmFsdWVzLnRpdGxlKSkge1xuICAgICAgY29uc3QgZ2VuZXJhdGVkID0gZGVmYXVsdFRpdGxlRm9yRmlsZShmaWxlUGF0aCk7XG4gICAgICB0aGlzLnZhbHVlcy50aXRsZSA9IGdlbmVyYXRlZDtcbiAgICAgIHRoaXMudGl0bGVXYXNBdXRvID0gdHJ1ZTtcbiAgICAgIHRoaXMudGl0bGVJbnB1dD8uc2V0VmFsdWUoZ2VuZXJhdGVkKTtcbiAgICB9XG4gICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd1Bhc3RlUGF0aEZpZWxkKCk6IHZvaWQge1xuICAgIHRoaXMucGFzdGVQYXRoU2V0dGluZz8uc2V0dGluZ0VsLnJlbW92ZUNsYXNzKCdmaWxlLWV4dGVybmFsaXplci1oaWRkZW4nKTtcbiAgfVxuXG4gIHByaXZhdGUgb3BlbkZvbGRlclBpY2tlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MucmVtb3RlUm9vdCkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ0NvbmZpZ3VyZSBGaWxlIEV4dGVybmFsaXplciByZW1vdGUgcm9vdCBpbiBwbHVnaW4gc2V0dGluZ3MgZmlyc3QuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5ldyBGb2xkZXJQaWNrZXJNb2RhbCh0aGlzLmFwcCwgdGhpcy5zZXJ2aWNlLCB0aGlzLnNldHRpbmdzLnJlbW90ZVJvb3QsIHRoaXMudmFsdWVzLmRlc3RpbmF0aW9uRm9sZGVyLCAoZm9sZGVyUGF0aCkgPT4ge1xuICAgICAgdGhpcy52YWx1ZXMuZGVzdGluYXRpb25Gb2xkZXIgPSBmb2xkZXJQYXRoO1xuICAgICAgdGhpcy51cGRhdGVEZXN0aW5hdGlvblByZXZpZXcoKTtcbiAgICAgIHRoaXMuaGlkZUVycm9yKCk7XG4gICAgfSkub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVEZXN0aW5hdGlvblByZXZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbkVsPy5zZXRUZXh0KGBEZXN0aW5hdGlvbjogJHt0aGlzLnZhbHVlcy5kZXN0aW5hdGlvbkZvbGRlcn1gKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd0Vycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5lcnJvckVsKSByZXR1cm47XG4gICAgdGhpcy5lcnJvckVsLnNldFRleHQobWVzc2FnZSk7XG4gICAgdGhpcy5lcnJvckVsLnNob3coKTtcbiAgfVxuXG4gIHByaXZhdGUgaGlkZUVycm9yKCk6IHZvaWQge1xuICAgIHRoaXMuZXJyb3JFbD8uaGlkZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzdWJtaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnZhbHVlcy5maWxlUGF0aCkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ0Nob29zZSBhIGZpbGUgZmlyc3QuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy52YWx1ZXMudGl0bGUpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKCdBZGQgYSBub3RlIHRpdGxlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy52YWx1ZXMudXBsb2FkRmlsZW5hbWUgPSBub3JtYWxpemVVcGxvYWRGaWxlbmFtZSh0aGlzLnZhbHVlcy51cGxvYWRGaWxlbmFtZSwgdGhpcy52YWx1ZXMuZmlsZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVwbG9hZEZpbGVuYW1lSW5wdXQ/LnNldFZhbHVlKHRoaXMudmFsdWVzLnVwbG9hZEZpbGVuYW1lKTtcbiAgICB0aGlzLnZhbHVlcy5kb2N1bWVudFR5cGUgPSBub3JtYWxpemVEb2N1bWVudFR5cGUodGhpcy52YWx1ZXMuZG9jdW1lbnRUeXBlLCB0aGlzLnNldHRpbmdzLmRvY3VtZW50VHlwZXMpO1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5yZW1vdGVSb290KSB7XG4gICAgICB0aGlzLnNob3dFcnJvcignQ29uZmlndXJlIEZpbGUgRXh0ZXJuYWxpemVyIHJlbW90ZSByb290IGluIHBsdWdpbiBzZXR0aW5ncyBmaXJzdC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBOb3RpY2UoJ1VwbG9hZGluZyBleHRlcm5hbCBmaWxlLi4uJywgMCk7XG4gICAgYXdhaXQgc2xlZXAoNzUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2VydmljZS5yZWdpc3RlckZpbGUodGhpcy52YWx1ZXMpO1xuICAgICAgcHJvZ3Jlc3MuaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShgQ3JlYXRlZCAke3Jlc3VsdC5saW5rfWApO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLm9wZW5DcmVhdGVkTm90ZShyZXN1bHQubm90ZVBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBwcm9ncmVzcy5oaWRlKCk7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgdGhpcy5zaG93RXJyb3IobWVzc2FnZSk7XG4gICAgICBuZXcgTm90aWNlKCdSZWdpc3RlciBGaWxlIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignUmVnaXN0ZXIgRmlsZSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGaWxlUGF0aEZyb21JbnB1dEZpbGUoZmlsZTogRmlsZSB8IG51bGwpOiBzdHJpbmcge1xuICByZXR1cm4gZmlsZSAmJiAoJ3BhdGgnIGluIGZpbGUgfHwgJ3dlYmtpdFJlbGF0aXZlUGF0aCcgaW4gZmlsZSlcbiAgICA/IFN0cmluZygoZmlsZSBhcyBGaWxlICYgeyBwYXRoPzogc3RyaW5nIH0pLnBhdGggfHwgZmlsZS53ZWJraXRSZWxhdGl2ZVBhdGggfHwgJycpXG4gICAgOiAnJztcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hvb3NlV2l0aEVsZWN0cm9uRGlhbG9nKCk6IFByb21pc2U8TmF0aXZlRmlsZVJlc3VsdD4ge1xuICBjb25zdCBkaWFsb2cgPSBnZXRFbGVjdHJvbkRpYWxvZygpO1xuICBpZiAoIWRpYWxvZyB8fCB0eXBlb2YgZGlhbG9nLnNob3dPcGVuRGlhbG9nICE9PSAnZnVuY3Rpb24nKSByZXR1cm4ge307XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGlhbG9nLnNob3dPcGVuRGlhbG9nKHtcbiAgICB0aXRsZTogJ0Nob29zZSBleHRlcm5hbCBmaWxlJyxcbiAgICBwcm9wZXJ0aWVzOiBbJ29wZW5GaWxlJ10sXG4gIH0pO1xuXG4gIGlmICghcmVzdWx0IHx8IHJlc3VsdC5jYW5jZWxlZCkgcmV0dXJuIHsgY2FuY2VsZWQ6IHRydWUgfTtcbiAgaWYgKCFyZXN1bHQuZmlsZVBhdGhzIHx8ICFyZXN1bHQuZmlsZVBhdGhzLmxlbmd0aCkgcmV0dXJuIHsgcGF0aDogJycgfTtcbiAgcmV0dXJuIHsgcGF0aDogcmVzdWx0LmZpbGVQYXRoc1swXSB9O1xufVxuXG5mdW5jdGlvbiBnZXRFbGVjdHJvbkRpYWxvZygpOiB7IHNob3dPcGVuRGlhbG9nPzogKG9wdGlvbnM6IHVua25vd24pID0+IFByb21pc2U8eyBjYW5jZWxlZD86IGJvb2xlYW47IGZpbGVQYXRocz86IHN0cmluZ1tdIH0+IH0gfCBudWxsIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJykgYXMge1xuICAgICAgZGlhbG9nPzogdW5rbm93bjtcbiAgICAgIHJlbW90ZT86IHsgZGlhbG9nPzogdW5rbm93biB9O1xuICAgIH07XG4gICAgcmV0dXJuIChlbGVjdHJvbi5yZW1vdGU/LmRpYWxvZyB8fCBlbGVjdHJvbi5kaWFsb2cgfHwgbnVsbCkgYXMgeyBzaG93T3BlbkRpYWxvZz86IChvcHRpb25zOiB1bmtub3duKSA9PiBQcm9taXNlPHsgY2FuY2VsZWQ/OiBib29sZWFuOyBmaWxlUGF0aHM/OiBzdHJpbmdbXSB9PiB9IHwgbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBqb2luUmVtb3RlUGF0aCwgbm9ybWFsaXplUmVtb3RlRm9sZGVyLCBwYXJlbnRSZW1vdGVQYXRoLCBwYXRoTmFtZSwgaXNSZW1vdGVSb290LCBkZXNjZW5kYW50T3JTYW1lIH0gZnJvbSAnLi4vZG9tYWluL3BhdGhzJztcbmltcG9ydCB7IEZpbGVFeHRlcm5hbGl6ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvZmlsZUV4dGVybmFsaXplclNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlybVRleHRNb2RhbCwgTmV3Rm9sZGVyTW9kYWwsIFJlbmFtZUZvbGRlck1vZGFsIH0gZnJvbSAnLi9zaW1wbGVNb2RhbHMnO1xuXG5leHBvcnQgY2xhc3MgRm9sZGVyUGlja2VyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBmb2xkZXJDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBsb2FkaW5nID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgZXJyb3JFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwYXRoRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc2VsZWN0ZWRQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgdHJlZUVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VydmljZTogRmlsZUV4dGVybmFsaXplclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSByZW1vdGVSb290OiBzdHJpbmcsXG4gICAgaW5pdGlhbFBhdGg6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hvb3NlOiAoZm9sZGVyUGF0aDogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuc2VsZWN0ZWRQYXRoID0gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGluaXRpYWxQYXRoLCByZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZGVkLmFkZChyZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgdGhpcy5tb2RhbEVsLmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1tb2RhbC1mcmFtZScpO1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQ2hvb3NlIERlc3RpbmF0aW9uIEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1oZWxwJyxcbiAgICAgIHRleHQ6ICdTZWxlY3QgYSBmb2xkZXIgaW4gdGhlIHRyZWUuIEZvbGRlciBsaXN0cyBhcmUgY2FjaGVkIHdoaWxlIHRoaXMgcGlja2VyIGlzIG9wZW4sIGFuZCBuZWFyYnkgZm9sZGVycyBwcmVsb2FkIGluIHRoZSBiYWNrZ3JvdW5kLicsXG4gICAgfSk7XG5cbiAgICB0aGlzLnBhdGhFbCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWN1cnJlbnQtcGF0aCcgfSk7XG4gICAgdGhpcy5lcnJvckVsID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItZXJyb3InIH0pO1xuICAgIHRoaXMuZXJyb3JFbC5oaWRlKCk7XG5cbiAgICBjb25zdCB0b29sYmFyID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdG9vbGJhcicgfSk7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24odG9vbGJhciwgJ1VzZSBzZWxlY3RlZCBmb2xkZXInLCAnbW9kLWN0YScsICgpID0+IHRoaXMuY2hvb3NlKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdOZXcgZm9sZGVyJywgJycsICgpID0+IHRoaXMuY3JlYXRlRm9sZGVyU2VsZWN0ZWQoKSk7XG4gICAgdGhpcy5jcmVhdGVCdXR0b24odG9vbGJhciwgJ1JlbmFtZSBzZWxlY3RlZCcsICcnLCAoKSA9PiB0aGlzLnJlbmFtZVNlbGVjdGVkKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdEZWxldGUgc2VsZWN0ZWQnLCAnbW9kLXdhcm5pbmcnLCAoKSA9PiB0aGlzLmRlbGV0ZVNlbGVjdGVkKCkpO1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKHRvb2xiYXIsICdSZWZyZXNoJywgJycsICgpID0+IHRoaXMucmVmcmVzaFNlbGVjdGVkKCkpO1xuXG4gICAgdGhpcy50cmVlRWwgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci1mb2xkZXItdHJlZScgfSk7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgdm9pZCB0aGlzLmVuc3VyZUxvYWRlZCh0aGlzLnJlbW90ZVJvb3QsIHRydWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaG9vc2UoKTogdm9pZCB7XG4gICAgdGhpcy5vbkNob29zZSh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCdXR0b24ocGFyZW50OiBIVE1MRWxlbWVudCwgdGV4dDogc3RyaW5nLCBjbHM6IHN0cmluZywgb25DbGljazogKCkgPT4gdm9pZCk6IEhUTUxCdXR0b25FbGVtZW50IHtcbiAgICBjb25zdCBidXR0b24gPSBwYXJlbnQuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dCB9KTtcbiAgICBidXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgIGlmIChjbHMpIGJ1dHRvbi5hZGRDbGFzcyhjbHMpO1xuICAgIGJ1dHRvbi5vbmNsaWNrID0gb25DbGljaztcbiAgICByZXR1cm4gYnV0dG9uO1xuICB9XG5cbiAgcHJpdmF0ZSBleHBhbmRBbmNlc3RvcnMoZm9sZGVyUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGN1cnJlbnQgPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSB0aGlzLnJlbW90ZVJvb3QpIHtcbiAgICAgIHRoaXMuZXhwYW5kZWQuYWRkKHBhcmVudFJlbW90ZVBhdGgoY3VycmVudCwgdGhpcy5yZW1vdGVSb290KSk7XG4gICAgICBjdXJyZW50ID0gcGFyZW50UmVtb3RlUGF0aChjdXJyZW50LCB0aGlzLnJlbW90ZVJvb3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudHJlZUVsIHx8ICF0aGlzLnBhdGhFbCkgcmV0dXJuO1xuICAgIHRoaXMucGF0aEVsLnNldFRleHQoYFNlbGVjdGVkIGZvbGRlcjogJHt0aGlzLnNlbGVjdGVkUGF0aH1gKTtcbiAgICB0aGlzLnRyZWVFbC5lbXB0eSgpO1xuICAgIHRoaXMucmVuZGVyTm9kZSh0aGlzLnJlbW90ZVJvb3QsIDApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJOb2RlKGZvbGRlclBhdGg6IHN0cmluZywgZGVwdGg6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy50cmVlRWwpIHJldHVybjtcbiAgICBjb25zdCByb3cgPSB0aGlzLnRyZWVFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLXJvdycgfSk7XG4gICAgaWYgKGZvbGRlclBhdGggPT09IHRoaXMuc2VsZWN0ZWRQYXRoKSByb3cuYWRkQ2xhc3MoJ2lzLXNlbGVjdGVkJyk7XG4gICAgcm93LnN0eWxlLnNldFByb3BlcnR5KCctLWRlcHRoJywgU3RyaW5nKGRlcHRoKSk7XG5cbiAgICBjb25zdCB0b2dnbGUgPSByb3cuY3JlYXRlRWwoJ2J1dHRvbicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdHJlZS10b2dnbGUnIH0pO1xuICAgIHRvZ2dsZS50eXBlID0gJ2J1dHRvbic7XG4gICAgY29uc3QgbG9hZGVkQ2hpbGRyZW4gPSB0aGlzLmZvbGRlckNhY2hlLmdldChmb2xkZXJQYXRoKTtcbiAgICBjb25zdCBoYXNMb2FkZWRDaGlsZHJlbiA9IEFycmF5LmlzQXJyYXkobG9hZGVkQ2hpbGRyZW4pICYmIGxvYWRlZENoaWxkcmVuLmxlbmd0aCA+IDA7XG4gICAgdG9nZ2xlLnNldFRleHQodGhpcy5leHBhbmRlZC5oYXMoZm9sZGVyUGF0aCkgPyAnXHUyNUJFJyA6ICdcdTI1QjgnKTtcbiAgICB0b2dnbGUub25jbGljayA9IChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB2b2lkIHRoaXMudG9nZ2xlRm9sZGVyKGZvbGRlclBhdGgpO1xuICAgIH07XG5cbiAgICBjb25zdCBuYW1lID0gcm93LmNyZWF0ZUVsKCdidXR0b24nLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRyZWUtbmFtZScgfSk7XG4gICAgbmFtZS50eXBlID0gJ2J1dHRvbic7XG4gICAgbmFtZS5jcmVhdGVFbCgnc3BhbicsIHsgdGV4dDogcGF0aE5hbWUoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KSB9KTtcbiAgICBuYW1lLm9uY2xpY2sgPSAoKSA9PiB0aGlzLnNlbGVjdEZvbGRlcihmb2xkZXJQYXRoKTtcbiAgICBuYW1lLm9uZGJsY2xpY2sgPSAoKSA9PiB7IHZvaWQgdGhpcy50b2dnbGVGb2xkZXIoZm9sZGVyUGF0aCk7IH07XG4gICAgcm93LmNyZWF0ZUVsKCdzcGFuJywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLXN0YXR1cycsIHRleHQ6IHRoaXMubG9hZGluZy5oYXMoZm9sZGVyUGF0aCkgPyAnTG9hZGluZy4uLicgOiAnJyB9KTtcblxuICAgIGlmICh0aGlzLmV4cGFuZGVkLmhhcyhmb2xkZXJQYXRoKSkge1xuICAgICAgaWYgKCFsb2FkZWRDaGlsZHJlbikge1xuICAgICAgICB0aGlzLnRyZWVFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdmaWxlLWV4dGVybmFsaXplci10cmVlLW11dGVkJywgdGV4dDogJ0xvYWRpbmcuLi4nIH0pLnN0eWxlLnNldFByb3BlcnR5KCctLWRlcHRoJywgU3RyaW5nKGRlcHRoICsgMSkpO1xuICAgICAgfSBlbHNlIGlmICghaGFzTG9hZGVkQ2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy50cmVlRWwuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnZmlsZS1leHRlcm5hbGl6ZXItdHJlZS1tdXRlZCcsIHRleHQ6ICdObyBzdWJmb2xkZXJzJyB9KS5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1kZXB0aCcsIFN0cmluZyhkZXB0aCArIDEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgbG9hZGVkQ2hpbGRyZW4pIHRoaXMucmVuZGVyTm9kZShqb2luUmVtb3RlUGF0aChmb2xkZXJQYXRoLCBjaGlsZCksIGRlcHRoICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZWxlY3RGb2xkZXIoZm9sZGVyUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFBhdGggPSBub3JtYWxpemVSZW1vdGVGb2xkZXIoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgdGhpcy5oaWRlRXJyb3IoKTtcbiAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB2b2lkIHRoaXMuZW5zdXJlTG9hZGVkKHRoaXMuc2VsZWN0ZWRQYXRoLCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdG9nZ2xlRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmV4cGFuZGVkLmhhcyhmb2xkZXJQYXRoKSkge1xuICAgICAgdGhpcy5leHBhbmRlZC5kZWxldGUoZm9sZGVyUGF0aCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5leHBhbmRlZC5hZGQoZm9sZGVyUGF0aCk7XG4gICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgYXdhaXQgdGhpcy5lbnN1cmVMb2FkZWQoZm9sZGVyUGF0aCwgdHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUxvYWRlZChmb2xkZXJQYXRoOiBzdHJpbmcsIHByZWxvYWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplUmVtb3RlRm9sZGVyKGZvbGRlclBhdGgsIHRoaXMucmVtb3RlUm9vdCk7XG4gICAgaWYgKHRoaXMuZm9sZGVyQ2FjaGUuaGFzKG5vcm1hbGl6ZWQpIHx8IHRoaXMubG9hZGluZy5oYXMobm9ybWFsaXplZCkpIHJldHVybjtcbiAgICB0aGlzLmxvYWRpbmcuYWRkKG5vcm1hbGl6ZWQpO1xuICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGF3YWl0IHRoaXMuc2VydmljZS5wcm92aWRlci5saXN0Rm9sZGVycyhub3JtYWxpemVkKTtcbiAgICAgIHRoaXMuZm9sZGVyQ2FjaGUuc2V0KG5vcm1hbGl6ZWQsIGNoaWxkcmVuKTtcbiAgICAgIGlmIChwcmVsb2FkKSB0aGlzLnByZWxvYWRDaGlsZHJlbihub3JtYWxpemVkLCBjaGlsZHJlbik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubG9hZGluZy5kZWxldGUobm9ybWFsaXplZCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHByZWxvYWRDaGlsZHJlbihwYXJlbnRQYXRoOiBzdHJpbmcsIGNoaWxkcmVuOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4uc2xpY2UoMCwgMTIpKSB7XG4gICAgICBjb25zdCBjaGlsZFBhdGggPSBqb2luUmVtb3RlUGF0aChwYXJlbnRQYXRoLCBjaGlsZCk7XG4gICAgICBpZiAoIXRoaXMuZm9sZGVyQ2FjaGUuaGFzKGNoaWxkUGF0aCkgJiYgIXRoaXMubG9hZGluZy5oYXMoY2hpbGRQYXRoKSkge1xuICAgICAgICB2b2lkIHRoaXMuc2VydmljZS5wcm92aWRlci5saXN0Rm9sZGVycyhjaGlsZFBhdGgpLnRoZW4oKGZvbGRlcnMpID0+IHRoaXMuZm9sZGVyQ2FjaGUuc2V0KGNoaWxkUGF0aCwgZm9sZGVycykpLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWZyZXNoU2VsZWN0ZWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUodGhpcy5zZWxlY3RlZFBhdGgpO1xuICAgIGF3YWl0IHRoaXMuZW5zdXJlTG9hZGVkKHRoaXMuc2VsZWN0ZWRQYXRoLCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRm9sZGVyU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgbmV3IE5ld0ZvbGRlck1vZGFsKHRoaXMuYXBwLCB0aGlzLnNlbGVjdGVkUGF0aCwgKGZvbGRlck5hbWUpID0+IHsgdm9pZCB0aGlzLnBlcmZvcm1DcmVhdGVGb2xkZXIoZm9sZGVyTmFtZSk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGVyZm9ybUNyZWF0ZUZvbGRlcihmb2xkZXJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXJlbnRQYXRoID0gdGhpcy5zZWxlY3RlZFBhdGg7XG4gICAgY29uc3QgbmV3UGF0aCA9IGpvaW5SZW1vdGVQYXRoKHBhcmVudFBhdGgsIGZvbGRlck5hbWUpO1xuICAgIGNvbnN0IG5vdGljZSA9IG5ldyBOb3RpY2UoJ0NyZWF0aW5nIHJlbW90ZSBmb2xkZXIuLi4nLCAwKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLnByb3ZpZGVyLmNyZWF0ZUZvbGRlcihwYXJlbnRQYXRoLCBmb2xkZXJOYW1lKTtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmZvbGRlckNhY2hlLmdldChwYXJlbnRQYXRoKSB8fCBbXTtcbiAgICAgIGlmICghY3VycmVudC5pbmNsdWRlcyhmb2xkZXJOYW1lKSkgdGhpcy5mb2xkZXJDYWNoZS5zZXQocGFyZW50UGF0aCwgWy4uLmN1cnJlbnQsIGZvbGRlck5hbWVdLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSkpO1xuICAgICAgdGhpcy5mb2xkZXJDYWNoZS5zZXQobmV3UGF0aCwgW10pO1xuICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSBuZXdQYXRoO1xuICAgICAgdGhpcy5leHBhbmRlZC5hZGQocGFyZW50UGF0aCk7XG4gICAgICB0aGlzLmV4cGFuZEFuY2VzdG9ycyhuZXdQYXRoKTtcbiAgICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgICAgbmV3IE5vdGljZSgnRm9sZGVyIGNyZWF0ZWQuJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgICBuZXcgTm90aWNlKCdDcmVhdGUgZm9sZGVyIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignQ3JlYXRlIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuYW1lU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgaWYgKGlzUmVtb3RlUm9vdCh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ1RoZSByb290IGZvbGRlciBjYW5ub3QgYmUgcmVuYW1lZCBoZXJlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXcgUmVuYW1lRm9sZGVyTW9kYWwodGhpcy5hcHAsIHRoaXMuc2VsZWN0ZWRQYXRoLCBwYXRoTmFtZSh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSwgKG5ld05hbWUpID0+IHsgdm9pZCB0aGlzLnBlcmZvcm1SZW5hbWUobmV3TmFtZSk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGVyZm9ybVJlbmFtZShuZXdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBvbGRQYXRoID0gdGhpcy5zZWxlY3RlZFBhdGg7XG4gICAgY29uc3QgbmV3UGF0aCA9IGpvaW5SZW1vdGVQYXRoKHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KSwgbmV3TmFtZSk7XG4gICAgY29uc3Qgbm90aWNlID0gbmV3IE5vdGljZSgnUmVuYW1pbmcgZm9sZGVyIGFuZCB1cGRhdGluZyBub3Rlcy4uLicsIDApO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNlcnZpY2UucmVuYW1lRm9sZGVyKG9sZFBhdGgsIG5ld05hbWUpO1xuICAgICAgdGhpcy5yZW1hcEZvbGRlckNhY2hlKG9sZFBhdGgsIG5ld1BhdGgpO1xuICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSBuZXdQYXRoO1xuICAgICAgdGhpcy5leHBhbmRBbmNlc3RvcnMobmV3UGF0aCk7XG4gICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICAgIG5ldyBOb3RpY2UoJ0ZvbGRlciByZW5hbWVkIGFuZCBhZmZlY3RlZCBub3RlcyB1cGRhdGVkLicpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgbmV3IE5vdGljZSgnUmVuYW1lIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignUmVuYW1lIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZGVsZXRlU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgaWYgKGlzUmVtb3RlUm9vdCh0aGlzLnNlbGVjdGVkUGF0aCwgdGhpcy5yZW1vdGVSb290KSkge1xuICAgICAgdGhpcy5zaG93RXJyb3IoJ1RoZSByb290IGZvbGRlciBjYW5ub3QgYmUgZGVsZXRlZCBoZXJlLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmb2xkZXJOYW1lID0gcGF0aE5hbWUodGhpcy5zZWxlY3RlZFBhdGgsIHRoaXMucmVtb3RlUm9vdCk7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBUaGlzIHdpbGwgbW92ZSAke3RoaXMuc2VsZWN0ZWRQYXRofSB0byByZW1vdGUgdHJhc2ggYW5kIHJlbW92ZSBtYXRjaGluZyBsb2NhbCBjYWNoZSBmaWxlcy4gRXhpc3RpbmcgT2JzaWRpYW4gbm90ZXMgdGhhdCByZWZlcmVuY2UgZmlsZXMgdW5kZXIgdGhpcyBmb2xkZXIgd2lsbCBiZSBtYXJrZWQgbWlzc2luZy5gO1xuICAgIG5ldyBDb25maXJtVGV4dE1vZGFsKHRoaXMuYXBwLCAnRGVsZXRlIEZvbGRlcicsIG1lc3NhZ2UsIGZvbGRlck5hbWUsICdEZWxldGUgZm9sZGVyJywgKCkgPT4geyB2b2lkIHRoaXMucGVyZm9ybURlbGV0ZSgpOyB9KS5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1EZWxldGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgb2xkUGF0aCA9IHRoaXMuc2VsZWN0ZWRQYXRoO1xuICAgIGNvbnN0IG5vdGljZSA9IG5ldyBOb3RpY2UoJ01vdmluZyBmb2xkZXIgdG8gdHJhc2guLi4nLCAwKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zZXJ2aWNlLnRyYXNoRm9sZGVyKG9sZFBhdGgpO1xuICAgICAgdGhpcy5yZW1vdmVGb2xkZXJGcm9tQ2FjaGUob2xkUGF0aCk7XG4gICAgICB0aGlzLnNlbGVjdGVkUGF0aCA9IHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICAgIHRoaXMucmVuZGVyVHJlZSgpO1xuICAgICAgbmV3IE5vdGljZSgnRm9sZGVyIG1vdmVkIHRvIHRyYXNoLicpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcikpO1xuICAgICAgbmV3IE5vdGljZSgnRGVsZXRlIGZhaWxlZC4gU2VlIGRldmVsb3BlciBjb25zb2xlLicpO1xuICAgICAgY29uc29sZS5lcnJvcignRGVsZXRlIGZvbGRlciBmYWlsZWQ6JywgZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBub3RpY2UuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtYXBGb2xkZXJDYWNoZShvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5mb2xkZXJDYWNoZS5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChkZXNjZW5kYW50T3JTYW1lKGtleSwgb2xkUGF0aCkpIG5leHQuc2V0KGtleS5yZXBsYWNlKG9sZFBhdGgsIG5ld1BhdGgpLCB2YWx1ZSk7XG4gICAgICBlbHNlIG5leHQuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICB0aGlzLmZvbGRlckNhY2hlLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgbmV4dC5lbnRyaWVzKCkpIHRoaXMuZm9sZGVyQ2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIHRoaXMuZm9sZGVyQ2FjaGUuZGVsZXRlKHBhcmVudFJlbW90ZVBhdGgob2xkUGF0aCwgdGhpcy5yZW1vdGVSb290KSk7XG4gICAgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUocGFyZW50UmVtb3RlUGF0aChuZXdQYXRoLCB0aGlzLnJlbW90ZVJvb3QpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlRm9sZGVyRnJvbUNhY2hlKGZvbGRlclBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudFJlbW90ZVBhdGgoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICBjb25zdCBuYW1lID0gcGF0aE5hbWUoZm9sZGVyUGF0aCwgdGhpcy5yZW1vdGVSb290KTtcbiAgICBjb25zdCBzaWJsaW5ncyA9IHRoaXMuZm9sZGVyQ2FjaGUuZ2V0KHBhcmVudCk7XG4gICAgaWYgKHNpYmxpbmdzKSB0aGlzLmZvbGRlckNhY2hlLnNldChwYXJlbnQsIHNpYmxpbmdzLmZpbHRlcigoZm9sZGVyKSA9PiBmb2xkZXIgIT09IG5hbWUpKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBBcnJheS5mcm9tKHRoaXMuZm9sZGVyQ2FjaGUua2V5cygpKSkge1xuICAgICAgaWYgKGRlc2NlbmRhbnRPclNhbWUoa2V5LCBmb2xkZXJQYXRoKSkgdGhpcy5mb2xkZXJDYWNoZS5kZWxldGUoa2V5KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dFcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZXJyb3JFbCkgcmV0dXJuO1xuICAgIHRoaXMuZXJyb3JFbC5zZXRUZXh0KG1lc3NhZ2UpO1xuICAgIHRoaXMuZXJyb3JFbC5zaG93KCk7XG4gIH1cblxuICBwcml2YXRlIGhpZGVFcnJvcigpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yRWw/LmhpZGUoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlybVRleHRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSB0eXBlZCA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQ29uc3RydWN0b3JQYXJhbWV0ZXJzPHR5cGVvZiBNb2RhbD5bMF0sXG4gICAgcHJpdmF0ZSByZWFkb25seSB0aXRsZVRleHQ6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGV4cGVjdGVkVGV4dDogc3RyaW5nLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uTGFiZWw6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ29uZmlybTogKCkgPT4gdm9pZCxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIHRoaXMuY29udGVudEVsLmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1tb2RhbCcpO1xuICAgIHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogdGhpcy50aXRsZVRleHQgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiB0aGlzLm1lc3NhZ2UgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiBgVHlwZSAke3RoaXMuZXhwZWN0ZWRUZXh0fSB0byBjb25maXJtLmAgfSk7XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcpO1xuICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgaW5wdXQuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLWNvbmZpcm0taW5wdXQnKTtcbiAgICBpbnB1dC5vbmlucHV0ID0gKCkgPT4geyB0aGlzLnR5cGVkID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IGNvbmZpcm0gPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6IHRoaXMuYWN0aW9uTGFiZWwgfSk7XG4gICAgY29uZmlybS50eXBlID0gJ2J1dHRvbic7XG4gICAgY29uZmlybS5hZGRDbGFzcygnbW9kLXdhcm5pbmcnKTtcbiAgICBjb25maXJtLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy50eXBlZCAhPT0gdGhpcy5leHBlY3RlZFRleHQpIHJldHVybjtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMub25Db25maXJtKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNhbmNlbCA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NhbmNlbCcgfSk7XG4gICAgY2FuY2VsLnR5cGUgPSAnYnV0dG9uJztcbiAgICBjYW5jZWwub25jbGljayA9ICgpID0+IHRoaXMuY2xvc2UoKTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVGb2xkZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8dHlwZW9mIE1vZGFsPlswXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGN1cnJlbnRQYXRoOiBzdHJpbmcsXG4gICAgY3VycmVudE5hbWU6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uUmVuYW1lOiAobmV3TmFtZTogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMubmV3TmFtZSA9IGN1cnJlbnROYW1lO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnUmVuYW1lIEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiB0aGlzLmN1cnJlbnRQYXRoIH0pO1xuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgnaW5wdXQnKTtcbiAgICBpbnB1dC50eXBlID0gJ3RleHQnO1xuICAgIGlucHV0LnZhbHVlID0gdGhpcy5uZXdOYW1lO1xuICAgIGlucHV0LmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1jb25maXJtLWlucHV0Jyk7XG4gICAgaW5wdXQub25pbnB1dCA9ICgpID0+IHsgdGhpcy5uZXdOYW1lID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IHJlbmFtZSA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ1JlbmFtZScgfSk7XG4gICAgcmVuYW1lLnR5cGUgPSAnYnV0dG9uJztcbiAgICByZW5hbWUuYWRkQ2xhc3MoJ21vZC1jdGEnKTtcbiAgICByZW5hbWUub25jbGljayA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5uZXdOYW1lIHx8IHRoaXMubmV3TmFtZS5pbmNsdWRlcygnLycpKSByZXR1cm47XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLm9uUmVuYW1lKHRoaXMubmV3TmFtZSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNhbmNlbCA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NhbmNlbCcgfSk7XG4gICAgY2FuY2VsLnR5cGUgPSAnYnV0dG9uJztcbiAgICBjYW5jZWwub25jbGljayA9ICgpID0+IHRoaXMuY2xvc2UoKTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlucHV0LnNlbGVjdCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdGb2xkZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBmb2xkZXJOYW1lID0gJyc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8dHlwZW9mIE1vZGFsPlswXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcmVudFBhdGg6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9uQ3JlYXRlOiAoZm9sZGVyTmFtZTogc3RyaW5nKSA9PiB2b2lkLFxuICApIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gICAgdGhpcy5jb250ZW50RWwuYWRkQ2xhc3MoJ2ZpbGUtZXh0ZXJuYWxpemVyLW1vZGFsJyk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnTmV3IEZvbGRlcicgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLWhlbHAnLCB0ZXh0OiBgQ3JlYXRlIGEgZm9sZGVyIHVuZGVyICR7dGhpcy5wYXJlbnRQYXRofWAgfSk7XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdpbnB1dCcpO1xuICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgaW5wdXQucGxhY2Vob2xkZXIgPSAnRm9sZGVyIG5hbWUnO1xuICAgIGlucHV0LmFkZENsYXNzKCdmaWxlLWV4dGVybmFsaXplci1jb25maXJtLWlucHV0Jyk7XG4gICAgaW5wdXQub25pbnB1dCA9ICgpID0+IHsgdGhpcy5mb2xkZXJOYW1lID0gaW5wdXQudmFsdWUudHJpbSgpOyB9O1xuXG4gICAgY29uc3QgYWN0aW9ucyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2ZpbGUtZXh0ZXJuYWxpemVyLXRvb2xiYXInIH0pO1xuICAgIGNvbnN0IGNyZWF0ZSA9IGFjdGlvbnMuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ0NyZWF0ZSBmb2xkZXInIH0pO1xuICAgIGNyZWF0ZS50eXBlID0gJ2J1dHRvbic7XG4gICAgY3JlYXRlLmFkZENsYXNzKCdtb2QtY3RhJyk7XG4gICAgY3JlYXRlLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZm9sZGVyTmFtZSB8fCB0aGlzLmZvbGRlck5hbWUuaW5jbHVkZXMoJy8nKSkgcmV0dXJuO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5vbkNyZWF0ZSh0aGlzLmZvbGRlck5hbWUpO1xuICAgIH07XG5cbiAgICBjb25zdCBjYW5jZWwgPSBhY3Rpb25zLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDYW5jZWwnIH0pO1xuICAgIGNhbmNlbC50eXBlID0gJ2J1dHRvbic7XG4gICAgY2FuY2VsLm9uY2xpY2sgPSAoKSA9PiB0aGlzLmNsb3NlKCk7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIEZpbGVFeHRlcm5hbGl6ZXJQbHVnaW4gZnJvbSAnLi4vbWFpbic7XG5pbXBvcnQgeyBub3JtYWxpemVTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFeHRlcm5hbGl6ZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHJlYWRvbmx5IHBsdWdpbjogRmlsZUV4dGVybmFsaXplclBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0ZpbGUgRXh0ZXJuYWxpemVyJyB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1JlbW90ZSByb290JylcbiAgICAgIC5zZXREZXNjKCdUb3AtbGV2ZWwgZXh0ZXJuYWwgc3RvcmFnZSBmb2xkZXIgdXNlZCBieSB0aGUgZm9sZGVyIHBpY2tlci4nKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCcvcmVtb3RlL3BhdGgvdG8vZmlsZXMnKVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucmVtb3RlUm9vdClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbW90ZVJvb3QgPSB2YWx1ZS50cmltKCkucmVwbGFjZSgvXFwvKyQvZywgJycpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgICAgICB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdFeHRlcm5hbCBub3RlcyBmb2xkZXInKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0IGZvbGRlciB3aGVyZSBleHRlcm5hbC1maWxlIG5vdGVzIGFyZSBjcmVhdGVkLicpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4gdGV4dFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ0V4dGVybmFsIEZpbGVzJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmV4dGVybmFsTm90ZXNGb2xkZXIpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5leHRlcm5hbE5vdGVzRm9sZGVyID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgICAgICB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdDYWNoZSBmb2xkZXInKVxuICAgICAgLnNldERlc2MoJ1ZhdWx0LWxvY2FsIGNhY2hlIGZvbGRlciBmb3IgZG93bmxvYWRlZC9vcGVuZWQgZXh0ZXJuYWwgZmlsZXMuJylcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignRmlsZSBFeHRlcm5hbGl6ZXIgQ2FjaGUnKVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY2FjaGVGb2xkZXIpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jYWNoZUZvbGRlciA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnRG9jdW1lbnQgdHlwZXMnKVxuICAgICAgLnNldERlc2MoJ0NvbW1hLXNlcGFyYXRlZCBub3RlIGZpbGluZyBjYXRlZ29yaWVzLiBJbmNsdWRlIE90aGVyIGFzIGEgY2F0Y2gtYWxsLicpXG4gICAgICAuYWRkVGV4dEFyZWEoKHRleHQpID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdEb2N1bWVudHMsIEltYWdlcywgTWVkaWEsIEFyY2hpdmVzLCBPdGhlcicpXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kb2N1bWVudFR5cGVzLmpvaW4oJywgJykpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kb2N1bWVudFR5cGVzID0gc3BsaXRMaXN0KHZhbHVlKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQ29udGV4dCB0eXBlcycpXG4gICAgICAuc2V0RGVzYygnQ29tbWEtc2VwYXJhdGVkIGZpcnN0LWxldmVsIHJlbW90ZSBmb2xkZXIgbmFtZXMgdXNlZCBmb3IgY29udGV4dCBtZXRhZGF0YS4nKVxuICAgICAgLmFkZFRleHRBcmVhKCh0ZXh0KSA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignUHJvamVjdHMsIEFyZWFzLCBQZW9wbGUsIE9yZ2FuaXphdGlvbnMsIEdlbmVyYWwnKVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29udGV4dFR5cGVzLmpvaW4oJywgJykpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb250ZXh0VHlwZXMgPSBzcGxpdExpc3QodmFsdWUpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZSgpO1xuICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MgPSBub3JtYWxpemVTZXR0aW5ncyh0aGlzLnBsdWdpbi5zZXR0aW5ncyk7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXRMaXN0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgnLCcpLm1hcCgoaXRlbSkgPT4gaXRlbS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQStCOzs7QUNBeEIsSUFBTSxZQUFZO0FBQ2xCLElBQU0sd0JBQXdCLEdBQUcsU0FBUztBQUMxQyxJQUFNLDZCQUE2QixHQUFHLFNBQVM7QUFDL0MsSUFBTSx1Q0FBdUMsR0FBRyxTQUFTO0FBRXpELElBQU0seUJBQXlCLENBQUMsYUFBYSxVQUFVLFNBQVMsWUFBWSxPQUFPO0FBQ25GLElBQU0sd0JBQXdCLENBQUMsWUFBWSxTQUFTLFVBQVUsaUJBQWlCLFNBQVM7OztBQ0t4RixJQUFNLG1CQUE2QztBQUFBLEVBQ3hELGFBQWE7QUFBQSxFQUNiLGNBQWMsQ0FBQyxHQUFHLHFCQUFxQjtBQUFBLEVBQ3ZDLGVBQWUsQ0FBQyxHQUFHLHNCQUFzQjtBQUFBLEVBQ3pDLHFCQUFxQjtBQUFBLEVBQ3JCLFVBQVU7QUFBQSxFQUNWLFlBQVk7QUFDZDtBQUVPLFNBQVMsa0JBQWtCLE9BQXVGO0FBQ3ZILFNBQU87QUFBQSxJQUNMLGFBQWEsU0FBUyxPQUFPLGFBQWEsaUJBQWlCLFdBQVc7QUFBQSxJQUN0RSxjQUFjLGFBQWEsT0FBTyxjQUFjLGlCQUFpQixZQUFZO0FBQUEsSUFDN0UsZUFBZSxZQUFZLGFBQWEsT0FBTyxlQUFlLGlCQUFpQixhQUFhLENBQUM7QUFBQSxJQUM3RixxQkFBcUIsU0FBUyxPQUFPLHFCQUFxQixpQkFBaUIsbUJBQW1CO0FBQUEsSUFDOUYsVUFBVSxPQUFPLFlBQVksaUJBQWlCO0FBQUEsSUFDOUMsWUFBWSxPQUFPLE9BQU8sY0FBYyxpQkFBaUIsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLFNBQVMsRUFBRTtBQUFBLEVBQ2pHO0FBQ0Y7QUFFQSxTQUFTLFNBQVMsT0FBMkIsVUFBMEI7QUFDckUsUUFBTSxVQUFVLE9BQU8sU0FBUyxFQUFFLEVBQUUsS0FBSztBQUN6QyxTQUFPLFdBQVc7QUFDcEI7QUFFQSxTQUFTLGFBQWEsT0FBNkIsVUFBOEI7QUFDL0UsUUFBTSxPQUFPLE1BQU0sUUFBUSxLQUFLLElBQzVCLE1BQU0sSUFBSSxDQUFDLFNBQVMsT0FBTyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxPQUFPLElBQ3ZELENBQUM7QUFDTCxTQUFPLEtBQUssU0FBUyxNQUFNLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRO0FBQy9EO0FBRUEsU0FBUyxZQUFZLFFBQTRCO0FBQy9DLFNBQU8sT0FBTyxLQUFLLENBQUMsVUFBVSxNQUFNLFlBQVksTUFBTSxPQUFPLElBQUksU0FBUyxDQUFDLEdBQUcsUUFBUSxPQUFPO0FBQy9GOzs7QUM1Q0EsSUFBQUMsb0JBQWlCOzs7QUNEakIsdUJBQWlCO0FBR1YsU0FBUyxzQkFBc0IsWUFBb0IsWUFBNEI7QUFDcEYsUUFBTSxhQUFhLE9BQU8sY0FBYyxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsU0FBUyxFQUFFO0FBQ3RFLFFBQU0sT0FBTyxXQUFXLFFBQVEsU0FBUyxFQUFFO0FBQzNDLE1BQUksQ0FBQyxLQUFNLFFBQU87QUFDbEIsTUFBSSxDQUFDLGNBQWMsZUFBZSxLQUFNLFFBQU87QUFDL0MsTUFBSSxDQUFDLFdBQVcsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFHLFFBQU87QUFDL0MsU0FBTztBQUNUO0FBRU8sU0FBUyxlQUFlLFlBQW9CLFdBQTJCO0FBQzVFLFFBQU0sYUFBYSxPQUFPLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLGNBQWMsRUFBRTtBQUMxRSxNQUFJLENBQUMsV0FBWSxRQUFPO0FBQ3hCLFNBQU8sR0FBRyxXQUFXLFFBQVEsU0FBUyxFQUFFLENBQUMsSUFBSSxVQUFVO0FBQ3pEO0FBRU8sU0FBUyxpQkFBaUIsYUFBcUIsWUFBNEI7QUFDaEYsUUFBTSxPQUFPLFdBQVcsUUFBUSxTQUFTLEVBQUU7QUFDM0MsTUFBSSxnQkFBZ0IsS0FBTSxRQUFPO0FBQ2pDLFFBQU0sU0FBUyxZQUFZLFFBQVEsU0FBUyxFQUFFLEVBQUUsUUFBUSxZQUFZLEVBQUU7QUFDdEUsU0FBTyxVQUFVLE9BQU8sV0FBVyxJQUFJLElBQUksU0FBUztBQUN0RDtBQUVPLFNBQVMsU0FBUyxZQUFvQixZQUE0QjtBQUN2RSxRQUFNLGFBQWEsc0JBQXNCLFlBQVksVUFBVTtBQUMvRCxNQUFJLGVBQWUsV0FBWSxRQUFPO0FBQ3RDLFNBQU8sV0FBVyxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQU8sRUFBRSxJQUFJLEtBQUs7QUFDeEQ7QUFFTyxTQUFTLGFBQWEsWUFBb0IsWUFBNkI7QUFDNUUsU0FBTyxzQkFBc0IsWUFBWSxVQUFVLE1BQU07QUFDM0Q7QUFFTyxTQUFTLGlCQUFpQixXQUFtQixNQUF1QjtBQUN6RSxTQUFPLGNBQWMsUUFBUSxPQUFPLGFBQWEsRUFBRSxFQUFFLFdBQVcsR0FBRyxJQUFJLEdBQUc7QUFDNUU7QUFFTyxTQUFTLGtCQUFrQixNQUFjLFNBQWlCLFNBQXlCO0FBQ3hGLFNBQU8sT0FBTyxRQUFRLEVBQUUsRUFBRSxNQUFNLE9BQU8sRUFBRSxLQUFLLE9BQU87QUFDdkQ7QUFNTyxTQUFTLHVCQUF1QixZQUFvQixZQUE0QjtBQUNyRixRQUFNLE9BQU8sV0FBVyxRQUFRLFNBQVMsRUFBRTtBQUMzQyxRQUFNLGNBQWMsT0FBTyxJQUFJLE9BQU8sSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLElBQUk7QUFDcEUsU0FBTyxPQUFPLGNBQWMsRUFBRSxFQUMzQixRQUFRLGVBQWUsS0FBSyxFQUFFLEVBQzlCLFFBQVEsUUFBUSxFQUFFLEVBQ2xCLE1BQU0sR0FBRyxFQUNULElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxnQkFBZ0IsR0FBRyxDQUFDLEVBQy9DLEtBQUssR0FBRztBQUNiO0FBRU8sU0FBUyxrQkFBa0IsY0FBc0IsWUFBb0IsY0FBcUM7QUFDL0csUUFBTSxRQUFRLHNCQUFzQixjQUFjLFVBQVUsRUFDekQsTUFBTSxXQUFXLE1BQU0sRUFDdkIsTUFBTSxHQUFHLEVBQ1QsT0FBTyxPQUFPLEVBQUUsQ0FBQztBQUNwQixTQUFPLGFBQWEsU0FBUyxLQUFLLElBQUksUUFBdUI7QUFDL0Q7QUFFTyxTQUFTLGtCQUFrQixjQUFzQixZQUE0QjtBQUNsRixRQUFNLFFBQVEsc0JBQXNCLGNBQWMsVUFBVSxFQUN6RCxNQUFNLFdBQVcsTUFBTSxFQUN2QixNQUFNLEdBQUcsRUFDVCxPQUFPLE9BQU87QUFDakIsTUFBSSxNQUFNLFVBQVUsRUFBRyxRQUFPLE1BQU0sQ0FBQztBQUNyQyxNQUFJLE1BQU0sV0FBVyxLQUFLLE1BQU0sQ0FBQyxNQUFNLFVBQVcsUUFBTyxNQUFNLENBQUM7QUFDaEUsU0FBTztBQUNUO0FBRU8sU0FBUyxZQUFZLFVBQTBCO0FBQ3BELFNBQU8sU0FBUyxNQUFNLGlCQUFBQyxRQUFLLEdBQUcsRUFBRSxLQUFLLEdBQUc7QUFDMUM7QUFFQSxTQUFTLGFBQWEsT0FBdUI7QUFDM0MsU0FBTyxNQUFNLFFBQVEsdUJBQXVCLE1BQU07QUFDcEQ7OztBRDlFTyxTQUFTLGFBQWEsS0FBa0I7QUFDN0MsUUFBTSxVQUFVLElBQUksTUFBTTtBQUMxQixNQUFJLE9BQU8sUUFBUSxnQkFBZ0IsV0FBWSxRQUFPLFFBQVEsWUFBWTtBQUMxRSxNQUFJLFFBQVEsU0FBVSxRQUFPLFFBQVE7QUFDckMsUUFBTSxJQUFJLE1BQU0sNERBQTREO0FBQzlFO0FBRU8sU0FBUyxrQkFBa0IsV0FBbUIsY0FBOEI7QUFDakYsU0FBTyxZQUFZLGtCQUFBQyxRQUFLLFNBQVMsV0FBVyxZQUFZLENBQUM7QUFDM0Q7QUFFQSxlQUFzQixtQkFBbUIsS0FBVSxlQUF3QztBQUN6RixNQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sUUFBUSxPQUFPLGFBQWEsRUFBRyxRQUFPO0FBQzNELFFBQU0sTUFBTSxrQkFBQUEsUUFBSyxNQUFNLFFBQVEsYUFBYTtBQUM1QyxRQUFNLE9BQU8sY0FBYyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU07QUFDL0MsV0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFNLEtBQUssR0FBRztBQUNoQyxVQUFNLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUc7QUFDcEMsUUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLFFBQVEsT0FBTyxTQUFTLEVBQUcsUUFBTztBQUFBLEVBQ3pEO0FBQ0EsUUFBTSxJQUFJLE1BQU0sc0NBQXNDO0FBQ3hEO0FBRU8sU0FBUyxtQkFBbUIsS0FBd0I7QUFDekQsUUFBTSxPQUFPLElBQUksVUFBVSxjQUFjO0FBQ3pDLFNBQU8sUUFBUSxLQUFLLGNBQWMsT0FBTyxPQUFPO0FBQ2xEO0FBRU8sU0FBUyxxQkFBcUIsS0FBd0I7QUFDM0QsUUFBTSxTQUFTLG1CQUFtQixHQUFHO0FBQ3JDLE1BQUksVUFBVSxrQkFBa0IsS0FBSyxNQUFNLEVBQUcsUUFBTztBQUVyRCxhQUFXLFFBQVEsSUFBSSxVQUFVLGdCQUFnQixVQUFVLEdBQUc7QUFDNUQsVUFBTSxPQUFPLE1BQU0sUUFBUSxVQUFVLEtBQUssT0FBTyxLQUFLLEtBQUssT0FBdUI7QUFDbEYsUUFBSSxRQUFRLEtBQUssY0FBYyxRQUFRLGtCQUFrQixLQUFLLElBQUksRUFBRyxRQUFPO0FBQUEsRUFDOUU7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxTQUFTLGtCQUFrQixLQUFVLE1BQXNCO0FBQ3pELFFBQU0sUUFBUSxJQUFJLGNBQWMsYUFBYSxJQUFJO0FBQ2pELFNBQU8sUUFBUSxPQUFPLGFBQWEsZUFBZSxPQUFPLGFBQWEsV0FBVztBQUNuRjs7O0FFN0NBLElBQUFDLGtCQUFlO0FBQ2YsSUFBQUMsb0JBQWlCO0FBQ2pCLElBQUFDLDZCQUEwQjs7O0FDQW5CLFNBQVMsc0JBQXNCLE9BQWUsZUFBdUM7QUFDMUYsUUFBTSxhQUFhLGdCQUFnQixLQUFLO0FBQ3hDLFNBQU8sY0FBYyxLQUFLLENBQUMsU0FBUyxnQkFBZ0IsSUFBSSxNQUFNLFVBQVUsS0FBSyxxQkFBcUIsYUFBYTtBQUNqSDtBQWdCQSxTQUFTLGdCQUFnQixPQUF1QjtBQUM5QyxTQUFPLE9BQU8sU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLFVBQVUsR0FBRyxFQUFFLFFBQVEsUUFBUSxHQUFHO0FBQzVGO0FBRUEsU0FBUyxxQkFBcUIsZUFBaUM7QUFDN0QsU0FBTyxjQUFjLEtBQUssQ0FBQyxTQUFTLGdCQUFnQixJQUFJLE1BQU0sT0FBTyxLQUFLLGNBQWMsQ0FBQyxLQUFLO0FBQ2hHOzs7QUM1QkEsSUFBQUMsb0JBQWlCOzs7QUNRVixTQUFTLGlCQUFpQixNQUEyQjtBQUMxRCxRQUFNLFFBQVEsT0FBTyxRQUFRLEVBQUUsRUFBRSxNQUFNLHVCQUF1QjtBQUM5RCxRQUFNLE1BQW1CLENBQUM7QUFDMUIsTUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixhQUFXLFFBQVEsTUFBTSxDQUFDLEVBQUUsTUFBTSxPQUFPLEdBQUc7QUFDMUMsVUFBTSxNQUFNLEtBQUssUUFBUSxHQUFHO0FBQzVCLFFBQUksUUFBUSxHQUFJO0FBQ2hCLFVBQU0sTUFBTSxLQUFLLE1BQU0sR0FBRyxHQUFHLEVBQUUsS0FBSztBQUNwQyxRQUFJLFFBQVEsS0FBSyxNQUFNLE1BQU0sQ0FBQyxFQUFFLEtBQUs7QUFDckMsWUFBUSxNQUFNLFFBQVEsVUFBVSxFQUFFO0FBQ2xDLFFBQUksR0FBRyxJQUFJO0FBQUEsRUFDYjtBQUNBLFNBQU87QUFDVDtBQUVPLFNBQVMsV0FBVyxPQUEwQztBQUNuRSxTQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssQ0FBQztBQUNyQztBQUVPLFNBQVMsV0FBVyxPQUF1QjtBQUNoRCxTQUFPLE9BQU8sU0FBUyxFQUFFLEVBQUUsUUFBUSxpQkFBaUIsR0FBRyxFQUFFLFFBQVEsUUFBUSxHQUFHLEVBQUUsWUFBWTtBQUM1RjtBQUVPLFNBQVMscUJBQXFCLE1BQWMsU0FBb0Q7QUFDckcsUUFBTSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hDLFFBQU0sUUFBUSxPQUFPLE1BQU0sdUJBQXVCO0FBQ2xELE1BQUksQ0FBQyxNQUFPLFFBQU87QUFFbkIsUUFBTSxZQUFZLEVBQUUsR0FBRyxRQUFRO0FBQy9CLFFBQU0sUUFBUSxNQUFNLENBQUMsRUFBRSxNQUFNLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUztBQUNsRCxVQUFNLE1BQU0sS0FBSyxRQUFRLEdBQUc7QUFDNUIsUUFBSSxRQUFRLEdBQUksUUFBTztBQUN2QixVQUFNLE1BQU0sS0FBSyxNQUFNLEdBQUcsR0FBRyxFQUFFLEtBQUs7QUFDcEMsVUFBTSxTQUFTLFVBQVUsR0FBRztBQUM1QixRQUFJLENBQUMsT0FBUSxRQUFPO0FBQ3BCLFdBQU8sVUFBVSxHQUFHO0FBQ3BCLFdBQU8sR0FBRyxHQUFHLEtBQUssaUJBQWlCLE1BQU0sQ0FBQztBQUFBLEVBQzVDLENBQUM7QUFFRCxhQUFXLENBQUMsS0FBSyxNQUFNLEtBQUssT0FBTyxRQUFRLFNBQVMsR0FBRztBQUNyRCxVQUFNLEtBQUssR0FBRyxHQUFHLEtBQUssaUJBQWlCLE1BQU0sQ0FBQyxFQUFFO0FBQUEsRUFDbEQ7QUFFQSxTQUFPLE9BQU8sUUFBUSx1QkFBdUI7QUFBQSxFQUFRLE1BQU0sS0FBSyxJQUFJLENBQUM7QUFBQSxJQUFPO0FBQzlFO0FBRUEsU0FBUyxpQkFBaUIsUUFBbUM7QUFDM0QsTUFBSSxPQUFPLElBQUssUUFBTyxPQUFPLE9BQU8sS0FBSztBQUMxQyxNQUFJLE9BQU8sVUFBVSxPQUFRLFFBQU87QUFDcEMsTUFBSSxPQUFPLE1BQU8sUUFBTyxXQUFXLE9BQU8sS0FBSztBQUNoRCxTQUFPLE9BQU8sT0FBTyxLQUFLO0FBQzVCOzs7QUMzREEsSUFBQUMsb0JBQWlCO0FBRVYsU0FBUyxVQUFVLE9BQXVCO0FBQy9DLFNBQU8sT0FBTyxTQUFTLEVBQUUsRUFBRSxRQUFRLGlCQUFpQixHQUFHLEVBQUUsUUFBUSxRQUFRLEdBQUcsRUFBRSxLQUFLO0FBQ3JGO0FBRU8sU0FBUyx3QkFBd0IsT0FBZSxZQUE0QjtBQUNqRixRQUFNLFlBQVksa0JBQUFDLFFBQUssUUFBUSxjQUFjLEVBQUU7QUFDL0MsTUFBSSxXQUFXLE9BQU8sU0FBUyxFQUFFLEVBQUUsS0FBSztBQUN4QyxNQUFJLENBQUMsWUFBWSxXQUFZLFlBQVcsa0JBQUFBLFFBQUssU0FBUyxVQUFVO0FBQ2hFLE1BQUksQ0FBQyxTQUFVLE9BQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUM3RCxNQUFJLGVBQWUsS0FBSyxRQUFRLEdBQUc7QUFDakMsVUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsRUFDckU7QUFDQSxNQUFJLENBQUMsa0JBQUFBLFFBQUssUUFBUSxRQUFRLEtBQUssVUFBVyxhQUFZO0FBQ3RELFNBQU87QUFDVDtBQUVPLFNBQVMsb0JBQW9CLFVBQWtCLE1BQU0sb0JBQUksS0FBSyxHQUFXO0FBQzlFLFFBQU0sT0FBTyxJQUFJLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUMxQyxRQUFNLFNBQVMsa0JBQUFBLFFBQUssTUFBTSxZQUFZLEVBQUU7QUFDeEMsU0FBTyxVQUFVLEdBQUcsSUFBSSxJQUFJLE9BQU8sUUFBUSxlQUFlLEVBQUU7QUFDOUQ7OztBRktPLFNBQVMsdUJBQXVCLFlBQW9CLGNBQXNCLGVBQWlDO0FBQ2hILFNBQU8sa0JBQUFDLFFBQUssTUFBTSxLQUFLLFlBQVksc0JBQXNCLGNBQWMsYUFBYSxDQUFDO0FBQ3ZGO0FBRU8sU0FBUyxzQkFBc0IsT0FBOEIsZUFBaUM7QUFDbkcsUUFBTSxRQUFRLFVBQVUsTUFBTSxLQUFLO0FBQ25DLFFBQU0sZUFBZSxzQkFBc0IsTUFBTSxjQUFjLGFBQWE7QUFDNUUsU0FBTztBQUFBLFNBQ0EsS0FBSztBQUFBO0FBQUE7QUFBQSxpQkFHRyxXQUFXLFlBQVksQ0FBQztBQUFBO0FBQUEsb0JBRXJCLE1BQU0sUUFBUTtBQUFBLGtCQUNoQixXQUFXLE1BQU0sWUFBWSxDQUFDO0FBQUEsZUFDakMsV0FBVyxNQUFNLFVBQVUsQ0FBQztBQUFBLGNBQzdCLE1BQU0sY0FBYyxTQUFTLFNBQVMsV0FBVyxNQUFNLFNBQVMsQ0FBQztBQUFBLHFCQUMxRCxXQUFXLE1BQU0sZ0JBQWdCLENBQUM7QUFBQSxtQkFDcEMsV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUFBLG1CQUNoQyxNQUFNLElBQUk7QUFBQSxnQkFDYixNQUFNLFdBQVc7QUFBQSxnQkFDakIsV0FBVyxNQUFNLFdBQVcsQ0FBQztBQUFBLFdBQ2xDLE1BQU0sSUFBSTtBQUFBLFdBQ1YsTUFBTSxJQUFJO0FBQUE7QUFBQTtBQUFBLElBR2pCLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFJVyxNQUFNLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFTekIsMEJBQTBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBT3ZDO0FBRU8sU0FBUyxzQ0FDZCxNQUNBLFNBQ0EsU0FDQSxPQUNBLFlBQ0EsY0FDUTtBQUNSLFFBQU0sS0FBSyxpQkFBaUIsSUFBSTtBQUNoQyxRQUFNLGFBQWEsR0FBRyxrQkFBa0I7QUFDeEMsUUFBTSxZQUFZLEdBQUcsZUFBZSxHQUFHLGVBQWU7QUFDdEQsUUFBTSxXQUFXLGlCQUFpQixZQUFZLE9BQU8sS0FBSyxpQkFBaUIsV0FBVyxPQUFPO0FBQzdGLE1BQUksQ0FBQyxTQUFVLFFBQU87QUFFdEIsUUFBTSxXQUFXLGtCQUFrQixNQUFNLFNBQVMsT0FBTztBQUN6RCxRQUFNLGFBQWEsYUFBYSxrQkFBa0IsWUFBWSxTQUFTLE9BQU8sSUFBSTtBQUNsRixRQUFNLFVBQVU7QUFBQSxJQUNkLFNBQVMsRUFBRSxPQUFPLE1BQU07QUFBQSxJQUN4QixHQUFJLGFBQWE7QUFBQSxNQUNmLGNBQWMsRUFBRSxPQUFPLGtCQUFrQixZQUFZLFlBQVksWUFBWSxFQUFFO0FBQUEsTUFDL0UsY0FBYyxFQUFFLE9BQU8sa0JBQWtCLFlBQVksVUFBVSxHQUFHLE9BQU8sS0FBSztBQUFBLElBQ2hGLElBQUksQ0FBQztBQUFBLEVBQ1A7QUFDQSxTQUFPLHFCQUFxQixVQUFVLE9BQU87QUFDL0M7QUFFTyxTQUFTLDRCQUNkLE1BQ0Esa0JBQ0EsT0FDQSxTQUFTLDJCQUNEO0FBQ1IsUUFBTSxLQUFLLGlCQUFpQixJQUFJO0FBQ2hDLFFBQU0sV0FBVyxpQkFBaUIsR0FBRyxrQkFBa0IsSUFBSSxnQkFBZ0IsS0FDekUsaUJBQWlCLEdBQUcsZUFBZSxHQUFHLGVBQWUsSUFBSSxnQkFBZ0I7QUFDM0UsTUFBSSxDQUFDLFNBQVUsUUFBTztBQUN0QixTQUFPLHFCQUFxQixNQUFNO0FBQUEsSUFDaEMsUUFBUSxFQUFFLE9BQU8sVUFBVTtBQUFBLElBQzNCLFNBQVMsRUFBRSxPQUFPLE1BQU07QUFBQSxJQUN4QixnQkFBZ0IsRUFBRSxPQUFPLFFBQVEsT0FBTyxLQUFLO0FBQUEsRUFDL0MsQ0FBQztBQUNIOzs7QUdwSEEsZ0NBQXdEO0FBQ3hELHFCQUFlO0FBQ2YscUJBQWU7QUFDZixJQUFBQyxvQkFBaUI7QUFDakIsdUJBQTBCO0FBSTFCLElBQU0sZUFBVyw0QkFBVSwwQkFBQUMsUUFBZ0I7QUFnQnBDLElBQU0seUJBQU4sTUFBd0Q7QUFBQSxFQUM1QztBQUFBLEVBRWpCLFlBQVksVUFBVSxtQkFBbUIsR0FBRztBQUMxQyxTQUFLLFVBQVU7QUFBQSxFQUNqQjtBQUFBLEVBRUEsTUFBTSxhQUFhLFlBQW9CLE1BQTZCO0FBQ2xFLFVBQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxpQkFBaUIsWUFBWSxNQUFNLFFBQVEsQ0FBQztBQUFBLEVBQzVFO0FBQUEsRUFFQSxNQUFNLGFBQWEsWUFBb0IsbUJBQWdEO0FBQ3JGLFVBQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxZQUFZLE1BQU0sVUFBVSxZQUFZLGlCQUFpQixDQUFDO0FBQ3hGLFVBQU0sYUFBYSxrQkFBQUMsUUFBSyxLQUFLLG1CQUFtQixrQkFBQUEsUUFBSyxTQUFTLFVBQVUsQ0FBQztBQUN6RSxRQUFJLENBQUMsZUFBQUMsUUFBRyxXQUFXLFVBQVUsRUFBRyxPQUFNLElBQUksTUFBTSxzREFBc0Q7QUFDdEcsVUFBTSxPQUFPLGVBQUFBLFFBQUcsU0FBUyxVQUFVO0FBQ25DLFdBQU87QUFBQSxNQUNMLGNBQWMsS0FBSyxNQUFNLFlBQVk7QUFBQSxNQUNyQyxNQUFNO0FBQUEsTUFDTixNQUFNLEtBQUs7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxZQUFZLFlBQXVDO0FBQ3ZELFVBQU0sTUFBTSxNQUFNLEtBQUssSUFBSSxDQUFDLGNBQWMsUUFBUSxZQUFZLFFBQVEsQ0FBQztBQUN2RSxVQUFNLFFBQVEsS0FBSyxNQUFNLE9BQU8sSUFBSTtBQUNwQyxXQUFPLE1BQ0osT0FBTyxDQUFDLFNBQVMsUUFBUSxLQUFLLFNBQVMsUUFBUSxFQUMvQyxJQUFJLGNBQWMsRUFDbEIsT0FBTyxPQUFPLEVBQ2QsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQUEsRUFDdEM7QUFBQSxFQUVBLE1BQU0sYUFBYSxTQUFpQixTQUFnQztBQUNsRSxVQUFNLEtBQUssSUFBSSxDQUFDLGNBQWMsVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQzNEO0FBQUEsRUFFQSxNQUFNLEtBQUssWUFBeUM7QUFDbEQsVUFBTSxNQUFNLE1BQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxRQUFRLFlBQVksUUFBUSxDQUFDO0FBQ3ZFLFVBQU0sT0FBTyxLQUFLLE1BQU0sT0FBTyxJQUFJO0FBQ25DLFdBQU87QUFBQSxNQUNMLGNBQWMsV0FBVyxJQUFJO0FBQUEsTUFDN0IsTUFBTTtBQUFBLE1BQ04sTUFBTSxLQUFLLG9CQUFvQixLQUFLLGdCQUFnQixlQUFlLEtBQUssZ0JBQWdCLGVBQWU7QUFBQSxJQUN6RztBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sWUFBWSxZQUFtQztBQUNuRCxVQUFNLEtBQUssSUFBSSxDQUFDLGNBQWMsU0FBUyxVQUFVLENBQUM7QUFBQSxFQUNwRDtBQUFBLEVBRUEsTUFBTSxXQUFXLE9BQTZDO0FBQzVELFVBQU0sV0FBVyxrQkFBa0IsTUFBTSxXQUFXLE1BQU0sVUFBVTtBQUNwRSxRQUFJO0FBQ0YsWUFBTSxLQUFLLElBQUksQ0FBQyxjQUFjLFVBQVUsTUFBTSxXQUFXLE1BQU0sU0FBUyxTQUFTLFlBQVksTUFBTSxjQUFjLFFBQVEsQ0FBQztBQUMxSCxhQUFPLEtBQUssS0FBSyxlQUFlLE1BQU0sY0FBYyxNQUFNLFVBQVUsQ0FBQztBQUFBLElBQ3ZFLFVBQUU7QUFDQSxlQUFTLFFBQVE7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQWMsSUFBSSxNQUFpQztBQUNqRCxRQUFJO0FBQ0YsWUFBTSxTQUFTLE1BQU0sU0FBUyxLQUFLLFNBQVMsTUFBTSxFQUFFLFVBQVUsT0FBTyxDQUFDO0FBQ3RFLGFBQU8sT0FBTyxVQUFVO0FBQUEsSUFDMUIsU0FBUyxPQUFPO0FBQ2QsWUFBTSxpQkFBaUIsS0FBSyxTQUFTLE1BQU0sS0FBSztBQUFBLElBQ2xEO0FBQUEsRUFDRjtBQUNGO0FBRU8sU0FBUyxxQkFBNkI7QUFDM0MsUUFBTSxhQUFhO0FBQUEsSUFDakIsUUFBUSxJQUFJO0FBQUEsSUFDWjtBQUFBLElBQ0Esa0JBQUFELFFBQUssS0FBSyxlQUFBRSxRQUFHLFFBQVEsR0FBRyx5QkFBeUI7QUFBQSxJQUNqRDtBQUFBLElBQ0E7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBRWhCLGFBQVcsYUFBYSxZQUFZO0FBQ2xDLFVBQU0sWUFBUSxxQ0FBVSxXQUFXLENBQUMsUUFBUSxHQUFHLEVBQUUsVUFBVSxPQUFPLENBQUM7QUFDbkUsUUFBSSxNQUFNLFdBQVcsRUFBRyxRQUFPO0FBQUEsRUFDakM7QUFFQSxRQUFNLElBQUksTUFBTSxzRUFBc0U7QUFDeEY7QUFFTyxTQUFTLHlCQUF5QixPQUF5QjtBQUNoRSxRQUFNLE1BQU07QUFDWixRQUFNLFVBQVUsR0FBRyxLQUFLLFdBQVcsRUFBRTtBQUFBLEVBQUssS0FBSyxVQUFVLEVBQUU7QUFBQSxFQUFLLEtBQUssVUFBVSxFQUFFLEdBQUcsWUFBWTtBQUNoRyxTQUFPLFFBQVEsU0FBUyxXQUFXLEtBQ2pDLFFBQVEsU0FBUyxnQkFBZ0IsS0FDakMsUUFBUSxTQUFTLGNBQWMsS0FDL0IsUUFBUSxTQUFTLEtBQUs7QUFDMUI7QUFFQSxTQUFTLGVBQWUsTUFBMEI7QUFDaEQsTUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixNQUFJLE9BQU8sS0FBSyxTQUFTLFNBQVUsUUFBTyxLQUFLO0FBQy9DLE1BQUksS0FBSyxRQUFRLE9BQU8sS0FBSyxLQUFLLFVBQVUsU0FBVSxRQUFPLEtBQUssS0FBSztBQUN2RSxTQUFPO0FBQ1Q7QUFFQSxTQUFTLFdBQVcsTUFBMEI7QUFDNUMsU0FBTyxLQUFLLG9CQUFvQixLQUFLLGdCQUFnQixnQkFBZ0IsS0FBSyxnQkFBZ0I7QUFDNUY7QUFFQSxTQUFTLGtCQUFrQixXQUFtQixZQUFpRTtBQUM3RyxNQUFJLGtCQUFBRixRQUFLLFNBQVMsU0FBUyxNQUFNLFdBQVksUUFBTyxFQUFFLFlBQVksV0FBVyxTQUFTLE1BQU0sT0FBVTtBQUN0RyxRQUFNLFVBQVUsZUFBQUMsUUFBRyxZQUFZLGtCQUFBRCxRQUFLLEtBQUssZUFBQUUsUUFBRyxPQUFPLEdBQUcsMkJBQTJCLENBQUM7QUFDbEYsUUFBTSxhQUFhLGtCQUFBRixRQUFLLEtBQUssU0FBUyxVQUFVO0FBQ2hELGlCQUFBQyxRQUFHLGFBQWEsV0FBVyxVQUFVO0FBQ3JDLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQSxTQUFTLE1BQU0sZUFBQUEsUUFBRyxPQUFPLFNBQVMsRUFBRSxXQUFXLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFBQSxFQUNwRTtBQUNGO0FBRUEsU0FBUyxpQkFBaUIsU0FBaUIsTUFBZ0IsT0FBdUI7QUFDaEYsUUFBTSxNQUFNO0FBQ1osUUFBTSxVQUFVO0FBQUEsSUFDZCxJQUFJO0FBQUEsSUFDSixJQUFJLFVBQVUsV0FBVyxJQUFJLE9BQU8sS0FBSyxDQUFDO0FBQUEsSUFDMUMsSUFBSSxVQUFVLFdBQVcsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUFBLEVBQzVDLEVBQUUsT0FBTyxPQUFPLEVBQUUsS0FBSyxJQUFJO0FBQzNCLFFBQU0sVUFBVSxJQUFJLE1BQU0sR0FBRyxPQUFPLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FBQyxVQUFVLFVBQVU7QUFBQSxFQUFLLE9BQU8sS0FBSyxFQUFFLEVBQUU7QUFDL0YsRUFBQyxRQUF5RCxTQUFTLElBQUk7QUFDdkUsRUFBQyxRQUF5RCxTQUFTLElBQUk7QUFDdkUsU0FBTztBQUNUOzs7QUMxSkEsSUFBQUUsa0JBQWU7QUFDZixJQUFBQyxvQkFBaUI7QUFXVixJQUFNLGVBQU4sTUFBbUI7QUFBQSxFQUN4QixZQUNtQixXQUNBLGFBQ0EsWUFDakI7QUFIaUI7QUFDQTtBQUNBO0FBQUEsRUFDaEI7QUFBQSxFQUVILG1CQUFtQixZQUE0QjtBQUM3QyxXQUFPLGtCQUFBQyxRQUFLLEtBQUssS0FBSyxVQUFVLEdBQUcsdUJBQXVCLFlBQVksS0FBSyxVQUFVLENBQUM7QUFBQSxFQUN4RjtBQUFBLEVBRUEsa0JBQWtCLFdBQW1CLFlBQW9CLFlBQTBCO0FBQ2pGLFVBQU0sWUFBWSxLQUFLLG1CQUFtQixVQUFVO0FBQ3BELG9CQUFBQyxRQUFHLFVBQVUsa0JBQUFELFFBQUssUUFBUSxTQUFTLEdBQUcsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUN6RCxvQkFBQUMsUUFBRyxhQUFhLFdBQVcsU0FBUztBQUNwQyxVQUFNLFFBQVEsS0FBSyxVQUFVO0FBQzdCLFVBQU0sVUFBVSxJQUFJO0FBQUEsTUFDbEIsV0FBVyxrQkFBQUQsUUFBSyxTQUFTLEtBQUssV0FBVyxTQUFTO0FBQUEsTUFDbEQ7QUFBQSxNQUNBLFdBQVUsb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxJQUNuQztBQUNBLFNBQUssV0FBVyxLQUFLO0FBQUEsRUFDdkI7QUFBQSxFQUVBLElBQUksWUFBNkI7QUFDL0IsV0FBTyxnQkFBQUMsUUFBRyxXQUFXLEtBQUssbUJBQW1CLFVBQVUsQ0FBQztBQUFBLEVBQzFEO0FBQUEsRUFFQSxZQUFZLFNBQWlCLFNBQXVCO0FBQ2xELFVBQU0sZUFBZSxLQUFLLG1CQUFtQixPQUFPO0FBQ3BELFVBQU0sZUFBZSxLQUFLLG1CQUFtQixPQUFPO0FBQ3BELGtCQUFjLGNBQWMsWUFBWTtBQUN4Qyx1QkFBbUIsa0JBQUFELFFBQUssUUFBUSxZQUFZLEdBQUcsS0FBSyxVQUFVLENBQUM7QUFFL0QsVUFBTSxRQUFRLEtBQUssVUFBVTtBQUM3QixVQUFNLE9BQW1CLENBQUM7QUFDMUIsZUFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLE9BQU8sUUFBUSxLQUFLLEdBQUc7QUFDaEQsVUFBSSxRQUFRLFdBQVcsSUFBSSxXQUFXLEdBQUcsT0FBTyxHQUFHLEdBQUc7QUFDcEQsY0FBTSxTQUFTLElBQUksUUFBUSxTQUFTLE9BQU87QUFDM0MsYUFBSyxNQUFNLElBQUk7QUFBQSxVQUNiLEdBQUc7QUFBQSxVQUNILFdBQVcsa0JBQUFBLFFBQUssU0FBUyxLQUFLLFdBQVcsS0FBSyxtQkFBbUIsTUFBTSxDQUFDO0FBQUEsUUFDMUU7QUFBQSxNQUNGLE9BQU87QUFDTCxhQUFLLEdBQUcsSUFBSTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQ0EsU0FBSyxXQUFXLElBQUk7QUFBQSxFQUN0QjtBQUFBLEVBRUEsYUFBYSxZQUEwQjtBQUNyQyxVQUFNLFNBQVMsS0FBSyxtQkFBbUIsVUFBVTtBQUNqRCxvQkFBQUMsUUFBRyxPQUFPLFFBQVEsRUFBRSxXQUFXLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFDbEQsdUJBQW1CLGtCQUFBRCxRQUFLLFFBQVEsTUFBTSxHQUFHLEtBQUssVUFBVSxDQUFDO0FBRXpELFVBQU0sUUFBUSxLQUFLLFVBQVU7QUFDN0IsVUFBTSxPQUFtQixDQUFDO0FBQzFCLGVBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxPQUFPLFFBQVEsS0FBSyxHQUFHO0FBQ2hELFVBQUksUUFBUSxjQUFjLENBQUMsSUFBSSxXQUFXLEdBQUcsVUFBVSxHQUFHLEVBQUcsTUFBSyxHQUFHLElBQUk7QUFBQSxJQUMzRTtBQUNBLFNBQUssV0FBVyxJQUFJO0FBQUEsRUFDdEI7QUFBQSxFQUVBLFlBQW9CO0FBQ2xCLFdBQU8sa0JBQUFBLFFBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxXQUFXO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLFlBQW9CO0FBQ2xCLFdBQU8sa0JBQUFBLFFBQUssS0FBSyxLQUFLLFVBQVUsR0FBRyxtQkFBbUI7QUFBQSxFQUN4RDtBQUFBLEVBRUEsWUFBd0I7QUFDdEIsVUFBTSxZQUFZLEtBQUssVUFBVTtBQUNqQyxRQUFJLENBQUMsZ0JBQUFDLFFBQUcsV0FBVyxTQUFTLEVBQUcsUUFBTyxDQUFDO0FBQ3ZDLFFBQUk7QUFDRixhQUFPLEtBQUssTUFBTSxnQkFBQUEsUUFBRyxhQUFhLFdBQVcsTUFBTSxDQUFDO0FBQUEsSUFDdEQsUUFBUTtBQUNOLGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxXQUFXLE9BQXlCO0FBQ2xDLG9CQUFBQSxRQUFHLFVBQVUsa0JBQUFELFFBQUssUUFBUSxLQUFLLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDaEUsb0JBQUFDLFFBQUcsY0FBYyxLQUFLLFVBQVUsR0FBRyxLQUFLLFVBQVUsT0FBTyxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ25FO0FBQ0Y7QUFFQSxTQUFTLGNBQWMsVUFBa0IsUUFBc0I7QUFDN0QsTUFBSSxDQUFDLGdCQUFBQSxRQUFHLFdBQVcsUUFBUSxFQUFHO0FBQzlCLE1BQUksQ0FBQyxnQkFBQUEsUUFBRyxXQUFXLE1BQU0sR0FBRztBQUMxQixvQkFBQUEsUUFBRyxVQUFVLGtCQUFBRCxRQUFLLFFBQVEsTUFBTSxHQUFHLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDdEQsb0JBQUFDLFFBQUcsV0FBVyxVQUFVLE1BQU07QUFDOUI7QUFBQSxFQUNGO0FBQ0EsUUFBTSxPQUFPLGdCQUFBQSxRQUFHLFNBQVMsUUFBUTtBQUNqQyxNQUFJLEtBQUssWUFBWSxHQUFHO0FBQ3RCLG9CQUFBQSxRQUFHLFVBQVUsUUFBUSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQ3hDLGVBQVcsUUFBUSxnQkFBQUEsUUFBRyxZQUFZLFFBQVEsR0FBRztBQUMzQyxvQkFBYyxrQkFBQUQsUUFBSyxLQUFLLFVBQVUsSUFBSSxHQUFHLGtCQUFBQSxRQUFLLEtBQUssUUFBUSxJQUFJLENBQUM7QUFBQSxJQUNsRTtBQUNBLG9CQUFBQyxRQUFHLE9BQU8sVUFBVSxFQUFFLFdBQVcsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUFBLEVBQ3RELE9BQU87QUFDTCxvQkFBQUEsUUFBRyxVQUFVLGtCQUFBRCxRQUFLLFFBQVEsTUFBTSxHQUFHLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDdEQsb0JBQUFDLFFBQUcsT0FBTyxRQUFRLEVBQUUsT0FBTyxLQUFLLENBQUM7QUFDakMsb0JBQUFBLFFBQUcsV0FBVyxVQUFVLE1BQU07QUFBQSxFQUNoQztBQUNGO0FBRUEsU0FBUyxtQkFBbUIsV0FBbUIsVUFBd0I7QUFDckUsTUFBSSxVQUFVO0FBQ2QsUUFBTSxPQUFPLGtCQUFBRCxRQUFLLFFBQVEsUUFBUTtBQUNsQyxTQUFPLGtCQUFBQSxRQUFLLFFBQVEsT0FBTyxFQUFFLFdBQVcsSUFBSSxLQUFLLGtCQUFBQSxRQUFLLFFBQVEsT0FBTyxNQUFNLE1BQU07QUFDL0UsUUFBSTtBQUNGLFVBQUksZ0JBQUFDLFFBQUcsV0FBVyxPQUFPLEtBQUssZ0JBQUFBLFFBQUcsWUFBWSxPQUFPLEVBQUUsV0FBVyxFQUFHLGlCQUFBQSxRQUFHLFVBQVUsT0FBTztBQUFBLFVBQ25GO0FBQUEsSUFDUCxRQUFRO0FBQ047QUFBQSxJQUNGO0FBQ0EsY0FBVSxrQkFBQUQsUUFBSyxRQUFRLE9BQU87QUFBQSxFQUNoQztBQUNGOzs7QU43Rk8sSUFBTSwwQkFBTixNQUE4QjtBQUFBLEVBR25DLFlBQ21CLEtBQ0EsV0FBcUMsa0JBQ3RELFVBQ0E7QUFIaUI7QUFDQTtBQUdqQixTQUFLLFdBQVcsWUFBWSxJQUFJLHVCQUF1QjtBQUFBLEVBQ3pEO0FBQUEsRUFSUztBQUFBLEVBVVQsTUFBTSxhQUFhLE9BQXVEO0FBQ3hFLFFBQUksQ0FBQyxLQUFLLFNBQVMsV0FBWSxPQUFNLElBQUksTUFBTSxrREFBa0Q7QUFDakcsVUFBTSxZQUFZLGFBQWEsS0FBSyxHQUFHO0FBQ3ZDLFVBQU0sWUFBWSxrQkFBQUUsUUFBSyxRQUFRLE1BQU0sUUFBUTtBQUM3QyxRQUFJLENBQUMsZ0JBQUFDLFFBQUcsV0FBVyxTQUFTLEVBQUcsT0FBTSxJQUFJLE1BQU0sbUJBQW1CLFNBQVMsRUFBRTtBQUU3RSxVQUFNLFFBQU8sb0JBQUksS0FBSyxHQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUNqRCxVQUFNLFFBQVEsVUFBVSxNQUFNLFNBQVMsb0JBQW9CLFNBQVMsQ0FBQztBQUNyRSxVQUFNLGlCQUFpQix3QkFBd0IsTUFBTSxnQkFBZ0IsU0FBUztBQUM5RSxVQUFNLGVBQWUsc0JBQXNCLE1BQU0sY0FBYyxLQUFLLFNBQVMsYUFBYTtBQUMxRixVQUFNLGVBQWUsTUFBTTtBQUMzQixVQUFNLGFBQWEsZUFBZSxjQUFjLGNBQWM7QUFFOUQsVUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLFdBQVc7QUFBQSxNQUM5QyxXQUFXO0FBQUEsTUFDWDtBQUFBLE1BQ0EsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUVELFNBQUssTUFBTSxTQUFTLEVBQUUsa0JBQWtCLFdBQVcsWUFBWSxTQUFTLFlBQVk7QUFFcEYsVUFBTSxhQUFhLHVCQUF1QixLQUFLLFNBQVMscUJBQXFCLGNBQWMsS0FBSyxTQUFTLGFBQWE7QUFDdEgsVUFBTSxLQUFLLElBQUksTUFBTSxhQUFhLFVBQVUsRUFBRSxNQUFNLE1BQU0sTUFBUztBQUNuRSxVQUFNLFVBQVUsTUFBTSxtQkFBbUIsS0FBSyxLQUFLLGtCQUFBRCxRQUFLLE1BQU0sS0FBSyxZQUFZLEdBQUcsS0FBSyxLQUFLLENBQUM7QUFDN0YsVUFBTSxPQUFPLGdCQUFBQyxRQUFHLFNBQVMsU0FBUyxFQUFFO0FBQ3BDLFVBQU0sT0FBTyxzQkFBc0I7QUFBQSxNQUNqQztBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxVQUFVLEtBQUssU0FBUztBQUFBLE1BQ3hCO0FBQUEsTUFDQSxXQUFXLE1BQU0sWUFBWSxZQUFZO0FBQUEsTUFDekMsa0JBQWtCLGtCQUFBRCxRQUFLLFNBQVMsU0FBUztBQUFBLE1BQ3pDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsYUFBYSxrQkFBa0IsY0FBYyxLQUFLLFNBQVMsWUFBWSxLQUFLLFNBQVMsWUFBWTtBQUFBLE1BQ2pHLGFBQWEsa0JBQWtCLGNBQWMsS0FBSyxTQUFTLFVBQVU7QUFBQSxNQUNyRTtBQUFBLElBQ0YsR0FBRyxLQUFLLFNBQVMsYUFBYTtBQUU5QixVQUFNLFVBQVUsTUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLFNBQVMsSUFBSTtBQUN6RCxXQUFPO0FBQUEsTUFDTCxNQUFNLEtBQUssUUFBUSxRQUFRO0FBQUEsTUFDM0IsVUFBVSxrQkFBQUEsUUFBSyxLQUFLLFdBQVcsUUFBUSxJQUFJO0FBQUEsTUFDM0M7QUFBQSxNQUNBLGVBQWU7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0saUJBQWlCLE1BQWEsT0FBTyxNQUEwRTtBQUNuSCxVQUFNLFlBQVksYUFBYSxLQUFLLEdBQUc7QUFDdkMsVUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLE1BQU0sS0FBSyxJQUFJO0FBQzNDLFVBQU0sS0FBSyxpQkFBaUIsSUFBSTtBQUNoQyxVQUFNLGFBQWEsR0FBRyxlQUFlLEdBQUc7QUFDeEMsUUFBSSxDQUFDLFdBQVksT0FBTSxJQUFJLE1BQU0sMENBQTBDO0FBRTNFLFVBQU0sUUFBUSxLQUFLLE1BQU0sU0FBUztBQUNsQyxVQUFNLFlBQVksTUFBTSxtQkFBbUIsVUFBVTtBQUNyRCxVQUFNLFdBQVcsZ0JBQUFDLFFBQUcsV0FBVyxTQUFTO0FBRXhDLFFBQUksQ0FBQyxVQUFVO0FBQ2Isc0JBQUFBLFFBQUcsVUFBVSxrQkFBQUQsUUFBSyxRQUFRLFNBQVMsR0FBRyxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQ3pELFlBQU0sVUFBVSxnQkFBQUMsUUFBRyxZQUFZLGtCQUFBRCxRQUFLLEtBQUssTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQ3pFLFVBQUk7QUFDRixjQUFNLGFBQWEsTUFBTSxLQUFLLFNBQVMsYUFBYSxZQUFZLE9BQU87QUFDdkUsd0JBQUFDLFFBQUcsV0FBVyxXQUFXLE1BQU0sU0FBUztBQUN4QyxjQUFNLE9BQU8sTUFBTSxLQUFLLFNBQVMsS0FBSyxVQUFVO0FBQ2hELGNBQU0sUUFBUSxNQUFNLFVBQVU7QUFDOUIsY0FBTSxVQUFVLElBQUk7QUFBQSxVQUNsQixXQUFXLGtCQUFBRCxRQUFLLFNBQVMsV0FBVyxTQUFTO0FBQUEsVUFDN0MsWUFBWSxLQUFLO0FBQUEsVUFDakIsV0FBVSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLFFBQ25DO0FBQ0EsY0FBTSxXQUFXLEtBQUs7QUFBQSxNQUN4QixVQUFFO0FBQ0Esd0JBQUFDLFFBQUcsT0FBTyxTQUFTLEVBQUUsV0FBVyxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQUEsTUFDckQ7QUFBQSxJQUNGO0FBRUEsUUFBSSxLQUFNLFVBQVMsU0FBUztBQUM1QixXQUFPLEVBQUUsUUFBUSxXQUFXLFVBQVUsV0FBVztBQUFBLEVBQ25EO0FBQUEsRUFFQSxNQUFNLGFBQWEsU0FBaUIsU0FBa0M7QUFDcEUsVUFBTSxLQUFLLFNBQVMsYUFBYSxTQUFTLE9BQU87QUFDakQsVUFBTSxVQUFVLGVBQWUsaUJBQWlCLFNBQVMsS0FBSyxTQUFTLFVBQVUsR0FBRyxPQUFPO0FBQzNGLFVBQU0sVUFBVSxNQUFNLEtBQUssMEJBQTBCLFNBQVMsT0FBTztBQUNyRSxTQUFLLE1BQU0sYUFBYSxLQUFLLEdBQUcsQ0FBQyxFQUFFLFlBQVksU0FBUyxPQUFPO0FBQy9ELFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLFlBQVksWUFBcUM7QUFDckQsVUFBTSxLQUFLLFNBQVMsWUFBWSxVQUFVO0FBQzFDLFNBQUssTUFBTSxhQUFhLEtBQUssR0FBRyxDQUFDLEVBQUUsYUFBYSxVQUFVO0FBQzFELFdBQU8sS0FBSyx1QkFBdUIsVUFBVTtBQUFBLEVBQy9DO0FBQUEsRUFFQSxNQUFNLDBCQUEwQixTQUFpQixTQUFrQztBQUNqRixVQUFNLFNBQVEsb0JBQUksS0FBSyxHQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUNsRCxRQUFJLFVBQVU7QUFDZCxlQUFXLFFBQVEsS0FBSyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDcEQsWUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLE1BQU0sS0FBSyxJQUFJO0FBQzNDLFVBQUksQ0FBQyxLQUFLLFNBQVMsT0FBTyxFQUFHO0FBQzdCLFlBQU0sS0FBSyxpQkFBaUIsSUFBSTtBQUNoQyxZQUFNLFVBQVUsR0FBRyxTQUFTLGtCQUN4QixzQ0FBc0MsTUFBTSxTQUFTLFNBQVMsT0FBTyxLQUFLLFNBQVMsWUFBWSxLQUFLLFNBQVMsWUFBWSxJQUN6SCxLQUFLLE1BQU0sT0FBTyxFQUFFLEtBQUssT0FBTztBQUNwQyxVQUFJLFlBQVksTUFBTTtBQUNwQixjQUFNLEtBQUssSUFBSSxNQUFNLE9BQU8sTUFBTSxPQUFPO0FBQ3pDLG1CQUFXO0FBQUEsTUFDYjtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSx1QkFBdUIsWUFBcUM7QUFDaEUsVUFBTSxTQUFRLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFDbEQsUUFBSSxVQUFVO0FBQ2QsZUFBVyxRQUFRLEtBQUssSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQ3BELFlBQU0sT0FBTyxNQUFNLEtBQUssSUFBSSxNQUFNLEtBQUssSUFBSTtBQUMzQyxVQUFJLENBQUMsS0FBSyxTQUFTLFVBQVUsRUFBRztBQUNoQyxZQUFNLFVBQVUsNEJBQTRCLE1BQU0sWUFBWSxPQUFPLHdDQUF3QztBQUM3RyxVQUFJLFlBQVksTUFBTTtBQUNwQixjQUFNLEtBQUssSUFBSSxNQUFNLE9BQU8sTUFBTSxPQUFPO0FBQ3pDLG1CQUFXO0FBQUEsTUFDYjtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSw0QkFBdUQ7QUFDM0QsUUFBSSxRQUFRO0FBQ1osUUFBSSxVQUFVO0FBQ2QsUUFBSSxTQUFTO0FBQ2IsUUFBSSxVQUFVO0FBQ2QsVUFBTSxTQUFRLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFFbEQsZUFBVyxRQUFRLEtBQUssSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQ3BELFlBQU0sT0FBTyxNQUFNLEtBQUssSUFBSSxNQUFNLEtBQUssSUFBSTtBQUMzQyxZQUFNLEtBQUssaUJBQWlCLElBQUk7QUFDaEMsWUFBTSxhQUFhLEdBQUcsZUFBZSxHQUFHO0FBQ3hDLFVBQUksR0FBRyxTQUFTLG1CQUFtQixDQUFDLFdBQVk7QUFDaEQsVUFBSTtBQUNGLGNBQU0sS0FBSyxTQUFTLEtBQUssVUFBVTtBQUNuQyxpQkFBUztBQUFBLE1BQ1gsU0FBUyxPQUFPO0FBQ2QsWUFBSSxDQUFDLHlCQUF5QixLQUFLLEdBQUc7QUFDcEMsb0JBQVU7QUFDVixrQkFBUSxLQUFLLHNCQUFzQixLQUFLLElBQUksS0FBSyxLQUFLO0FBQ3REO0FBQUEsUUFDRjtBQUNBLG1CQUFXO0FBQ1gsY0FBTSxVQUFVLDRCQUE0QixNQUFNLFlBQVksT0FBTywyQ0FBMkM7QUFDaEgsWUFBSSxZQUFZLE1BQU07QUFDcEIsZ0JBQU0sS0FBSyxJQUFJLE1BQU0sT0FBTyxNQUFNLE9BQU87QUFDekMscUJBQVc7QUFBQSxRQUNiO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxXQUFPLEVBQUUsT0FBTyxTQUFTLFNBQVMsT0FBTztBQUFBLEVBQzNDO0FBQUEsRUFFQSxNQUFNLGdCQUFnQixrQkFBeUM7QUFDN0QsVUFBTSxZQUFZLGFBQWEsS0FBSyxHQUFHO0FBQ3ZDLFVBQU0sTUFBTSxrQkFBa0IsV0FBVyxnQkFBZ0I7QUFDekQsVUFBTSxPQUFPLEtBQUssSUFBSSxNQUFNLHNCQUFzQixHQUFHO0FBQ3JELFFBQUksZ0JBQWdCLFVBQVUsZUFBZSxNQUFNO0FBQ2pELFlBQU0sS0FBSyxJQUFJLFVBQVUsUUFBUSxLQUFLLEVBQUUsU0FBUyxJQUFhO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQUEsRUFFUSxNQUFNLFdBQWlDO0FBQzdDLFdBQU8sSUFBSSxhQUFhLFdBQVcsS0FBSyxTQUFTLGFBQWEsS0FBSyxTQUFTLFVBQVU7QUFBQSxFQUN4RjtBQUNGO0FBRUEsU0FBUyxTQUFTLFVBQXdCO0FBQ3hDLE1BQUksUUFBUSxhQUFhLFVBQVU7QUFDakMsOENBQVUsZ0JBQUFBLFFBQUcsV0FBVyxlQUFlLElBQUksa0JBQWtCLFFBQVEsQ0FBQyxRQUFRLEdBQUcsRUFBRSxPQUFPLFNBQVMsQ0FBQztBQUNwRztBQUFBLEVBQ0Y7QUFDQSxNQUFJLFFBQVEsYUFBYSxTQUFTO0FBQ2hDLDhDQUFVLE9BQU8sQ0FBQyxNQUFNLFNBQVMsSUFBSSxRQUFRLEdBQUcsRUFBRSxPQUFPLFNBQVMsQ0FBQztBQUNuRTtBQUFBLEVBQ0Y7QUFDQSw0Q0FBVSxZQUFZLENBQUMsUUFBUSxHQUFHLEVBQUUsT0FBTyxTQUFTLENBQUM7QUFDdkQ7OztBTzdPQSxJQUFBQyxtQkFBNEM7QUFDNUMsSUFBQUMsb0JBQWlCOzs7QUNEakIsSUFBQUMsbUJBQW1DOzs7QUNBbkMsc0JBQXNCO0FBRWYsSUFBTSxtQkFBTixjQUErQixzQkFBTTtBQUFBLEVBRzFDLFlBQ0UsS0FDaUIsV0FDQSxTQUNBLGNBQ0EsYUFDQSxXQUNqQjtBQUNBLFVBQU0sR0FBRztBQU5RO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQSxFQUduQjtBQUFBLEVBWFEsUUFBUTtBQUFBLEVBYWhCLFNBQWU7QUFDYixTQUFLLFVBQVUsTUFBTTtBQUNyQixTQUFLLFVBQVUsU0FBUyx5QkFBeUI7QUFDakQsU0FBSyxVQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxVQUFVLENBQUM7QUFDdEQsU0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFFLEtBQUssMEJBQTBCLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFDbEYsU0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFFLEtBQUssMEJBQTBCLE1BQU0sUUFBUSxLQUFLLFlBQVksZUFBZSxDQUFDO0FBRTdHLFVBQU0sUUFBUSxLQUFLLFVBQVUsU0FBUyxPQUFPO0FBQzdDLFVBQU0sT0FBTztBQUNiLFVBQU0sU0FBUyxpQ0FBaUM7QUFDaEQsVUFBTSxVQUFVLE1BQU07QUFBRSxXQUFLLFFBQVEsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUFHO0FBRXpELFVBQU0sVUFBVSxLQUFLLFVBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyw0QkFBNEIsQ0FBQztBQUNuRixVQUFNLFVBQVUsUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLEtBQUssWUFBWSxDQUFDO0FBQ3JFLFlBQVEsT0FBTztBQUNmLFlBQVEsU0FBUyxhQUFhO0FBQzlCLFlBQVEsVUFBVSxNQUFNO0FBQ3RCLFVBQUksS0FBSyxVQUFVLEtBQUssYUFBYztBQUN0QyxXQUFLLE1BQU07QUFDWCxXQUFLLFVBQVU7QUFBQSxJQUNqQjtBQUVBLFVBQU0sU0FBUyxRQUFRLFNBQVMsVUFBVSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzVELFdBQU8sT0FBTztBQUNkLFdBQU8sVUFBVSxNQUFNLEtBQUssTUFBTTtBQUNsQyxVQUFNLE1BQU07QUFBQSxFQUNkO0FBQ0Y7QUFFTyxJQUFNLG9CQUFOLGNBQWdDLHNCQUFNO0FBQUEsRUFHM0MsWUFDRSxLQUNpQixhQUNqQixhQUNpQixVQUNqQjtBQUNBLFVBQU0sR0FBRztBQUpRO0FBRUE7QUFHakIsU0FBSyxVQUFVO0FBQUEsRUFDakI7QUFBQSxFQVZRO0FBQUEsRUFZUixTQUFlO0FBQ2IsU0FBSyxVQUFVLE1BQU07QUFDckIsU0FBSyxVQUFVLFNBQVMseUJBQXlCO0FBQ2pELFNBQUssVUFBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELFNBQUssVUFBVSxTQUFTLEtBQUssRUFBRSxLQUFLLDBCQUEwQixNQUFNLEtBQUssWUFBWSxDQUFDO0FBRXRGLFVBQU0sUUFBUSxLQUFLLFVBQVUsU0FBUyxPQUFPO0FBQzdDLFVBQU0sT0FBTztBQUNiLFVBQU0sUUFBUSxLQUFLO0FBQ25CLFVBQU0sU0FBUyxpQ0FBaUM7QUFDaEQsVUFBTSxVQUFVLE1BQU07QUFBRSxXQUFLLFVBQVUsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUFHO0FBRTNELFVBQU0sVUFBVSxLQUFLLFVBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyw0QkFBNEIsQ0FBQztBQUNuRixVQUFNLFNBQVMsUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM1RCxXQUFPLE9BQU87QUFDZCxXQUFPLFNBQVMsU0FBUztBQUN6QixXQUFPLFVBQVUsTUFBTTtBQUNyQixVQUFJLENBQUMsS0FBSyxXQUFXLEtBQUssUUFBUSxTQUFTLEdBQUcsRUFBRztBQUNqRCxXQUFLLE1BQU07QUFDWCxXQUFLLFNBQVMsS0FBSyxPQUFPO0FBQUEsSUFDNUI7QUFFQSxVQUFNLFNBQVMsUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM1RCxXQUFPLE9BQU87QUFDZCxXQUFPLFVBQVUsTUFBTSxLQUFLLE1BQU07QUFDbEMsVUFBTSxNQUFNO0FBQ1osVUFBTSxPQUFPO0FBQUEsRUFDZjtBQUNGO0FBRU8sSUFBTSxpQkFBTixjQUE2QixzQkFBTTtBQUFBLEVBR3hDLFlBQ0UsS0FDaUIsWUFDQSxVQUNqQjtBQUNBLFVBQU0sR0FBRztBQUhRO0FBQ0E7QUFBQSxFQUduQjtBQUFBLEVBUlEsYUFBYTtBQUFBLEVBVXJCLFNBQWU7QUFDYixTQUFLLFVBQVUsTUFBTTtBQUNyQixTQUFLLFVBQVUsU0FBUyx5QkFBeUI7QUFDakQsU0FBSyxVQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BELFNBQUssVUFBVSxTQUFTLEtBQUssRUFBRSxLQUFLLDBCQUEwQixNQUFNLHlCQUF5QixLQUFLLFVBQVUsR0FBRyxDQUFDO0FBRWhILFVBQU0sUUFBUSxLQUFLLFVBQVUsU0FBUyxPQUFPO0FBQzdDLFVBQU0sT0FBTztBQUNiLFVBQU0sY0FBYztBQUNwQixVQUFNLFNBQVMsaUNBQWlDO0FBQ2hELFVBQU0sVUFBVSxNQUFNO0FBQUUsV0FBSyxhQUFhLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFBRztBQUU5RCxVQUFNLFVBQVUsS0FBSyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssNEJBQTRCLENBQUM7QUFDbkYsVUFBTSxTQUFTLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRSxXQUFPLE9BQU87QUFDZCxXQUFPLFNBQVMsU0FBUztBQUN6QixXQUFPLFVBQVUsTUFBTTtBQUNyQixVQUFJLENBQUMsS0FBSyxjQUFjLEtBQUssV0FBVyxTQUFTLEdBQUcsRUFBRztBQUN2RCxXQUFLLE1BQU07QUFDWCxXQUFLLFNBQVMsS0FBSyxVQUFVO0FBQUEsSUFDL0I7QUFFQSxVQUFNLFNBQVMsUUFBUSxTQUFTLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM1RCxXQUFPLE9BQU87QUFDZCxXQUFPLFVBQVUsTUFBTSxLQUFLLE1BQU07QUFDbEMsVUFBTSxNQUFNO0FBQUEsRUFDZDtBQUNGOzs7QUR6SE8sSUFBTSxvQkFBTixjQUFnQyx1QkFBTTtBQUFBLEVBUzNDLFlBQ0UsS0FDaUIsU0FDQSxZQUNqQixhQUNpQixVQUNqQjtBQUNBLFVBQU0sR0FBRztBQUxRO0FBQ0E7QUFFQTtBQUdqQixTQUFLLGVBQWUsc0JBQXNCLGFBQWEsVUFBVTtBQUNqRSxTQUFLLFNBQVMsSUFBSSxVQUFVO0FBQzVCLFNBQUssZ0JBQWdCLEtBQUssWUFBWTtBQUFBLEVBQ3hDO0FBQUEsRUFuQmlCLFdBQVcsb0JBQUksSUFBWTtBQUFBLEVBQzNCLGNBQWMsb0JBQUksSUFBc0I7QUFBQSxFQUN4QyxVQUFVLG9CQUFJLElBQVk7QUFBQSxFQUNuQyxVQUE4QjtBQUFBLEVBQzlCLFNBQTZCO0FBQUEsRUFDN0I7QUFBQSxFQUNBLFNBQTZCO0FBQUEsRUFlckMsU0FBZTtBQUNiLFNBQUssUUFBUSxTQUFTLCtCQUErQjtBQUNyRCxTQUFLLFVBQVUsTUFBTTtBQUNyQixTQUFLLFVBQVUsU0FBUyx5QkFBeUI7QUFDakQsU0FBSyxVQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDbkUsU0FBSyxVQUFVLFNBQVMsS0FBSztBQUFBLE1BQzNCLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxJQUNSLENBQUM7QUFFRCxTQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssaUNBQWlDLENBQUM7QUFDdEYsU0FBSyxVQUFVLEtBQUssVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLDBCQUEwQixDQUFDO0FBQ2hGLFNBQUssUUFBUSxLQUFLO0FBRWxCLFVBQU0sVUFBVSxLQUFLLFVBQVUsU0FBUyxPQUFPLEVBQUUsS0FBSyw0QkFBNEIsQ0FBQztBQUNuRixTQUFLLGFBQWEsU0FBUyx1QkFBdUIsV0FBVyxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQ2hGLFNBQUssYUFBYSxTQUFTLGNBQWMsSUFBSSxNQUFNLEtBQUsscUJBQXFCLENBQUM7QUFDOUUsU0FBSyxhQUFhLFNBQVMsbUJBQW1CLElBQUksTUFBTSxLQUFLLGVBQWUsQ0FBQztBQUM3RSxTQUFLLGFBQWEsU0FBUyxtQkFBbUIsZUFBZSxNQUFNLEtBQUssZUFBZSxDQUFDO0FBQ3hGLFNBQUssYUFBYSxTQUFTLFdBQVcsSUFBSSxNQUFNLEtBQUssZ0JBQWdCLENBQUM7QUFFdEUsU0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLGdDQUFnQyxDQUFDO0FBQ3JGLFNBQUssV0FBVztBQUNoQixTQUFLLEtBQUssYUFBYSxLQUFLLFlBQVksSUFBSTtBQUFBLEVBQzlDO0FBQUEsRUFFUSxTQUFlO0FBQ3JCLFNBQUssU0FBUyxLQUFLLFlBQVk7QUFDL0IsU0FBSyxNQUFNO0FBQUEsRUFDYjtBQUFBLEVBRVEsYUFBYSxRQUFxQixNQUFjLEtBQWEsU0FBd0M7QUFDM0csVUFBTSxTQUFTLE9BQU8sU0FBUyxVQUFVLEVBQUUsS0FBSyxDQUFDO0FBQ2pELFdBQU8sT0FBTztBQUNkLFFBQUksSUFBSyxRQUFPLFNBQVMsR0FBRztBQUM1QixXQUFPLFVBQVU7QUFDakIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVRLGdCQUFnQixZQUEwQjtBQUNoRCxRQUFJLFVBQVUsc0JBQXNCLFlBQVksS0FBSyxVQUFVO0FBQy9ELFdBQU8sV0FBVyxZQUFZLEtBQUssWUFBWTtBQUM3QyxXQUFLLFNBQVMsSUFBSSxpQkFBaUIsU0FBUyxLQUFLLFVBQVUsQ0FBQztBQUM1RCxnQkFBVSxpQkFBaUIsU0FBUyxLQUFLLFVBQVU7QUFBQSxJQUNyRDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLGFBQW1CO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLFVBQVUsQ0FBQyxLQUFLLE9BQVE7QUFDbEMsU0FBSyxPQUFPLFFBQVEsb0JBQW9CLEtBQUssWUFBWSxFQUFFO0FBQzNELFNBQUssT0FBTyxNQUFNO0FBQ2xCLFNBQUssV0FBVyxLQUFLLFlBQVksQ0FBQztBQUFBLEVBQ3BDO0FBQUEsRUFFUSxXQUFXLFlBQW9CLE9BQXFCO0FBQzFELFFBQUksQ0FBQyxLQUFLLE9BQVE7QUFDbEIsVUFBTSxNQUFNLEtBQUssT0FBTyxTQUFTLE9BQU8sRUFBRSxLQUFLLDZCQUE2QixDQUFDO0FBQzdFLFFBQUksZUFBZSxLQUFLLGFBQWMsS0FBSSxTQUFTLGFBQWE7QUFDaEUsUUFBSSxNQUFNLFlBQVksV0FBVyxPQUFPLEtBQUssQ0FBQztBQUU5QyxVQUFNLFNBQVMsSUFBSSxTQUFTLFVBQVUsRUFBRSxLQUFLLGdDQUFnQyxDQUFDO0FBQzlFLFdBQU8sT0FBTztBQUNkLFVBQU0saUJBQWlCLEtBQUssWUFBWSxJQUFJLFVBQVU7QUFDdEQsVUFBTSxvQkFBb0IsTUFBTSxRQUFRLGNBQWMsS0FBSyxlQUFlLFNBQVM7QUFDbkYsV0FBTyxRQUFRLEtBQUssU0FBUyxJQUFJLFVBQVUsSUFBSSxXQUFNLFFBQUc7QUFDeEQsV0FBTyxVQUFVLENBQUMsVUFBVTtBQUMxQixZQUFNLGdCQUFnQjtBQUN0QixXQUFLLEtBQUssYUFBYSxVQUFVO0FBQUEsSUFDbkM7QUFFQSxVQUFNLE9BQU8sSUFBSSxTQUFTLFVBQVUsRUFBRSxLQUFLLDhCQUE4QixDQUFDO0FBQzFFLFNBQUssT0FBTztBQUNaLFNBQUssU0FBUyxRQUFRLEVBQUUsTUFBTSxTQUFTLFlBQVksS0FBSyxVQUFVLEVBQUUsQ0FBQztBQUNyRSxTQUFLLFVBQVUsTUFBTSxLQUFLLGFBQWEsVUFBVTtBQUNqRCxTQUFLLGFBQWEsTUFBTTtBQUFFLFdBQUssS0FBSyxhQUFhLFVBQVU7QUFBQSxJQUFHO0FBQzlELFFBQUksU0FBUyxRQUFRLEVBQUUsS0FBSyxpQ0FBaUMsTUFBTSxLQUFLLFFBQVEsSUFBSSxVQUFVLElBQUksZUFBZSxHQUFHLENBQUM7QUFFckgsUUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLEdBQUc7QUFDakMsVUFBSSxDQUFDLGdCQUFnQjtBQUNuQixhQUFLLE9BQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyxnQ0FBZ0MsTUFBTSxhQUFhLENBQUMsRUFBRSxNQUFNLFlBQVksV0FBVyxPQUFPLFFBQVEsQ0FBQyxDQUFDO0FBQUEsTUFDekksV0FBVyxDQUFDLG1CQUFtQjtBQUM3QixhQUFLLE9BQU8sU0FBUyxPQUFPLEVBQUUsS0FBSyxnQ0FBZ0MsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLE1BQU0sWUFBWSxXQUFXLE9BQU8sUUFBUSxDQUFDLENBQUM7QUFBQSxNQUM1SSxPQUFPO0FBQ0wsbUJBQVcsU0FBUyxlQUFnQixNQUFLLFdBQVcsZUFBZSxZQUFZLEtBQUssR0FBRyxRQUFRLENBQUM7QUFBQSxNQUNsRztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFUSxhQUFhLFlBQTBCO0FBQzdDLFNBQUssZUFBZSxzQkFBc0IsWUFBWSxLQUFLLFVBQVU7QUFDckUsU0FBSyxnQkFBZ0IsS0FBSyxZQUFZO0FBQ3RDLFNBQUssVUFBVTtBQUNmLFNBQUssV0FBVztBQUNoQixTQUFLLEtBQUssYUFBYSxLQUFLLGNBQWMsSUFBSTtBQUFBLEVBQ2hEO0FBQUEsRUFFQSxNQUFjLGFBQWEsWUFBbUM7QUFDNUQsUUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLEdBQUc7QUFDakMsV0FBSyxTQUFTLE9BQU8sVUFBVTtBQUMvQixXQUFLLFdBQVc7QUFDaEI7QUFBQSxJQUNGO0FBQ0EsU0FBSyxTQUFTLElBQUksVUFBVTtBQUM1QixTQUFLLFdBQVc7QUFDaEIsVUFBTSxLQUFLLGFBQWEsWUFBWSxJQUFJO0FBQUEsRUFDMUM7QUFBQSxFQUVBLE1BQWMsYUFBYSxZQUFvQixTQUFpQztBQUM5RSxVQUFNLGFBQWEsc0JBQXNCLFlBQVksS0FBSyxVQUFVO0FBQ3BFLFFBQUksS0FBSyxZQUFZLElBQUksVUFBVSxLQUFLLEtBQUssUUFBUSxJQUFJLFVBQVUsRUFBRztBQUN0RSxTQUFLLFFBQVEsSUFBSSxVQUFVO0FBQzNCLFNBQUssV0FBVztBQUNoQixRQUFJO0FBQ0YsWUFBTSxXQUFXLE1BQU0sS0FBSyxRQUFRLFNBQVMsWUFBWSxVQUFVO0FBQ25FLFdBQUssWUFBWSxJQUFJLFlBQVksUUFBUTtBQUN6QyxVQUFJLFFBQVMsTUFBSyxnQkFBZ0IsWUFBWSxRQUFRO0FBQUEsSUFDeEQsU0FBUyxPQUFPO0FBQ2QsV0FBSyxVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQztBQUFBLElBQ3ZFLFVBQUU7QUFDQSxXQUFLLFFBQVEsT0FBTyxVQUFVO0FBQzlCLFdBQUssV0FBVztBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUFBLEVBRVEsZ0JBQWdCLFlBQW9CLFVBQTBCO0FBQ3BFLGVBQVcsU0FBUyxTQUFTLE1BQU0sR0FBRyxFQUFFLEdBQUc7QUFDekMsWUFBTSxZQUFZLGVBQWUsWUFBWSxLQUFLO0FBQ2xELFVBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLFFBQVEsSUFBSSxTQUFTLEdBQUc7QUFDcEUsYUFBSyxLQUFLLFFBQVEsU0FBUyxZQUFZLFNBQVMsRUFBRSxLQUFLLENBQUMsWUFBWSxLQUFLLFlBQVksSUFBSSxXQUFXLE9BQU8sQ0FBQyxFQUFFLE1BQU0sTUFBTSxNQUFTO0FBQUEsTUFDckk7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxrQkFBaUM7QUFDN0MsU0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZO0FBQ3pDLFVBQU0sS0FBSyxhQUFhLEtBQUssY0FBYyxJQUFJO0FBQUEsRUFDakQ7QUFBQSxFQUVRLHVCQUE2QjtBQUNuQyxRQUFJLGVBQWUsS0FBSyxLQUFLLEtBQUssY0FBYyxDQUFDLGVBQWU7QUFBRSxXQUFLLEtBQUssb0JBQW9CLFVBQVU7QUFBQSxJQUFHLENBQUMsRUFBRSxLQUFLO0FBQUEsRUFDdkg7QUFBQSxFQUVBLE1BQWMsb0JBQW9CLFlBQW1DO0FBQ25FLFVBQU0sYUFBYSxLQUFLO0FBQ3hCLFVBQU0sVUFBVSxlQUFlLFlBQVksVUFBVTtBQUNyRCxVQUFNLFNBQVMsSUFBSSx3QkFBTyw2QkFBNkIsQ0FBQztBQUN4RCxRQUFJO0FBQ0YsWUFBTSxLQUFLLFFBQVEsU0FBUyxhQUFhLFlBQVksVUFBVTtBQUMvRCxZQUFNLFVBQVUsS0FBSyxZQUFZLElBQUksVUFBVSxLQUFLLENBQUM7QUFDckQsVUFBSSxDQUFDLFFBQVEsU0FBUyxVQUFVLEVBQUcsTUFBSyxZQUFZLElBQUksWUFBWSxDQUFDLEdBQUcsU0FBUyxVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDL0gsV0FBSyxZQUFZLElBQUksU0FBUyxDQUFDLENBQUM7QUFDaEMsV0FBSyxlQUFlO0FBQ3BCLFdBQUssU0FBUyxJQUFJLFVBQVU7QUFDNUIsV0FBSyxnQkFBZ0IsT0FBTztBQUM1QixXQUFLLFdBQVc7QUFDaEIsVUFBSSx3QkFBTyxpQkFBaUI7QUFBQSxJQUM5QixTQUFTLE9BQU87QUFDZCxXQUFLLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFDO0FBQ3JFLFVBQUksd0JBQU8sOENBQThDO0FBQ3pELGNBQVEsTUFBTSx5QkFBeUIsS0FBSztBQUFBLElBQzlDLFVBQUU7QUFDQSxhQUFPLEtBQUs7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUJBQXVCO0FBQzdCLFFBQUksYUFBYSxLQUFLLGNBQWMsS0FBSyxVQUFVLEdBQUc7QUFDcEQsV0FBSyxVQUFVLHlDQUF5QztBQUN4RDtBQUFBLElBQ0Y7QUFDQSxRQUFJLGtCQUFrQixLQUFLLEtBQUssS0FBSyxjQUFjLFNBQVMsS0FBSyxjQUFjLEtBQUssVUFBVSxHQUFHLENBQUMsWUFBWTtBQUFFLFdBQUssS0FBSyxjQUFjLE9BQU87QUFBQSxJQUFHLENBQUMsRUFBRSxLQUFLO0FBQUEsRUFDNUo7QUFBQSxFQUVBLE1BQWMsY0FBYyxTQUFnQztBQUMxRCxVQUFNLFVBQVUsS0FBSztBQUNyQixVQUFNLFVBQVUsZUFBZSxpQkFBaUIsU0FBUyxLQUFLLFVBQVUsR0FBRyxPQUFPO0FBQ2xGLFVBQU0sU0FBUyxJQUFJLHdCQUFPLHlDQUF5QyxDQUFDO0FBQ3BFLFFBQUk7QUFDRixZQUFNLEtBQUssUUFBUSxhQUFhLFNBQVMsT0FBTztBQUNoRCxXQUFLLGlCQUFpQixTQUFTLE9BQU87QUFDdEMsV0FBSyxlQUFlO0FBQ3BCLFdBQUssZ0JBQWdCLE9BQU87QUFDNUIsV0FBSyxXQUFXO0FBQ2hCLFVBQUksd0JBQU8sNENBQTRDO0FBQUEsSUFDekQsU0FBUyxPQUFPO0FBQ2QsV0FBSyxVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQztBQUNyRSxVQUFJLHdCQUFPLHVDQUF1QztBQUNsRCxjQUFRLE1BQU0seUJBQXlCLEtBQUs7QUFBQSxJQUM5QyxVQUFFO0FBQ0EsYUFBTyxLQUFLO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLGlCQUF1QjtBQUM3QixRQUFJLGFBQWEsS0FBSyxjQUFjLEtBQUssVUFBVSxHQUFHO0FBQ3BELFdBQUssVUFBVSx5Q0FBeUM7QUFDeEQ7QUFBQSxJQUNGO0FBQ0EsVUFBTSxhQUFhLFNBQVMsS0FBSyxjQUFjLEtBQUssVUFBVTtBQUM5RCxVQUFNLFVBQVUsa0JBQWtCLEtBQUssWUFBWTtBQUNuRCxRQUFJLGlCQUFpQixLQUFLLEtBQUssaUJBQWlCLFNBQVMsWUFBWSxpQkFBaUIsTUFBTTtBQUFFLFdBQUssS0FBSyxjQUFjO0FBQUEsSUFBRyxDQUFDLEVBQUUsS0FBSztBQUFBLEVBQ25JO0FBQUEsRUFFQSxNQUFjLGdCQUErQjtBQUMzQyxVQUFNLFVBQVUsS0FBSztBQUNyQixVQUFNLFNBQVMsSUFBSSx3QkFBTyw2QkFBNkIsQ0FBQztBQUN4RCxRQUFJO0FBQ0YsWUFBTSxLQUFLLFFBQVEsWUFBWSxPQUFPO0FBQ3RDLFdBQUssc0JBQXNCLE9BQU87QUFDbEMsV0FBSyxlQUFlLGlCQUFpQixTQUFTLEtBQUssVUFBVTtBQUM3RCxXQUFLLFdBQVc7QUFDaEIsVUFBSSx3QkFBTyx3QkFBd0I7QUFBQSxJQUNyQyxTQUFTLE9BQU87QUFDZCxXQUFLLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFDO0FBQ3JFLFVBQUksd0JBQU8sdUNBQXVDO0FBQ2xELGNBQVEsTUFBTSx5QkFBeUIsS0FBSztBQUFBLElBQzlDLFVBQUU7QUFDQSxhQUFPLEtBQUs7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUJBQWlCLFNBQWlCLFNBQXVCO0FBQy9ELFVBQU0sT0FBTyxvQkFBSSxJQUFzQjtBQUN2QyxlQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssS0FBSyxZQUFZLFFBQVEsR0FBRztBQUNyRCxVQUFJLGlCQUFpQixLQUFLLE9BQU8sRUFBRyxNQUFLLElBQUksSUFBSSxRQUFRLFNBQVMsT0FBTyxHQUFHLEtBQUs7QUFBQSxVQUM1RSxNQUFLLElBQUksS0FBSyxLQUFLO0FBQUEsSUFDMUI7QUFDQSxTQUFLLFlBQVksTUFBTTtBQUN2QixlQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssS0FBSyxRQUFRLEVBQUcsTUFBSyxZQUFZLElBQUksS0FBSyxLQUFLO0FBQzFFLFNBQUssWUFBWSxPQUFPLGlCQUFpQixTQUFTLEtBQUssVUFBVSxDQUFDO0FBQ2xFLFNBQUssWUFBWSxPQUFPLGlCQUFpQixTQUFTLEtBQUssVUFBVSxDQUFDO0FBQUEsRUFDcEU7QUFBQSxFQUVRLHNCQUFzQixZQUEwQjtBQUN0RCxVQUFNLFNBQVMsaUJBQWlCLFlBQVksS0FBSyxVQUFVO0FBQzNELFVBQU0sT0FBTyxTQUFTLFlBQVksS0FBSyxVQUFVO0FBQ2pELFVBQU0sV0FBVyxLQUFLLFlBQVksSUFBSSxNQUFNO0FBQzVDLFFBQUksU0FBVSxNQUFLLFlBQVksSUFBSSxRQUFRLFNBQVMsT0FBTyxDQUFDLFdBQVcsV0FBVyxJQUFJLENBQUM7QUFDdkYsZUFBVyxPQUFPLE1BQU0sS0FBSyxLQUFLLFlBQVksS0FBSyxDQUFDLEdBQUc7QUFDckQsVUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUcsTUFBSyxZQUFZLE9BQU8sR0FBRztBQUFBLElBQ3BFO0FBQUEsRUFDRjtBQUFBLEVBRVEsVUFBVSxTQUF1QjtBQUN2QyxRQUFJLENBQUMsS0FBSyxRQUFTO0FBQ25CLFNBQUssUUFBUSxRQUFRLE9BQU87QUFDNUIsU0FBSyxRQUFRLEtBQUs7QUFBQSxFQUNwQjtBQUFBLEVBRVEsWUFBa0I7QUFDeEIsU0FBSyxTQUFTLEtBQUs7QUFBQSxFQUNyQjtBQUNGOzs7QUR6UU8sSUFBTSxvQkFBTixjQUFnQyx1QkFBTTtBQUFBLEVBVzNDLFlBQ0UsS0FDaUIsU0FDQSxVQUNqQjtBQUNBLFVBQU0sR0FBRztBQUhRO0FBQ0E7QUFHakIsU0FBSyxTQUFTO0FBQUEsTUFDWixVQUFVO0FBQUEsTUFDVixPQUFPO0FBQUEsTUFDUCxnQkFBZ0I7QUFBQSxNQUNoQixjQUFjO0FBQUEsTUFDZCxtQkFBbUIsU0FBUztBQUFBLE1BQzVCLFdBQVc7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUFBLEVBeEJpQjtBQUFBLEVBQ1QsZ0JBQW9DO0FBQUEsRUFDcEMsVUFBOEI7QUFBQSxFQUM5QixlQUFtQztBQUFBLEVBQ25DLG1CQUFtQztBQUFBLEVBQ25DLGFBQXVEO0FBQUEsRUFDdkQsZUFBZTtBQUFBLEVBQ2Ysc0JBQWdFO0FBQUEsRUFDaEUsd0JBQXdCO0FBQUEsRUFrQmhDLFNBQWU7QUFDYixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMseUJBQXlCO0FBQzVDLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUUzRCxTQUFLLFVBQVUsVUFBVSxTQUFTLE9BQU8sRUFBRSxLQUFLLDBCQUEwQixDQUFDO0FBQzNFLFNBQUssUUFBUSxLQUFLO0FBRWxCLFVBQU0sWUFBWSxTQUFTLGNBQWMsT0FBTztBQUNoRCxjQUFVLE9BQU87QUFDakIsY0FBVSxTQUFTLDBCQUEwQjtBQUM3QyxjQUFVLFlBQVksU0FBUztBQUMvQixjQUFVLFdBQVcsTUFBTTtBQUN6QixZQUFNLFNBQVMsVUFBVSxTQUFTLFVBQVUsTUFBTSxDQUFDO0FBQ25ELFlBQU0sYUFBYSx5QkFBeUIsTUFBTTtBQUNsRCxVQUFJLENBQUMsWUFBWTtBQUNmLGFBQUssbUJBQW1CO0FBQ3hCLGFBQUssVUFBVSw0RkFBNEY7QUFDM0c7QUFBQSxNQUNGO0FBQ0EsV0FBSyxZQUFZLFVBQVU7QUFBQSxJQUM3QjtBQUVBLFFBQUkseUJBQVEsU0FBUyxFQUNsQixRQUFRLFlBQVksRUFDcEIsUUFBUSx3SUFBd0ksRUFDaEosVUFBVSxDQUFDLFdBQVc7QUFDckIsYUFBTyxjQUFjLGFBQWE7QUFDbEMsYUFBTyxRQUFRLFlBQVk7QUFDekIsWUFBSTtBQUNGLGdCQUFNLFNBQVMsTUFBTSx5QkFBeUI7QUFDOUMsY0FBSSxPQUFPLE1BQU07QUFDZixpQkFBSyxZQUFZLE9BQU8sSUFBSTtBQUM1QjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLE9BQU8sU0FBVTtBQUNyQixvQkFBVSxNQUFNO0FBQUEsUUFDbEIsU0FBUyxPQUFPO0FBQ2Qsa0JBQVEsTUFBTSw4QkFBOEIsS0FBSztBQUNqRCxlQUFLLG1CQUFtQjtBQUN4QixlQUFLLFVBQVUsbUVBQW1FO0FBQUEsUUFDcEY7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILENBQUM7QUFFSCxTQUFLLGVBQWUsVUFBVSxTQUFTLE9BQU87QUFBQSxNQUM1QyxLQUFLO0FBQUEsTUFDTCxNQUFNO0FBQUEsSUFDUixDQUFDO0FBRUQsU0FBSyxtQkFBbUIsSUFBSSx5QkFBUSxTQUFTLEVBQzFDLFFBQVEsaUJBQWlCLEVBQ3pCLFFBQVEsMEZBQTBGLEVBQ2xHLFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLFdBQUssZUFBZSxtQkFBbUI7QUFDdkMsV0FBSyxTQUFTLENBQUMsVUFBVSxLQUFLLFlBQVksTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQUEsSUFDaEUsQ0FBQztBQUNILFNBQUssaUJBQWlCLFVBQVUsU0FBUywwQkFBMEI7QUFFbkUsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsWUFBWSxFQUNwQixRQUFRLDZGQUE2RixFQUNyRyxRQUFRLENBQUMsU0FBUztBQUNqQixXQUFLLGFBQWE7QUFDbEIsV0FBSyxlQUFlLG1DQUFtQztBQUN2RCxXQUFLLFNBQVMsQ0FBQyxVQUFVO0FBQ3ZCLGFBQUssT0FBTyxRQUFRLE1BQU0sS0FBSztBQUMvQixhQUFLLGVBQWU7QUFBQSxNQUN0QixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBRUgsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsaUJBQWlCLEVBQ3pCLFFBQVEsc0hBQXNILEVBQzlILFFBQVEsQ0FBQyxTQUFTO0FBQ2pCLFdBQUssc0JBQXNCO0FBQzNCLFdBQUssZUFBZSxzQ0FBc0M7QUFDMUQsV0FBSyxTQUFTLENBQUMsVUFBVTtBQUN2QixhQUFLLE9BQU8saUJBQWlCLE1BQU0sS0FBSztBQUN4QyxhQUFLLHdCQUF3QjtBQUM3QixhQUFLLFVBQVU7QUFBQSxNQUNqQixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBRUgsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsZUFBZSxFQUN2QixRQUFRLDRHQUE0RyxFQUNwSCxZQUFZLENBQUMsYUFBYTtBQUN6QixpQkFBVyxRQUFRLEtBQUssU0FBUyxjQUFlLFVBQVMsVUFBVSxNQUFNLElBQUk7QUFDN0UsZUFBUyxTQUFTLEtBQUssT0FBTyxZQUFZO0FBQzFDLGVBQVMsU0FBUyxDQUFDLFVBQVU7QUFDM0IsYUFBSyxPQUFPLGVBQWUsc0JBQXNCLE9BQU8sS0FBSyxTQUFTLGFBQWE7QUFDbkYsYUFBSyxVQUFVO0FBQUEsTUFDakIsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUVILFFBQUkseUJBQVEsU0FBUyxFQUNsQixRQUFRLG9CQUFvQixFQUM1QixRQUFRLDhFQUE4RSxFQUN0RixVQUFVLENBQUMsV0FBVyxPQUNwQixjQUFjLGVBQWUsRUFDN0IsUUFBUSxNQUFNLEtBQUssaUJBQWlCLENBQUMsQ0FBQztBQUUzQyxTQUFLLGdCQUFnQixVQUFVLFNBQVMsT0FBTztBQUFBLE1BQzdDLEtBQUs7QUFBQSxNQUNMLE1BQU0sZ0JBQWdCLEtBQUssT0FBTyxpQkFBaUI7QUFBQSxJQUNyRCxDQUFDO0FBRUQsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFFBQVEsbUJBQW1CLEVBQzNCLFFBQVEsc0VBQXNFLEVBQzlFLFVBQVUsQ0FBQyxXQUFXO0FBQ3JCLGFBQU8sU0FBUyxLQUFLLE9BQU8sU0FBUztBQUNyQyxhQUFPLFlBQVksSUFBSTtBQUN2QixhQUFPLFNBQVMsQ0FBQyxVQUFVO0FBQUUsYUFBSyxPQUFPLFlBQVk7QUFBQSxNQUFPLENBQUM7QUFBQSxJQUMvRCxDQUFDO0FBRUgsUUFBSSx5QkFBUSxTQUFTLEVBQ2xCLFVBQVUsQ0FBQyxXQUFXO0FBQ3JCLGFBQU8sY0FBYyxlQUFlO0FBQ3BDLGFBQU8sT0FBTztBQUNkLGFBQU8sUUFBUSxNQUFNO0FBQUUsYUFBSyxLQUFLLE9BQU87QUFBQSxNQUFHLENBQUM7QUFBQSxJQUM5QyxDQUFDLEVBQ0EsVUFBVSxDQUFDLFdBQVc7QUFDckIsYUFBTyxjQUFjLFFBQVE7QUFDN0IsYUFBTyxRQUFRLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFBQSxJQUNuQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBRVEsWUFBWSxVQUFrQixjQUFjLE1BQVk7QUFDOUQsVUFBTSxtQkFBbUIsa0JBQUFDLFFBQUssU0FBUyxLQUFLLE9BQU8sWUFBWSxFQUFFO0FBQ2pFLFNBQUssT0FBTyxXQUFXO0FBQ3ZCLFFBQUksS0FBSyxjQUFjO0FBQ3JCLFdBQUssYUFBYSxRQUFRLFdBQVcseUJBQXlCLFFBQVEsS0FBSyx1QkFBdUI7QUFBQSxJQUNwRztBQUVBLFFBQUksYUFBYSxLQUFLLHlCQUF5QixDQUFDLEtBQUssT0FBTyxrQkFBa0IsS0FBSyxPQUFPLG1CQUFtQixtQkFBbUI7QUFDOUgsV0FBSyxPQUFPLGlCQUFpQixrQkFBQUEsUUFBSyxTQUFTLFFBQVE7QUFDbkQsV0FBSyx3QkFBd0I7QUFDN0IsV0FBSyxxQkFBcUIsU0FBUyxLQUFLLE9BQU8sY0FBYztBQUFBLElBQy9EO0FBRUEsUUFBSSxZQUFZLGdCQUFnQixLQUFLLGdCQUFnQixDQUFDLEtBQUssT0FBTyxRQUFRO0FBQ3hFLFlBQU0sWUFBWSxvQkFBb0IsUUFBUTtBQUM5QyxXQUFLLE9BQU8sUUFBUTtBQUNwQixXQUFLLGVBQWU7QUFDcEIsV0FBSyxZQUFZLFNBQVMsU0FBUztBQUFBLElBQ3JDO0FBQ0EsU0FBSyxVQUFVO0FBQUEsRUFDakI7QUFBQSxFQUVRLHFCQUEyQjtBQUNqQyxTQUFLLGtCQUFrQixVQUFVLFlBQVksMEJBQTBCO0FBQUEsRUFDekU7QUFBQSxFQUVRLG1CQUF5QjtBQUMvQixRQUFJLENBQUMsS0FBSyxTQUFTLFlBQVk7QUFDN0IsV0FBSyxVQUFVLG1FQUFtRTtBQUNsRjtBQUFBLElBQ0Y7QUFDQSxRQUFJLGtCQUFrQixLQUFLLEtBQUssS0FBSyxTQUFTLEtBQUssU0FBUyxZQUFZLEtBQUssT0FBTyxtQkFBbUIsQ0FBQyxlQUFlO0FBQ3JILFdBQUssT0FBTyxvQkFBb0I7QUFDaEMsV0FBSyx5QkFBeUI7QUFDOUIsV0FBSyxVQUFVO0FBQUEsSUFDakIsQ0FBQyxFQUFFLEtBQUs7QUFBQSxFQUNWO0FBQUEsRUFFUSwyQkFBaUM7QUFDdkMsU0FBSyxlQUFlLFFBQVEsZ0JBQWdCLEtBQUssT0FBTyxpQkFBaUIsRUFBRTtBQUFBLEVBQzdFO0FBQUEsRUFFUSxVQUFVLFNBQXVCO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLLFFBQVM7QUFDbkIsU0FBSyxRQUFRLFFBQVEsT0FBTztBQUM1QixTQUFLLFFBQVEsS0FBSztBQUFBLEVBQ3BCO0FBQUEsRUFFUSxZQUFrQjtBQUN4QixTQUFLLFNBQVMsS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFFQSxNQUFjLFNBQXdCO0FBQ3BDLFFBQUksQ0FBQyxLQUFLLE9BQU8sVUFBVTtBQUN6QixXQUFLLFVBQVUsc0JBQXNCO0FBQ3JDO0FBQUEsSUFDRjtBQUNBLFFBQUksQ0FBQyxLQUFLLE9BQU8sT0FBTztBQUN0QixXQUFLLFVBQVUsbUJBQW1CO0FBQ2xDO0FBQUEsSUFDRjtBQUNBLFFBQUk7QUFDRixXQUFLLE9BQU8saUJBQWlCLHdCQUF3QixLQUFLLE9BQU8sZ0JBQWdCLEtBQUssT0FBTyxRQUFRO0FBQUEsSUFDdkcsU0FBUyxPQUFPO0FBQ2QsV0FBSyxVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUssQ0FBQztBQUNyRTtBQUFBLElBQ0Y7QUFDQSxTQUFLLHFCQUFxQixTQUFTLEtBQUssT0FBTyxjQUFjO0FBQzdELFNBQUssT0FBTyxlQUFlLHNCQUFzQixLQUFLLE9BQU8sY0FBYyxLQUFLLFNBQVMsYUFBYTtBQUN0RyxRQUFJLENBQUMsS0FBSyxTQUFTLFlBQVk7QUFDN0IsV0FBSyxVQUFVLG1FQUFtRTtBQUNsRjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFdBQVcsSUFBSSx3QkFBTyw4QkFBOEIsQ0FBQztBQUMzRCxVQUFNLE1BQU0sRUFBRTtBQUVkLFFBQUk7QUFDRixZQUFNLFNBQVMsTUFBTSxLQUFLLFFBQVEsYUFBYSxLQUFLLE1BQU07QUFDMUQsZUFBUyxLQUFLO0FBQ2QsVUFBSSx3QkFBTyxXQUFXLE9BQU8sSUFBSSxFQUFFO0FBQ25DLFdBQUssTUFBTTtBQUNYLFlBQU0sS0FBSyxRQUFRLGdCQUFnQixPQUFPLFFBQVE7QUFBQSxJQUNwRCxTQUFTLE9BQU87QUFDZCxlQUFTLEtBQUs7QUFDZCxZQUFNLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUNyRSxXQUFLLFVBQVUsT0FBTztBQUN0QixVQUFJLHdCQUFPLDhDQUE4QztBQUN6RCxjQUFRLE1BQU0seUJBQXlCLEtBQUs7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFDRjtBQUVBLFNBQVMseUJBQXlCLE1BQTJCO0FBQzNELFNBQU8sU0FBUyxVQUFVLFFBQVEsd0JBQXdCLFFBQ3RELE9BQVEsS0FBa0MsUUFBUSxLQUFLLHNCQUFzQixFQUFFLElBQy9FO0FBQ047QUFFQSxlQUFlLDJCQUFzRDtBQUNuRSxRQUFNLFNBQVMsa0JBQWtCO0FBQ2pDLE1BQUksQ0FBQyxVQUFVLE9BQU8sT0FBTyxtQkFBbUIsV0FBWSxRQUFPLENBQUM7QUFFcEUsUUFBTSxTQUFTLE1BQU0sT0FBTyxlQUFlO0FBQUEsSUFDekMsT0FBTztBQUFBLElBQ1AsWUFBWSxDQUFDLFVBQVU7QUFBQSxFQUN6QixDQUFDO0FBRUQsTUFBSSxDQUFDLFVBQVUsT0FBTyxTQUFVLFFBQU8sRUFBRSxVQUFVLEtBQUs7QUFDeEQsTUFBSSxDQUFDLE9BQU8sYUFBYSxDQUFDLE9BQU8sVUFBVSxPQUFRLFFBQU8sRUFBRSxNQUFNLEdBQUc7QUFDckUsU0FBTyxFQUFFLE1BQU0sT0FBTyxVQUFVLENBQUMsRUFBRTtBQUNyQztBQUVBLFNBQVMsb0JBQTZIO0FBQ3BJLE1BQUk7QUFDRixVQUFNLFdBQVcsUUFBUSxVQUFVO0FBSW5DLFdBQVEsU0FBUyxRQUFRLFVBQVUsU0FBUyxVQUFVO0FBQUEsRUFDeEQsUUFBUTtBQUNOLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSxTQUFTLE1BQU0sSUFBMkI7QUFDeEMsU0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFDekQ7OztBRzFTQSxJQUFBQyxtQkFBK0M7QUFJeEMsSUFBTSw2QkFBTixjQUF5QyxrQ0FBaUI7QUFBQSxFQUMvRCxZQUFZLEtBQTJCLFFBQWdDO0FBQ3JFLFVBQU0sS0FBSyxNQUFNO0FBRG9CO0FBQUEsRUFFdkM7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsVUFBTSxFQUFFLFlBQVksSUFBSTtBQUN4QixnQkFBWSxNQUFNO0FBQ2xCLGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFeEQsUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsYUFBYSxFQUNyQixRQUFRLDhEQUE4RCxFQUN0RSxRQUFRLENBQUMsU0FBUyxLQUNoQixlQUFlLHVCQUF1QixFQUN0QyxTQUFTLEtBQUssT0FBTyxTQUFTLFVBQVUsRUFDeEMsU0FBUyxPQUFPLFVBQVU7QUFDekIsV0FBSyxPQUFPLFNBQVMsYUFBYSxNQUFNLEtBQUssRUFBRSxRQUFRLFNBQVMsRUFBRTtBQUNsRSxZQUFNLEtBQUssS0FBSztBQUFBLElBQ2xCLENBQUMsQ0FBQztBQUVOLFFBQUkseUJBQVEsV0FBVyxFQUNwQixRQUFRLHVCQUF1QixFQUMvQixRQUFRLHFEQUFxRCxFQUM3RCxRQUFRLENBQUMsU0FBUyxLQUNoQixlQUFlLGdCQUFnQixFQUMvQixTQUFTLEtBQUssT0FBTyxTQUFTLG1CQUFtQixFQUNqRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixXQUFLLE9BQU8sU0FBUyxzQkFBc0IsTUFBTSxLQUFLO0FBQ3RELFlBQU0sS0FBSyxLQUFLO0FBQUEsSUFDbEIsQ0FBQyxDQUFDO0FBRU4sUUFBSSx5QkFBUSxXQUFXLEVBQ3BCLFFBQVEsY0FBYyxFQUN0QixRQUFRLGdFQUFnRSxFQUN4RSxRQUFRLENBQUMsU0FBUyxLQUNoQixlQUFlLHlCQUF5QixFQUN4QyxTQUFTLEtBQUssT0FBTyxTQUFTLFdBQVcsRUFDekMsU0FBUyxPQUFPLFVBQVU7QUFDekIsV0FBSyxPQUFPLFNBQVMsY0FBYyxNQUFNLEtBQUs7QUFDOUMsWUFBTSxLQUFLLEtBQUs7QUFBQSxJQUNsQixDQUFDLENBQUM7QUFFTixRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxnQkFBZ0IsRUFDeEIsUUFBUSx1RUFBdUUsRUFDL0UsWUFBWSxDQUFDLFNBQVMsS0FDcEIsZUFBZSwyQ0FBMkMsRUFDMUQsU0FBUyxLQUFLLE9BQU8sU0FBUyxjQUFjLEtBQUssSUFBSSxDQUFDLEVBQ3RELFNBQVMsT0FBTyxVQUFVO0FBQ3pCLFdBQUssT0FBTyxTQUFTLGdCQUFnQixVQUFVLEtBQUs7QUFDcEQsWUFBTSxLQUFLLEtBQUs7QUFBQSxJQUNsQixDQUFDLENBQUM7QUFFTixRQUFJLHlCQUFRLFdBQVcsRUFDcEIsUUFBUSxlQUFlLEVBQ3ZCLFFBQVEsNEVBQTRFLEVBQ3BGLFlBQVksQ0FBQyxTQUFTLEtBQ3BCLGVBQWUsaURBQWlELEVBQ2hFLFNBQVMsS0FBSyxPQUFPLFNBQVMsYUFBYSxLQUFLLElBQUksQ0FBQyxFQUNyRCxTQUFTLE9BQU8sVUFBVTtBQUN6QixXQUFLLE9BQU8sU0FBUyxlQUFlLFVBQVUsS0FBSztBQUNuRCxZQUFNLEtBQUssS0FBSztBQUFBLElBQ2xCLENBQUMsQ0FBQztBQUFBLEVBQ1I7QUFBQSxFQUVBLE1BQWMsT0FBc0I7QUFDbEMsU0FBSyxPQUFPLFdBQVcsa0JBQWtCLEtBQUssT0FBTyxRQUFRO0FBQzdELFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxFQUNqQztBQUNGO0FBRUEsU0FBUyxVQUFVLE9BQXlCO0FBQzFDLFNBQU8sTUFBTSxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUNuRTs7O0FmdkVBLElBQXFCLHlCQUFyQixjQUFvRCx3QkFBTztBQUFBLEVBQ3pELFdBQXFDO0FBQUEsRUFDN0IsVUFBMEM7QUFBQSxFQUVsRCxNQUFNLFNBQXdCO0FBQzVCLFVBQU0sS0FBSyxhQUFhO0FBQ3hCLFNBQUssVUFBVSxJQUFJLHdCQUF3QixLQUFLLEtBQUssS0FBSyxRQUFRO0FBQ2xFLFNBQUssY0FBYyxJQUFJLDJCQUEyQixLQUFLLEtBQUssSUFBSSxDQUFDO0FBRWpFLFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNO0FBQ2QsWUFBSSxDQUFDLEtBQUssUUFBUztBQUNuQixZQUFJLGtCQUFrQixLQUFLLEtBQUssS0FBSyxTQUFTLEtBQUssUUFBUSxFQUFFLEtBQUs7QUFBQSxNQUNwRTtBQUFBLElBQ0YsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNO0FBQUUsYUFBSyxLQUFLLHdCQUF3QjtBQUFBLE1BQUc7QUFBQSxJQUN6RCxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU07QUFBRSxhQUFLLEtBQUssaUNBQWlDO0FBQUEsTUFBRztBQUFBLElBQ2xFLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxNQUFNLGVBQThCO0FBQ2xDLFNBQUssV0FBVyxrQkFBa0IsRUFBRSxHQUFHLGtCQUFrQixHQUFHLE1BQU0sS0FBSyxTQUFTLEVBQXVDLENBQUM7QUFBQSxFQUMxSDtBQUFBLEVBRUEsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUFBLEVBRUEsTUFBYywwQkFBeUM7QUFDckQsUUFBSSxDQUFDLEtBQUssUUFBUztBQUNuQixVQUFNLFdBQVcscUJBQXFCLEtBQUssR0FBRztBQUM5QyxRQUFJLENBQUMsVUFBVTtBQUNiLFVBQUksd0JBQU8sbUNBQW1DO0FBQzlDO0FBQUEsSUFDRjtBQUVBLFVBQU0sV0FBVyxJQUFJLHdCQUFPLDRCQUE0QixDQUFDO0FBQ3pELFVBQU1DLE9BQU0sRUFBRTtBQUNkLFFBQUk7QUFDRixZQUFNLFNBQVMsTUFBTSxLQUFLLFFBQVEsaUJBQWlCLFFBQVE7QUFDM0QsZUFBUyxLQUFLO0FBQ2QsVUFBSSx3QkFBTyxPQUFPLFdBQVcsaUNBQWlDLHNDQUFzQztBQUFBLElBQ3RHLFNBQVMsT0FBTztBQUNkLGVBQVMsS0FBSztBQUNkLFVBQUksd0JBQU8sbURBQW1EO0FBQzlELGNBQVEsTUFBTSw4QkFBOEIsS0FBSztBQUFBLElBQ25EO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxtQ0FBa0Q7QUFDOUQsUUFBSSxDQUFDLEtBQUssUUFBUztBQUNuQixVQUFNLFdBQVcsSUFBSSx3QkFBTyxxQ0FBcUMsQ0FBQztBQUNsRSxVQUFNQSxPQUFNLEVBQUU7QUFDZCxRQUFJO0FBQ0YsWUFBTSxTQUFTLE1BQU0sS0FBSyxRQUFRLDBCQUEwQjtBQUM1RCxlQUFTLEtBQUs7QUFDZCxVQUFJLHdCQUFPLHNDQUFzQyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sYUFBYSxPQUFPLE9BQU8saUJBQWlCLE9BQU8sU0FBUyxLQUFLLE9BQU8sTUFBTSxvQkFBb0IsRUFBRSxHQUFHO0FBQUEsSUFDL0wsU0FBUyxPQUFPO0FBQ2QsZUFBUyxLQUFLO0FBQ2QsVUFBSSx3QkFBTyw2REFBNkQ7QUFDeEUsY0FBUSxNQUFNLHdDQUF3QyxLQUFLO0FBQUEsSUFDN0Q7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTQSxPQUFNLElBQTJCO0FBQ3hDLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ3pEOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X25vZGVfcGF0aCIsICJwYXRoIiwgInBhdGgiLCAiaW1wb3J0X25vZGVfZnMiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJpbXBvcnRfbm9kZV9jaGlsZF9wcm9jZXNzIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJwYXRoIiwgInBhdGgiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJleGVjRmlsZUNhbGxiYWNrIiwgInBhdGgiLCAiZnMiLCAib3MiLCAiaW1wb3J0X25vZGVfZnMiLCAiaW1wb3J0X25vZGVfcGF0aCIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiZnMiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9ub2RlX3BhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInBhdGgiLCAiaW1wb3J0X29ic2lkaWFuIiwgInNsZWVwIl0KfQo=
