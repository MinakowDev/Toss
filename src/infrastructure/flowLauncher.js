/**
 * Parses the JSON-RPC request passed by Flow Launcher via argv[2].
 */
function parseRequest(argv = process.argv) {
  const raw = argv[2];
  if (!raw) {
    return { method: 'query', parameters: [''], settings: {} };
  }
  return JSON.parse(raw);
}

/**
 * Writes a Flow Launcher result response to stdout.
 */
function sendResults(results) {
  process.stdout.write(JSON.stringify({ result: results }));
}

module.exports = {
  parseRequest,
  sendResults,
};
