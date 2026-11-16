const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTaskInput, formatTaskMarkdown } = require('../src/domain/task');
const { getIsoWeek, getTaskRelativePath } = require('../src/domain/partition');

test('parseTaskInput extracts priority, tags, and status', () => {
  const result = parseTaskInput('!high #work @in Fix auth bug');
  assert.equal(result.title, 'Fix auth bug');
  assert.equal(result.priority, 'high');
  assert.deepEqual(result.tags, ['work']);
  assert.equal(result.status, 'In Progress');
  assert.equal(result.explicitStatus, 'In Progress');
});

test('getIsoWeek formats week as YYYY-Www', () => {
  const week = getIsoWeek(new Date('2026-11-16T12:00:00Z'));
  assert.equal(week, '2026-W47');
});

test('getTaskRelativePath builds weekly partitioned path with spaces', () => {
  const relPath = getTaskRelativePath('Fix auth bug', {
    tasksFolder: 'Tasks',
    partitionByWeek: true,
    date: new Date('2026-11-16T12:00:00Z'),
  });
  assert.match(relPath, /Tasks[\\/]+2026-W47[\\/]+Fix auth bug\.md$/);
});

test('formatTaskMarkdown renders YAML frontmatter', () => {
  const md = formatTaskMarkdown(
    { title: 'Fix auth bug', status: 'Todo', priority: 'high', tags: ['work'] },
    { week: '2026-W47', createdAt: new Date('2026-11-16T12:00:00Z') }
  );
  assert.ok(md.includes('status: "Todo"'));
  assert.ok(md.includes('week: 2026-W47'));
  assert.ok(md.includes('priority: high'));
  assert.ok(md.includes('tags: ["work"]'));
  assert.ok(md.includes('# Fix auth bug'));
});
