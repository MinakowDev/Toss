const PRIORITY_ALIASES = {
  '!1': 'high',
  '!high': 'high',
  '!2': 'medium',
  '!med': 'medium',
  '!medium': 'medium',
  '!3': 'low',
  '!low': 'low',
};

/**
 * Parses raw user query into structured task metadata.
 * Supports:
 * - `!high` / `!1`, `!med` / `!2`, `!low` / `!3` for priority
 * - `#tag` for tags
 * - `@status` for target Kanban column (case-insensitive prefix match)
 */
function parseTaskInput(rawQuery, { defaultStatus = 'Todo', statuses = ['Backlog', 'Todo', 'In Progress', 'Done'] } = {}) {
  const tokens = String(rawQuery || '').trim().split(/\s+/).filter(Boolean);
  const tags = [];
  const titleParts = [];
  let priority = null;
  let explicitStatus = null;

  for (const token of tokens) {
    const lower = token.toLowerCase();

    if (PRIORITY_ALIASES[lower]) {
      priority = PRIORITY_ALIASES[lower];
      continue;
    }

    if (token.startsWith('#') && token.length > 1) {
      tags.push(token.slice(1));
      continue;
    }

    if (token.startsWith('@') && token.length > 1) {
      const target = token.slice(1).toLowerCase();
      const matched = statuses.find((s) => s.toLowerCase().startsWith(target));
      if (matched) {
        explicitStatus = matched;
        continue;
      }
    }

    titleParts.push(token);
  }

  return {
    title: titleParts.join(' ').trim(),
    status: explicitStatus || defaultStatus,
    explicitStatus,
    priority,
    tags,
  };
}

/**
 * Formats a task object into Markdown with YAML frontmatter for Obsidian Bases.
 */
function formatTaskMarkdown(task, { week, createdAt = new Date() } = {}) {
  const isoDate = createdAt.toISOString().slice(0, 10);
  const lines = [
    '---',
    `status: "${task.status}"`,
    `created: ${isoDate}`,
  ];

  if (week) {
    lines.push(`week: ${week}`);
  }
  if (task.priority) {
    lines.push(`priority: ${task.priority}`);
  }
  if (task.tags && task.tags.length > 0) {
    lines.push(`tags: [${task.tags.map((t) => `"${t}"`).join(', ')}]`);
  }

  lines.push('---', '', `# ${task.title}`, '');
  return lines.join('\n');
}

module.exports = {
  parseTaskInput,
  formatTaskMarkdown,
};
