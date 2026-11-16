const fs = require('fs');
const path = require('path');
const { parseRequest, sendResults } = require('./infrastructure/flowLauncher');
const { loadConfig } = require('./infrastructure/config');
const vaultRepo = require('./infrastructure/vaultRepo');
const { suggestTasks } = require('./application/suggestTasks');
const { createTask } = require('./application/createTask');

const LOG_PATH = path.join(__dirname, '..', 'plugin.log');

function logError(label, err) {
  const line = `[${new Date().toISOString()}] ${label}: ${err?.stack || err}\n`;
  try {
    fs.appendFileSync(LOG_PATH, line, 'utf8');
  } catch {
    // ignore logging errors
  }
}

async function main() {
  try {
    const request = parseRequest(process.argv);
    const config = loadConfig(request.settings);

    if (request.method === 'query') {
      const query = Array.isArray(request.parameters) ? request.parameters[0] || '' : '';
      const results = suggestTasks(query, config);
      sendResults(results);
      return;
    }

    if (request.method === 'create_task') {
      const rawParam = Array.isArray(request.parameters) ? request.parameters[0] : '';
      const jsonStr = rawParam.startsWith('{')
        ? rawParam
        : Buffer.from(rawParam, 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr);
      const effectiveConfig = payload.config ? { ...config, ...payload.config } : config;
      await createTask(payload, effectiveConfig, vaultRepo);
      return;
    }

    sendResults([]);
  } catch (err) {
    logError('main', err);
    sendResults([
      {
        Title: 'Obsidian Kanban Error',
        SubTitle: err.message,
        IcoPath: 'assets\\logo.png',
      },
    ]);
  }
}

main();
