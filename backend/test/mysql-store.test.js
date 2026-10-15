import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { KripTop_createMysqlStore, KripTop_createDatabasePool, KripTop_TABLE } from '../src/mysql-store.js';
import { KripTop_createApp } from '../src/app.js';

KripTop_test('MySQL config requires env credentials and exact database, never a second table', async () => {
  KripTop_assert.equal(KripTop_TABLE, 'std6730202025IPFinal2026');
  KripTop_assert.throws(() => KripTop_createDatabasePool({}), /DB_HOST/);
  const KripTop_env = { DB_HOST: '127.0.0.1', DB_NAME: 'ip_std6730202025', DB_USER: 'test', DB_PASSWORD: 'local-test-only' };
  KripTop_assert.throws(() => KripTop_createDatabasePool({ ...KripTop_env, DB_NAME: 'other' }), /DB_NAME/);
  KripTop_assert.throws(() => KripTop_createDatabasePool({ ...KripTop_env, DB_PORT: '0' }), /DB_PORT/);
  const KripTop_pool = KripTop_createDatabasePool(KripTop_env);
  await KripTop_pool.end(); // createPool is lazy; this test opens no network connection.
});

KripTop_test('MySQL list and analytics convert DECIMAL strings to JSON numbers and read each time', async () => {
  let KripTop_salary = '45000.25';
  const KripTop_calls = [];
  const KripTop_store = KripTop_createMysqlStore({ async execute(KripTop_sql) {
    KripTop_calls.push(KripTop_sql);
    return [[{ id: '1', name: 'John', position: 'Dev', status: 'Active', salary: KripTop_salary }]];
  } });
  KripTop_assert.equal((await KripTop_store.KripTop_list())[0].salary, 45000.25);
  KripTop_assert.deepEqual(await KripTop_store.KripTop_salaries(), [45000.25]);
  KripTop_salary = '78000.50';
  KripTop_assert.deepEqual(await KripTop_store.KripTop_salaries(), [78000.5]);
  KripTop_assert.ok(KripTop_calls.every(KripTop_sql => KripTop_sql.includes('`std6730202025IPFinal2026`')));
  KripTop_assert.match(KripTop_calls[1], /^SELECT `salary` FROM/);
});

KripTop_test('MySQL writes bind employee values and IDs instead of interpolating SQL', async () => {
  const KripTop_calls = [];
  const KripTop_store = KripTop_createMysqlStore({ async execute(KripTop_sql, KripTop_params) { KripTop_calls.push([KripTop_sql, KripTop_params]); return [{ affectedRows: 1 }]; } });
  const KripTop_employee = { id: 'test-id', name: "O'Neil'; DROP TABLE example; --", position: 'QA', status: 'Active', salary: 120.29 };
  KripTop_assert.deepEqual(await KripTop_store.KripTop_add(KripTop_employee), KripTop_employee);
  KripTop_assert.equal(await KripTop_store.KripTop_delete("' OR 1=1 --"), true);
  KripTop_assert.ok(!KripTop_calls[0][0].includes(KripTop_employee.name));
  KripTop_assert.deepEqual(KripTop_calls[0][1], Object.values(KripTop_employee));
  KripTop_assert.match(KripTop_calls[0][0], /VALUES \(\?, \?, \?, \?, \?\)/);
  KripTop_assert.deepEqual(KripTop_calls[1][1], ["' OR 1=1 --"]);
  KripTop_assert.match(KripTop_calls[1][0], /WHERE `id` = \?$/);
});

