/**
 * Normalizes Flow Launcher plugin settings into a typed config object.
 */
function loadConfig(settings) {
  const safeSettings = settings || {};
  const rawStatuses = typeof safeSettings.statuses === 'string' && safeSettings.statuses.trim()
    ? safeSettings.statuses
    : 'Backlog, Todo, In Progress, Done';

  const statuses = rawStatuses
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    vaultPath: (safeSettings.vaultPath || '').trim(),
    tasksFolder: (safeSettings.tasksFolder || 'Tasks').trim(),
    statuses: statuses.length > 0 ? statuses : ['Todo'],
    defaultStatus: (safeSettings.defaultStatus || 'Todo').trim(),
    partitionByWeek: safeSettings.partitionByWeek !== false,
  };
}

module.exports = {
  loadConfig,
};
