// Default checks are read-only. --crud explicitly opts into disposable test records.
import KripTop_assert from 'node:assert/strict';
import { randomUUID as KripTop_randomUUID } from 'node:crypto';

const KripTop_base = process.env.KRIPTOP_API_BASE_URL?.replace(/\/$/, '');
if (!KripTop_base || !/^https?:\/\//.test(KripTop_base)) throw new Error('Set KRIPTOP_API_BASE_URL to the verified Express base URL (without /api).');
let KripTop_token;
async function KripTop_call(KripTop_path, KripTop_method = 'GET', KripTop_body, KripTop_expected = 200) {
  const KripTop_response = await fetch(`${KripTop_base}${KripTop_path}`, {
    method: KripTop_method,
    signal: AbortSignal.timeout(12000),
    headers: { 'Content-Type': 'application/json', ...(KripTop_token ? { Authorization: `Bearer ${KripTop_token}` } : {}) },
    ...(KripTop_body === undefined ? {} : { body: JSON.stringify(KripTop_body) }),
  });
  KripTop_assert.equal(KripTop_response.status, KripTop_expected, `${KripTop_method} ${KripTop_path}`);
  return KripTop_response.json();
}
await KripTop_call('/api/employees', 'GET', undefined, 401);
console.log('PASS unauthorized employee access: 401');
await KripTop_call('/api/login', 'POST', { username: 'admin', password: 'incorrect' }, 401);
console.log('PASS invalid login: 401');
const KripTop_login = await KripTop_call('/api/login', 'POST', { username: 'admin', password: 'password123' });
KripTop_assert.deepEqual(KripTop_login, { success: true, token: 'mock-jwt-token' });
KripTop_token = KripTop_login.token;
console.log('PASS valid login: 200, required response');
const KripTop_employees = await KripTop_call('/api/employees');
KripTop_assert.ok(Array.isArray(KripTop_employees));
KripTop_assert.ok(KripTop_employees.every(KripTop_employee => typeof KripTop_employee.id === 'string' && typeof KripTop_employee.name === 'string' && typeof KripTop_employee.position === 'string' && ['Active', 'On Leave'].includes(KripTop_employee.status) && typeof KripTop_employee.salary === 'number' && Number.isFinite(KripTop_employee.salary)));
console.log(`PASS employee list: ${KripTop_employees.length} employees`);
const KripTop_analysis = await KripTop_call('/api/employees/salary-clusters');
KripTop_assert.equal(KripTop_analysis.success, true);
KripTop_assert.equal(KripTop_analysis.clusters.length, 3);
KripTop_assert.equal(KripTop_analysis.clusters.reduce((KripTop_total, KripTop_item) => KripTop_total + KripTop_item.count, 0), KripTop_employees.length);
KripTop_assert.ok(KripTop_analysis.clusters.every((KripTop_item, KripTop_index, KripTop_all) => KripTop_item.group === `Tier ${KripTop_index + 1}` && Number.isFinite(KripTop_item.centroid) && (KripTop_index === 0 || KripTop_all[KripTop_index - 1].centroid <= KripTop_item.centroid)));
const KripTop_salarySum = KripTop_employees.reduce((KripTop_sum, KripTop_employee) => KripTop_sum + KripTop_employee.salary, 0);
const KripTop_clusterSum = KripTop_analysis.clusters.reduce((KripTop_sum, KripTop_cluster) => KripTop_sum + KripTop_cluster.centroid * KripTop_cluster.count, 0);
KripTop_assert.ok(Math.abs(KripTop_salarySum - KripTop_clusterSum) <= Math.max(1, KripTop_salarySum) * 1e-10);
console.log('PASS three sorted salary tiers, counts match employees');
KripTop_assert.deepEqual(KripTop_analysis.employees, KripTop_employees);
KripTop_assert.equal(KripTop_analysis.assignments.length, KripTop_employees.length);
KripTop_assert.equal(new Set(KripTop_analysis.assignments.map(KripTop_item => KripTop_item.id)).size, KripTop_employees.length);
for (const KripTop_cluster of KripTop_analysis.clusters) {
  const KripTop_members = KripTop_analysis.assignments.filter(KripTop_item => KripTop_item.group === KripTop_cluster.group);
  KripTop_assert.equal(KripTop_members.length, KripTop_cluster.count);
  KripTop_assert.ok(KripTop_members.every(KripTop_item => KripTop_employees.some(KripTop_employee => KripTop_employee.id === KripTop_item.id && KripTop_employee.salary === KripTop_item.salary)));
}
console.log('PASS current employee snapshot and exact K-Means memberships');

if (process.argv.includes('--crud')) {
  const KripTop_missing = KripTop_randomUUID();
  await KripTop_call(`/api/employees/${KripTop_missing}/status`, 'PUT', undefined, 404);
  await KripTop_call(`/api/employees/${KripTop_missing}`, 'DELETE', undefined, 404);
  console.log('PASS nonexistent employee IDs: 404');
  await KripTop_call('/api/employees', 'POST', { name: '', position: '', salary: 'invalid' }, 400);
  console.log('PASS invalid employee input: 400');
  let KripTop_id;
  try {
    const KripTop_created = await KripTop_call('/api/employees', 'POST', { name: `KripTop_DeploymentTest_${KripTop_randomUUID()}`, position: 'Temporary verification record', salary: 39000 }, 201);
    KripTop_id = KripTop_created.id;
    KripTop_assert.equal(typeof KripTop_id, 'string');
    const KripTop_path = `/api/employees/${encodeURIComponent(KripTop_id)}`;
    KripTop_assert.equal((await KripTop_call(`${KripTop_path}/status`, 'PUT')).status, 'On Leave');
    const KripTop_edited = await KripTop_call(KripTop_path, 'PUT', { name: 'KripTop_EditedDeploymentTest', position: 'Temporary edited verification record', salary: 61357.25 });
    KripTop_assert.equal(KripTop_edited.status, 'On Leave');
    KripTop_assert.equal(KripTop_edited.salary, 61357.25);
    KripTop_assert.equal((await KripTop_call(`${KripTop_path}/status`, 'PUT')).status, 'Active');
    const KripTop_current = await KripTop_call('/api/employees');
    KripTop_assert.ok(KripTop_current.some(KripTop_item => KripTop_item.id === KripTop_id));
    const KripTop_updatedAnalysis = await KripTop_call('/api/employees/salary-clusters');
    KripTop_assert.equal(KripTop_updatedAnalysis.clusters.reduce((KripTop_total, KripTop_item) => KripTop_total + KripTop_item.count, 0), KripTop_current.length);
    KripTop_assert.equal(KripTop_updatedAnalysis.assignments.find(KripTop_item => KripTop_item.id === KripTop_id).salary, 61357.25);
    console.log('PASS create, edit, preserved status, list refresh, status toggle twice, live analysis');
  } finally {
    if (KripTop_id) {
      try { await KripTop_call(`/api/employees/${encodeURIComponent(KripTop_id)}`, 'DELETE'); }
      catch (KripTop_error) {
        console.error(`Cleanup failed for temporary employee ID ${KripTop_id}; retry deleting only this ID on the confirmed Final Exam API.`);
        throw KripTop_error;
      }
      KripTop_assert.ok(!(await KripTop_call('/api/employees')).some(KripTop_item => KripTop_item.id === KripTop_id));
      console.log('PASS deleted only the temporary verification employee');
      KripTop_assert.deepEqual(await KripTop_call('/api/employees'), KripTop_employees);
      console.log('PASS every original employee unchanged');
    }
  }
} else console.log('Read-only checks complete. Use --crud only for the confirmed Final Exam deployment.');
