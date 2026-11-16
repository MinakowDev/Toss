const fs = require('fs/promises');
const path = require('path');

/**
 * Saves a task markdown file inside the Obsidian Vault,
 * creating parent directories and avoiding overwrites.
 */
async function saveTaskFile(vaultPath, relativePath, content) {
  const fullPath = path.join(vaultPath, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  let targetPath = fullPath;
  let counter = 1;

  while (true) {
    try {
      await fs.access(targetPath);
      const ext = path.extname(fullPath);
      const base = fullPath.slice(0, -ext.length);
      targetPath = `${base}-${counter}${ext}`;
      counter += 1;
    } catch {
      break;
    }
  }

  await fs.writeFile(targetPath, content, 'utf8');
  return targetPath;
}

/**
 * Creates a Kanban.base file in tasksFolder if it does not exist yet.
 */
async function ensureBaseFile(vaultPath, tasksFolder) {
  const basePath = path.join(vaultPath, tasksFolder, 'Kanban.base');
  try {
    await fs.access(basePath);
    return;
  } catch {
    // File does not exist, create it
  }

  await fs.mkdir(path.dirname(basePath), { recursive: true });
  const content = [
    'filters:',
    '  and:',
    `    - file.inFolder("${tasksFolder.replace(/\\/g, '/')}")`,
    '    - file.ext == "md"',
    'views:',
    '  - type: kanban',
    '    name: Kanban',
    '    groupBy:',
    '      property: status',
    '      direction: ASC',
    '    order:',
    '      - file.name',
    '      - priority',
    '      - week',
    '      - tags',
    '',
  ].join('\n');

  await fs.writeFile(basePath, content, 'utf8');
}

module.exports = {
  saveTaskFile,
  ensureBaseFile,
};