for (const KripTop_case of ['success', 'missing', 'failure']) {
  KripTop_test(`MySQL toggle transaction ${KripTop_case}: locks rows, commits or rolls back, releases`, async () => {
    const KripTop_events = [];
    const KripTop_connection = {
      async beginTransaction() { KripTop_events.push('begin'); },
      async execute(KripTop_sql, KripTop_params) {
        KripTop_events.push([KripTop_sql, KripTop_params]);
        if (KripTop_sql.startsWith('SELECT')) return [KripTop_case === 'missing' ? [] : [{ id: '1', name: 'A', position: 'Dev', status: 'Active', salary: '100.50' }]];
        if (KripTop_case === 'failure') throw new Error('simulated database failure');
        return [{ affectedRows: 1 }];
      },
      async commit() { KripTop_events.push('commit'); },
      async rollback() { KripTop_events.push('rollback'); },
      release() { KripTop_events.push('release'); },
    };
    const KripTop_store = KripTop_createMysqlStore({ async getConnection() { return KripTop_connection; } });
    if (KripTop_case === 'failure') await KripTop_assert.rejects(KripTop_store.KripTop_toggle('1'), /simulated/);
    else {
      const KripTop_result = await KripTop_store.KripTop_toggle('1');
      if (KripTop_case === 'missing') KripTop_assert.equal(KripTop_result, null);
      else { KripTop_assert.equal(KripTop_result.status, 'On Leave'); KripTop_assert.equal(KripTop_result.salary, 100.5); }
    }
    KripTop_assert.equal(KripTop_events[0], 'begin');
    KripTop_assert.match(KripTop_events[1][0], /WHERE `id` = \? FOR UPDATE$/);
    KripTop_assert.equal(KripTop_events.at(-2), KripTop_case === 'failure' ? 'rollback' : 'commit');
    KripTop_assert.equal(KripTop_events.at(-1), 'release');
    if (KripTop_case === 'success') KripTop_assert.deepEqual(KripTop_events[2][1], ['On Leave', '1']);
  });
}

KripTop_test('HTTP routes use the MySQL adapter, read live clusters and hide database errors', async KripTop_context => {
  let KripTop_fail = false;
  let KripTop_values = ['100.00', '200.00', '900.00'];
  const KripTop_pool = { async execute(KripTop_sql) {
    if (KripTop_fail) throw new Error('simulated SQL error with confidential connection details');
    KripTop_assert.match(KripTop_sql, /`std6730202025IPFinal2026`/);
    return [KripTop_values.map((KripTop_salary, KripTop_index) => ({ id: String(KripTop_index), name: 'A', position: 'Dev', status: 'Active', salary: KripTop_salary }))];
  } };
  const KripTop_server = KripTop_createApp(KripTop_createMysqlStore(KripTop_pool)).listen(0, '127.0.0.1');
  await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
  KripTop_context.after(() => new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve)));
  const KripTop_url = `http://127.0.0.1:${KripTop_server.address().port}`;
  const KripTop_headers = { Authorization: 'Bearer mock-jwt-token' };
  const KripTop_list = await (await fetch(`${KripTop_url}/api/employees`, { headers: KripTop_headers })).json();
  KripTop_assert.equal(typeof KripTop_list[0].salary, 'number');
  for (const KripTop_expected of [3, 1, 0]) {
    KripTop_values = KripTop_values.slice(0, KripTop_expected);
    const KripTop_response = await fetch(`${KripTop_url}/api/employees/salary-clusters`, { headers: KripTop_headers });
    KripTop_assert.equal(KripTop_response.status, 200);
    const KripTop_data = await KripTop_response.json();
    KripTop_assert.equal(KripTop_data.clusters.length, 3);
    KripTop_assert.equal(KripTop_data.clusters.reduce((KripTop_sum, KripTop_item) => KripTop_sum + KripTop_item.count, 0), KripTop_expected);
  }
  KripTop_fail = true;
  const KripTop_errorResponse = await fetch(`${KripTop_url}/api/employees`, { headers: KripTop_headers });
  KripTop_assert.equal(KripTop_errorResponse.status, 500);
  KripTop_assert.deepEqual(await KripTop_errorResponse.json(), { success: false, error: 'Internal server error.' });
});

