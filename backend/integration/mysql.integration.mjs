// Explicitly opt in for temporary API test records; never creates or seeds tables.
import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { spawn as KripTop_spawn } from 'node:child_process';
import { once as KripTop_once } from 'node:events';
import { fileURLToPath as KripTop_fileURLToPath } from 'node:url';
import { KripTop_createMysqlStore } from '../src/mysql-store.js';
import { KripTop_createApp } from '../src/app.js';

KripTop_test('approved live MySQL API: auth, CRUD, validation and current salary tiers', { skip: process.env.KRIPTOP_ALLOW_DB_TEST_WRITES !== '1', timeout: 45000 }, async () => {
  const KripTop_store = KripTop_createMysqlStore();
  let KripTop_server;
  try {
    await KripTop_store.KripTop_check();
    const KripTop_before = await KripTop_store.KripTop_list();
    KripTop_server = KripTop_createApp(KripTop_store).listen(0, '127.0.0.1');
    await KripTop_once(KripTop_server, 'listening');
    const KripTop_script = KripTop_fileURLToPath(new URL('../../deploy/verify-api.mjs', import.meta.url));
    const KripTop_child = KripTop_spawn(process.execPath, [KripTop_script, '--crud'], { env: { ...process.env, KRIPTOP_API_BASE_URL: `http://127.0.0.1:${KripTop_server.address().port}` }, stdio: ['ignore', 'pipe', 'pipe'] });
    let KripTop_output = '';
    KripTop_child.stdout.on('data', KripTop_chunk => { KripTop_output += KripTop_chunk; });
    KripTop_child.stderr.on('data', KripTop_chunk => { KripTop_output += KripTop_chunk; });
    const [KripTop_code] = await KripTop_once(KripTop_child, 'exit');
    KripTop_assert.equal(KripTop_code, 0, KripTop_output);
    const KripTop_after = await KripTop_store.KripTop_list();
    KripTop_assert.ok(JSON.stringify(KripTop_after) === JSON.stringify(KripTop_before), 'Existing employee records must remain unchanged after verification.');
    console.log(KripTop_output);
    console.log('PASS existing employee records unchanged. No schema or seed SQL executed.');
  } catch (KripTop_error) {
    const KripTop_codes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_HOST_NOT_PRIVILEGED', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'];
    const KripTop_code = KripTop_codes.includes(KripTop_error.code) ? KripTop_error.code : 'CONFIGURATION_OR_API_VERIFICATION_ERROR';
    throw new Error(`Live MySQL verification failed (${KripTop_code}). Check private configuration and connectivity. Driver details are hidden.`);
  } finally {
    if (KripTop_server) await new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve));
    await KripTop_store.KripTop_close();
  }
});
