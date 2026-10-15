import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { KripTop_analyzeEmployees } from '../src/clusters.js';
import { KripTop_createApp } from '../src/app.js';
import { KripTop_createMemoryStore } from '../src/memory-store.js';
import { KripTop_createMysqlStore } from '../src/mysql-store.js';

for (const KripTop_values of [[], [100], [100, 100], [100, 100, 100, 100], [100, 100, 200, 200, 500, 500], [10, 20, 100, 110, 1000, 1010]]) {
  KripTop_test(`actual cluster memberships and snapshot for ${KripTop_values}`, () => {
    const KripTop_employees = KripTop_values.map((KripTop_salary, KripTop_index) => ({ id: String(KripTop_index), name: 'Test', position: 'QA', status: 'Active', salary: KripTop_salary }));
    const KripTop_before = JSON.stringify(KripTop_employees);
    const KripTop_result = KripTop_analyzeEmployees(KripTop_employees);
    KripTop_assert.equal(KripTop_result.clusters.length, 3);
    KripTop_assert.equal(KripTop_result.assignments.length, KripTop_employees.length);
    KripTop_assert.equal(new Set(KripTop_result.assignments.map(KripTop_item => KripTop_item.id)).size, KripTop_employees.length);
    for (const KripTop_cluster of KripTop_result.clusters) {
      const KripTop_members = KripTop_result.assignments.filter(KripTop_assignment => KripTop_assignment.group === KripTop_cluster.group);
      KripTop_assert.equal(KripTop_members.length, KripTop_cluster.count);
      if (KripTop_members.length) KripTop_assert.ok(Math.abs(KripTop_members.reduce((KripTop_sum, KripTop_item) => KripTop_sum + KripTop_item.salary / KripTop_members.length, 0) - KripTop_cluster.centroid) < 1e-8);
    }
    KripTop_assert.equal(JSON.stringify(KripTop_result.employees), KripTop_before);
    KripTop_assert.equal(JSON.stringify(KripTop_employees), KripTop_before, 'analysis must not reorder or mutate employees');
  });
}

KripTop_test('HTTP employee edit validates, preserves status and refreshes salary analysis', async KripTop_context => {
  const KripTop_server = KripTop_createApp(KripTop_createMemoryStore()).listen(0, '127.0.0.1');
  await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
  KripTop_context.after(() => new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve)));
  const KripTop_url = `http://127.0.0.1:${KripTop_server.address().port}`;
  const KripTop_headers = { Authorization: 'Bearer mock-jwt-token', 'Content-Type': 'application/json' };
  const KripTop_values = { name: "Changed O'Neil", position: 'Executive Analyst', salary: 82000.25, status: 'Active' };
  const KripTop_unauthorized = await fetch(`${KripTop_url}/api/employees/3`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(KripTop_values) });
  KripTop_assert.equal(KripTop_unauthorized.status, 401);
  const KripTop_invalid = await fetch(`${KripTop_url}/api/employees/3`, { method: 'PUT', headers: KripTop_headers, body: JSON.stringify({ ...KripTop_values, salary: 1.005 }) });
  KripTop_assert.equal(KripTop_invalid.status, 400);
  const KripTop_updated = await fetch(`${KripTop_url}/api/employees/3`, { method: 'PUT', headers: KripTop_headers, body: JSON.stringify(KripTop_values) });
  KripTop_assert.equal(KripTop_updated.status, 200);
  KripTop_assert.deepEqual(await KripTop_updated.json(), { id: '3', name: KripTop_values.name, position: KripTop_values.position, salary: 82000.25, status: 'On Leave' });
  KripTop_assert.equal((await fetch(`${KripTop_url}/api/employees/missing`, { method: 'PUT', headers: KripTop_headers, body: JSON.stringify(KripTop_values) })).status, 404);
  const KripTop_analysis = await (await fetch(`${KripTop_url}/api/employees/salary-clusters`, { headers: KripTop_headers })).json();
  KripTop_assert.equal(KripTop_analysis.employees.find(KripTop_item => KripTop_item.id === '3').salary, 82000.25);
  KripTop_assert.equal(KripTop_analysis.assignments.find(KripTop_item => KripTop_item.id === '3').salary, 82000.25);
});

for (const KripTop_case of ['success', 'missing', 'failure']) {
  KripTop_test(`MySQL edit ${KripTop_case}: bound values, preserved status, released transaction`, async () => {
    const KripTop_events = [];
    const KripTop_connection = {
      async beginTransaction() { KripTop_events.push('begin'); },
      async execute(KripTop_sql, KripTop_params) {
        KripTop_events.push([KripTop_sql, KripTop_params]);
        if (KripTop_sql.startsWith('SELECT')) return [KripTop_case === 'missing' ? [] : [{ id: '3', name: 'Before', position: 'QA', status: 'On Leave', salary: '100.50' }]];
        if (KripTop_case === 'failure') throw new Error('simulated update failure');
        return [{ affectedRows: 1 }];
      },
      async commit() { KripTop_events.push('commit'); }, async rollback() { KripTop_events.push('rollback'); }, release() { KripTop_events.push('release'); },
    };
    const KripTop_store = KripTop_createMysqlStore({ async getConnection() { return KripTop_connection; } });
    const KripTop_values = { name: "O'Neil", position: 'Senior QA', salary: 500.25 };
    if (KripTop_case === 'failure') await KripTop_assert.rejects(KripTop_store.KripTop_update('3', KripTop_values), /simulated/);
    else {
      const KripTop_result = await KripTop_store.KripTop_update('3', KripTop_values);
      if (KripTop_case === 'missing') KripTop_assert.equal(KripTop_result, null);
      else {
        KripTop_assert.deepEqual(KripTop_result, { id: '3', ...KripTop_values, status: 'On Leave' });
        KripTop_assert.deepEqual(KripTop_events[2][1], ["O'Neil", 'Senior QA', 500.25, '3']);
        KripTop_assert.ok(!KripTop_events[2][0].includes("O'Neil"));
        KripTop_assert.ok(!KripTop_events[2][0].includes('`status` ='));
      }
    }
    KripTop_assert.equal(KripTop_events.at(-1), 'release');
    KripTop_assert.equal(KripTop_events.at(-2), KripTop_case === 'failure' ? 'rollback' : 'commit');
  });
}