KripTop_test('HTTP MySQL adapter CRUD preserves response formats, parameter binding and 404s', async KripTop_context => {
  const KripTop_records = new Map();
  const KripTop_calls = [];
  async function KripTop_execute(KripTop_sql, KripTop_params = []) {
    KripTop_calls.push([KripTop_sql, KripTop_params]);
    KripTop_assert.match(KripTop_sql, /`std6730202025IPFinal2026`/);
    if (KripTop_sql.startsWith('INSERT')) {
      const [KripTop_id, KripTop_name, KripTop_position, KripTop_status, KripTop_salary] = KripTop_params;
      KripTop_records.set(KripTop_id, { id: KripTop_id, name: KripTop_name, position: KripTop_position, status: KripTop_status, salary: String(KripTop_salary) });
      return [{ affectedRows: 1 }];
    }
    if (KripTop_sql.startsWith('UPDATE')) { KripTop_records.get(KripTop_params[1]).status = KripTop_params[0]; return [{ affectedRows: 1 }]; }
    if (KripTop_sql.startsWith('DELETE')) return [{ affectedRows: KripTop_records.delete(KripTop_params[0]) ? 1 : 0 }];
    if (KripTop_sql.includes('WHERE')) return [KripTop_records.has(KripTop_params[0]) ? [{ ...KripTop_records.get(KripTop_params[0]) }] : []];
    return [[...KripTop_records.values()].map(KripTop_item => ({ ...KripTop_item }))];
  }
  const KripTop_pool = {
    execute: KripTop_execute,
    async getConnection() { return { execute: KripTop_execute, async beginTransaction() {}, async commit() {}, async rollback() {}, release() {} }; },
  };
  const KripTop_server = KripTop_createApp(KripTop_createMysqlStore(KripTop_pool)).listen(0, '127.0.0.1');
  await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
  KripTop_context.after(() => new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve)));
  const KripTop_url = `http://127.0.0.1:${KripTop_server.address().port}/api/employees`;
  const KripTop_headers = { Authorization: 'Bearer mock-jwt-token', 'Content-Type': 'application/json' };
  const KripTop_createdResponse = await fetch(KripTop_url, { method: 'POST', headers: KripTop_headers, body: JSON.stringify({ name: "O'Neil", position: 'QA', salary: 123.45 }) });
  KripTop_assert.equal(KripTop_createdResponse.status, 201);
  const KripTop_created = await KripTop_createdResponse.json();
  KripTop_assert.deepEqual(KripTop_created, { id: KripTop_created.id, name: "O'Neil", position: 'QA', status: 'Active', salary: 123.45 });
  KripTop_assert.equal(KripTop_created.id.length, 36);
  KripTop_assert.ok(!KripTop_calls[0][0].includes("O'Neil"));
  const KripTop_toggled = await fetch(`${KripTop_url}/${KripTop_created.id}/status`, { method: 'PUT', headers: KripTop_headers });
  KripTop_assert.equal(KripTop_toggled.status, 200);
  KripTop_assert.equal((await KripTop_toggled.json()).status, 'On Leave');
  const KripTop_list = await (await fetch(KripTop_url, { headers: KripTop_headers })).json();
  KripTop_assert.equal(KripTop_list[0].salary, 123.45);
  const KripTop_deleted = await fetch(`${KripTop_url}/${KripTop_created.id}`, { method: 'DELETE', headers: KripTop_headers });
  KripTop_assert.equal(KripTop_deleted.status, 200);
  KripTop_assert.deepEqual(await KripTop_deleted.json(), { success: true });
  KripTop_assert.equal((await fetch(`${KripTop_url}/${KripTop_created.id}`, { method: 'DELETE', headers: KripTop_headers })).status, 404);
  KripTop_assert.equal((await fetch(`${KripTop_url}/${KripTop_created.id}/status`, { method: 'PUT', headers: KripTop_headers })).status, 404);
});
