const { formatTaskMarkdown } = require('../domain/task');
const { getIsoWeek, getTaskRelativePath } = require('../domain/partition');

/**
 * Creates a Kanban task file in the Obsidian Vault.
 */
async function createTask(payload, config, vaultRepo) {
  if (!config.vaultPath) {
    throw new Error('Obsidian Vault Path is not configured.');
  }

  const now = new Date();
  const week = config.partitionByWeek ? getIsoWeek(now) : null;
  const relativePath = getTaskRelativePath(payload.title, {
    tasksFolder: config.tasksFolder,
    partitionByWeek: config.partitionByWeek,
    date: now,
  });

  const markdown = formatTaskMarkdown(payload, { week, createdAt: now });
  await vaultRepo.ensureBaseFile(config.vaultPath, config.tasksFolder);
  return vaultRepo.saveTaskFile(config.vaultPath, relativePath, markdown);
}

module.exports = {
  createTask,
};
