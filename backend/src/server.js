import { KripTop_createApp } from './app.js';
import { KripTop_createMysqlStore } from './mysql-store.js';
import { KripTop_createMemoryStore } from './memory-store.js';
const KripTop_port = Number(process.env.PORT || 3117);
const KripTop_host = process.env.HOST || '0.0.0.0';
if (!Number.isInteger(KripTop_port) || KripTop_port < 1 || KripTop_port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}
const KripTop_mode = process.env.EMPLOYEE_STORAGE || 'mysql';
let KripTop_store;
try {
  if (!['mysql', 'memory'].includes(KripTop_mode)) throw new Error('EMPLOYEE_STORAGE must be mysql or memory.');
  KripTop_store = KripTop_mode === 'memory' ? KripTop_createMemoryStore() : KripTop_createMysqlStore();
  await KripTop_store.KripTop_check();
  const KripTop_server = KripTop_createApp(KripTop_store).listen(KripTop_port, KripTop_host, () => console.log(`KripTop HR API listening on ${KripTop_host}:${KripTop_port} (${KripTop_mode})`));
  KripTop_server.on('error', async KripTop_error => {
    console.error(`KripTop HR API could not start (${KripTop_error.code || 'UNKNOWN'}). Check the assigned port and host; do not stop another service.`);
    await KripTop_store.KripTop_close();
    process.exitCode = 1;
  });
  const KripTop_shutdown = () => KripTop_server.close(async () => { await KripTop_store.KripTop_close(); });
  process.once('SIGTERM', KripTop_shutdown);
  process.once('SIGINT', KripTop_shutdown);
} catch (KripTop_error) {
  // Never log raw driver errors, which may contain account details or SQL.
  const KripTop_codes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_HOST_NOT_PRIVILEGED', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'];
  const KripTop_code = KripTop_codes.includes(KripTop_error.code) ? KripTop_error.code : 'CONFIGURATION_OR_CONNECTION_ERROR';
  const KripTop_missing = KripTop_mode === 'mysql' ? ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter(KripTop_key => !process.env[KripTop_key]) : [];
  console.error(`KripTop HR API startup failed (${KripTop_code}). Check EMPLOYEE_STORAGE, required DB_* variables, connectivity and the approved employee table. No memory fallback was used.`);
  if (KripTop_missing.length) console.error(`Missing variable names: ${KripTop_missing.join(', ')}`);
  if (KripTop_store) await KripTop_store.KripTop_close();
  process.exitCode = 1;
}
