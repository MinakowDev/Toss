const { parseTaskInput } = require('../domain/task');
const { getIsoWeek, getTaskRelativePath } = require('../domain/partition');

const ICON_PATH = 'assets\\logo.png';

/**
 * Generates Flow Launcher result items for a user query.
 */
function suggestTasks(rawQuery, config) {
  if (!config.vaultPath) {
    return [
      {
        Title: 'Obsidian Vault Path is not configured',
        SubTitle: 'Open Flow Launcher Settings -> Plugins -> Obsidian Kanban to set your Vault path',
        IcoPath: ICON_PATH,
      },
    ];
  }

  const parsed = parseTaskInput(rawQuery, {
    defaultStatus: config.defaultStatus,
    statuses: config.statuses,
  });

  if (!parsed.title) {
    return [
      {
        Title: 'Type a task title...',
        SubTitle: 'Supports !high/!med/!low, #tag, @status (e.g. "kb !high #work Fix login")',
        IcoPath: ICON_PATH,
      },
    ];
  }

  const targetStatuses = parsed.explicitStatus
    ? [parsed.explicitStatus]
    : config.statuses;

  const now = new Date();
  const week = config.partitionByWeek ? getIsoWeek(now) : null;
  const relPath = getTaskRelativePath(parsed.title, {
    tasksFolder: config.tasksFolder,
    partitionByWeek: config.partitionByWeek,
    date: now,
  });

  const metaParts = [];
  if (parsed.priority) metaParts.push(`priority: ${parsed.priority}`);
  if (parsed.tags.length > 0) metaParts.push(`tags: ${parsed.tags.map((t) => `#${t}`).join(' ')}`);
  if (week) metaParts.push(`week: ${week}`);
  const metaSuffix = metaParts.length > 0 ? ` | ${metaParts.join(' · ')}` : '';

  return targetStatuses.map((status) => {
    const payload = {
      title: parsed.title,
      status,
      priority: parsed.priority,
      tags: parsed.tags,
      config: {
        vaultPath: config.vaultPath,
        tasksFolder: config.tasksFolder,
        partitionByWeek: config.partitionByWeek,
      },
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');

    return {
      Title: `[${status}] ${parsed.title}`,
      SubTitle: `Save to ${relPath}${metaSuffix}`,
      IcoPath: ICON_PATH,
      JsonRPCAction: {
        method: 'create_task',
        parameters: [encodedPayload],
      },
    };
  });
}

module.exports = {
  suggestTasks,
};
