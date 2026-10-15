import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { KripTop_createApp } from '../src/app.js';
import { KripTop_createMemoryStore } from '../src/memory-store.js';
import { KripTop_clusterSalaries } from '../src/clusters.js';

KripTop_test('HTTP authentication, validation, CRUD and live analytics', async KripTop_context => {
  const KripTop_server = KripTop_createApp(KripTop_createMemoryStore()).listen(0, '127.0.0.1');
  await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
  KripTop_context.after(() => new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve)));
  const KripTop_base = `http://127.0.0.1:${KripTop_server.address().port}`;
  async function KripTop_call(KripTop_path, KripTop_method = 'GET', KripTop_body, KripTop_auth = true) {
    const KripTop_response = await fetch(`${KripTop_base}${KripTop_path}`, { method: KripTop_method, headers: { 'Content-Type': 'application/json', ...(KripTop_auth ? { Authorization: 'Bearer mock-jwt-token' } : {}) }, ...(KripTop_body === undefined ? {} : { body: JSON.stringify(KripTop_body) }) });
    return { status: KripTop_response.status, data: await KripTop_response.json() };
  }
  KripTop_assert.equal((await KripTop_call('/api/employees', 'GET', undefined, false)).status, 401);
  const KripTop_login = await KripTop_call('/api/login', 'POST', { username: 'admin', password: 'password123' }, false);
  KripTop_assert.equal(KripTop_login.status, 200);
  KripTop_assert.deepEqual(KripTop_login.data, { success: true, token: 'mock-jwt-token' });
  KripTop_assert.equal((await KripTop_call('/api/login', 'POST', { username: 'admin', password: 'wrong' }, false)).status, 401);
  KripTop_assert.equal((await KripTop_call('/api/login', 'POST', {}, false)).status, 401);
  const KripTop_initial = (await KripTop_call('/api/employees')).data;
  KripTop_assert.ok(KripTop_initial.length >= 5);
  for (const KripTop_body of [{}, { name: ' ', position: 'Dev', salary: 10 }, { name: 'A', position: '', salary: 10 }, { name: 'A'.repeat(101), position: 'Dev', salary: 10 }, { name: 'A', position: 'B'.repeat(101), salary: 10 }, ...['', '45000', null, true, {}, [], 0, -1, 1e100, 10000000000, 0.001, 1.001, 1e-300].map(KripTop_salary => ({ name: 'A', position: 'Dev', salary: KripTop_salary }))]) {
    KripTop_assert.equal((await KripTop_call('/api/employees', 'POST', KripTop_body)).status, 400, JSON.stringify(KripTop_body));
  }
  const KripTop_malformed = await fetch(`${KripTop_base}/api/employees`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-jwt-token' }, body: '{"salary":NaN}' });
  KripTop_assert.equal(KripTop_malformed.status, 400);
  const KripTop_created = await KripTop_call('/api/employees', 'POST', { name: ' Test Person ', position: ' Analyst ', salary: 31000 });
  KripTop_assert.equal(KripTop_created.status, 201);
  KripTop_assert.equal(KripTop_created.data.name, 'Test Person');
  KripTop_assert.equal(KripTop_created.data.status, 'Active');
  const KripTop_id = KripTop_created.data.id;
  KripTop_assert.ok(!KripTop_initial.some(KripTop_employee => KripTop_employee.id === KripTop_id));
  KripTop_assert.equal((await KripTop_call(`/api/employees/${KripTop_id}/status`, 'PUT')).data.status, 'On Leave');
  KripTop_assert.equal((await KripTop_call(`/api/employees/${KripTop_id}/status`, 'PUT')).data.status, 'Active');
  const KripTop_analysis = await KripTop_call('/api/employees/salary-clusters');
  KripTop_assert.equal(KripTop_analysis.status, 200);
  KripTop_assert.equal(KripTop_analysis.data.clusters.reduce((KripTop_sum, KripTop_cluster) => KripTop_sum + KripTop_cluster.count, 0), KripTop_initial.length + 1);
  KripTop_assert.equal((await KripTop_call(`/api/employees/${KripTop_id}`, 'DELETE')).status, 200);
  KripTop_assert.equal((await KripTop_call(`/api/employees/${KripTop_id}`, 'DELETE')).status, 404);
  KripTop_assert.equal((await KripTop_call('/api/employees/missing/status', 'PUT')).status, 404);
  for (const KripTop_employee of KripTop_initial) await KripTop_call(`/api/employees/${KripTop_employee.id}`, 'DELETE');
  KripTop_assert.deepEqual((await KripTop_call('/api/employees')).data, []);
  KripTop_assert.deepEqual((await KripTop_call('/api/employees/salary-clusters')).data.clusters.map(KripTop_item => KripTop_item.count), [0, 0, 0]);
});

for (const KripTop_values of [[], [100], [100, 200], [100, 100, 100, 100], [100, 100, 200, 200], [10, 11, 12, 100, 101, 102, 1000, 1001, 1002], [1, 2, 3, 1000000000000], Array.from({ length: 1000 }, (KripTop_unused, KripTop_index) => (KripTop_index * 7919) % 100003 + 1)]) {
  KripTop_test(`K-Means handles ${KripTop_values.length} salaries (${KripTop_values.slice(0, 4)})`, () => {
    const KripTop_result = KripTop_clusterSalaries(KripTop_values);
    KripTop_assert.equal(KripTop_result.length, 3);
    KripTop_assert.equal(KripTop_result.reduce((KripTop_sum, KripTop_item) => KripTop_sum + KripTop_item.count, 0), KripTop_values.length);
    KripTop_assert.ok(KripTop_result.every((KripTop_item, KripTop_index) => Number.isFinite(KripTop_item.centroid) && KripTop_item.count >= 0 && (KripTop_index === 0 || KripTop_result[KripTop_index - 1].centroid <= KripTop_item.centroid)));
    const KripTop_weighted = KripTop_result.reduce((KripTop_sum, KripTop_item) => KripTop_sum + KripTop_item.centroid * KripTop_item.count, 0);
    const KripTop_expected = KripTop_values.reduce((KripTop_sum, KripTop_value) => KripTop_sum + KripTop_value, 0);
    KripTop_assert.ok(Math.abs(KripTop_weighted - KripTop_expected) <= Math.max(1, KripTop_expected) * 1e-10);
  });
}
KripTop_test('known separated groups produce real means', () => {
  KripTop_assert.deepEqual(KripTop_clusterSalaries([10, 20, 100, 110, 1000, 1010]), [
    { group: 'Tier 1', centroid: 15, count: 2 }, { group: 'Tier 2', centroid: 105, count: 2 }, { group: 'Tier 3', centroid: 1005, count: 2 },
  ]);
});
