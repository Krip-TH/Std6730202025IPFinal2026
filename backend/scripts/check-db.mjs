import { KripTop_createDatabasePool, KripTop_createMysqlStore } from '../src/mysql-store.js';

let KripTop_pool;
try {
  KripTop_pool = KripTop_createDatabasePool();
  const KripTop_store = KripTop_createMysqlStore(KripTop_pool);
  await KripTop_store.KripTop_check();
  const [[KripTop_result]] = await KripTop_pool.execute('SELECT COUNT(*) AS `KripTop_count` FROM `std6730202025IPFinal2026`');
  console.log(`PASS MySQL connection and required employee columns. Employee count: ${KripTop_result.KripTop_count}. No records changed.`);
} catch (KripTop_error) {
  const KripTop_codes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_HOST_NOT_PRIVILEGED', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'];
  const KripTop_code = KripTop_codes.includes(KripTop_error.code) ? KripTop_error.code : 'CONFIGURATION_OR_CONNECTION_ERROR';
  console.error(`FAIL database check (${KripTop_code}). Check private DB_* settings, database permissions, table columns and network access. Driver details are hidden.`);
  process.exitCode = 1;
} finally {
  if (KripTop_pool) await KripTop_pool.end();
}
