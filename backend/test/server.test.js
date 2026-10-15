import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { createServer as KripTop_createServer } from 'node:net';
import { spawn as KripTop_spawn, spawnSync as KripTop_spawnSync } from 'node:child_process';
import { once as KripTop_once } from 'node:events';
import { fileURLToPath as KripTop_fileURLToPath } from 'node:url';

const KripTop_serverPath = KripTop_fileURLToPath(new URL('../src/server.js', import.meta.url));
const KripTop_verifyPath = KripTop_fileURLToPath(new URL('../../deploy/verify-api.mjs', import.meta.url));
const KripTop_dbCheckPath = KripTop_fileURLToPath(new URL('../scripts/check-db.mjs', import.meta.url));

KripTop_test('read-only database diagnostic hides credential values on configuration failure', () => {
  const KripTop_result = KripTop_spawnSync(process.execPath, [KripTop_dbCheckPath], { env: { ...process.env, DB_HOST: '', DB_PASSWORD: 'DO_NOT_PRINT_THIS_TEST_VALUE' }, encoding: 'utf8', timeout: 5000 });
  KripTop_assert.equal(KripTop_result.status, 1);
  KripTop_assert.match(KripTop_result.stderr, /CONFIGURATION_OR_CONNECTION_ERROR/);
  KripTop_assert.ok(!KripTop_result.stderr.includes('DO_NOT_PRINT_THIS_TEST_VALUE'));
  KripTop_assert.ok(!KripTop_result.stdout.includes('PASS'));
});

KripTop_test('server rejects invalid configured ports', () => {
  for (const KripTop_port of ['0', '-1', '65536', 'not-a-port', '3000.5']) {
    const KripTop_result = KripTop_spawnSync(process.execPath, [KripTop_serverPath], { env: { ...process.env, PORT: KripTop_port }, encoding: 'utf8', timeout: 5000 });
    KripTop_assert.equal(KripTop_result.status, 1);
    KripTop_assert.match(KripTop_result.stderr, /PORT must be an integer between 1 and 65535/);
  }
});

KripTop_test('default MySQL startup fails safely without credentials and never falls back to memory', () => {
  const KripTop_result = KripTop_spawnSync(process.execPath, [KripTop_serverPath], { env: { ...process.env, PORT: '30123', EMPLOYEE_STORAGE: '', DB_HOST: '', DB_PASSWORD: 'DO_NOT_PRINT_THIS_TEST_VALUE' }, encoding: 'utf8', timeout: 5000 });
  KripTop_assert.equal(KripTop_result.status, 1);
  KripTop_assert.match(KripTop_result.stderr, /No memory fallback was used/);
  KripTop_assert.ok(!KripTop_result.stderr.includes('DO_NOT_PRINT_THIS_TEST_VALUE'));
  KripTop_assert.ok(!KripTop_result.stdout.includes('listening'));
});

KripTop_test('configured server starts and deployment verification passes with disposable CRUD', { timeout: 20000 }, async () => {
  const KripTop_probe = KripTop_createServer();
  KripTop_probe.listen(0, '127.0.0.1');
  await KripTop_once(KripTop_probe, 'listening');
  const KripTop_port = KripTop_probe.address().port;
  await new Promise(KripTop_resolve => KripTop_probe.close(KripTop_resolve));
  const KripTop_child = KripTop_spawn(process.execPath, [KripTop_serverPath], { env: { ...process.env, PORT: String(KripTop_port), HOST: '127.0.0.1', EMPLOYEE_STORAGE: 'memory' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const KripTop_exit = KripTop_once(KripTop_child, 'exit');
  let KripTop_stderr = '';
  KripTop_child.stderr.on('data', KripTop_chunk => { KripTop_stderr += KripTop_chunk; });
  try {
    await new Promise((KripTop_resolve, KripTop_reject) => {
      const KripTop_timer = setTimeout(() => KripTop_reject(new Error('Configured server startup timed out.')), 5000);
      KripTop_child.once('error', KripTop_error => { clearTimeout(KripTop_timer); KripTop_reject(KripTop_error); });
      KripTop_child.once('exit', () => { clearTimeout(KripTop_timer); KripTop_reject(new Error(`Configured server exited: ${KripTop_stderr}`)); });
      KripTop_child.stdout.once('data', KripTop_chunk => {
        clearTimeout(KripTop_timer);
        KripTop_assert.match(String(KripTop_chunk), new RegExp(`127.0.0.1:${KripTop_port}`));
        KripTop_resolve();
      });
    });
    const KripTop_verifier = KripTop_spawn(process.execPath, [KripTop_verifyPath, '--crud'], { env: { ...process.env, KRIPTOP_API_BASE_URL: `http://127.0.0.1:${KripTop_port}` }, stdio: ['ignore', 'pipe', 'pipe'] });
    let KripTop_output = '';
    KripTop_verifier.stdout.on('data', KripTop_chunk => { KripTop_output += KripTop_chunk; });
    KripTop_verifier.stderr.on('data', KripTop_chunk => { KripTop_output += KripTop_chunk; });
    const [KripTop_code] = await KripTop_once(KripTop_verifier, 'exit');
    KripTop_assert.equal(KripTop_code, 0, KripTop_output);
    KripTop_assert.match(KripTop_output, /deleted only the temporary verification employee/);
    const KripTop_response = await fetch(`http://127.0.0.1:${KripTop_port}/api/employees`, { headers: { Authorization: 'Bearer mock-jwt-token' } });
    KripTop_assert.equal((await KripTop_response.json()).length, 5, 'deployment smoke test leaves initial employees intact');
  } finally {
    KripTop_child.kill();
    await KripTop_exit;
  }
});
