const path = require('path');

/**
 * Returns ISO-8601 week string (e.g. "2026-W47") for a given Date.
 */
function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Sanitizes a task title into a filesystem-safe filename while preserving spaces and casing.
 */
function sanitizeFileName(title) {
  const cleaned = String(title || 'Task')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return cleaned || 'Task';
}

/**
 * Computes the relative path inside the Obsidian Vault for a task.
 */
function getTaskRelativePath(title, { tasksFolder = 'Tasks', partitionByWeek = true, date = new Date() } = {}) {
  const fileName = `${sanitizeFileName(title)}.md`;

  if (partitionByWeek) {
    const week = getIsoWeek(date);
    return path.join(tasksFolder, week, fileName);
  }

  return path.join(tasksFolder, fileName);
}

module.exports = {
  getIsoWeek,
  sanitizeFileName,
  getTaskRelativePath,
};
