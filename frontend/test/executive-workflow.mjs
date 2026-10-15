import { JSDOM as KripTop_JSDOM } from 'jsdom';
import { build as KripTop_build } from 'esbuild';
import KripTop_assert from 'node:assert/strict';
import { createRequire as KripTop_createRequire } from 'node:module';
import { randomUUID as KripTop_randomUUID } from 'node:crypto';
import { KripTop_createApp } from '../../backend/src/app.js';
import { KripTop_createMemoryStore } from '../../backend/src/memory-store.js';

const KripTop_width = Number(process.env.KRIPTOP_TEST_WIDTH || 1440);
const KripTop_dom = new KripTop_JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
Object.defineProperty(KripTop_dom.window, 'innerWidth', { value: KripTop_width, configurable: true });
Object.defineProperty(KripTop_dom.window, 'innerHeight', { value: 1000, configurable: true });
for (const KripTop_key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'ShadowRoot', 'MutationObserver', 'getComputedStyle']) Object.defineProperty(globalThis, KripTop_key, { value: KripTop_dom.window[KripTop_key], configurable: true });
globalThis.requestAnimationFrame = KripTop_callback => setTimeout(() => KripTop_callback(performance.now()), 16);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const KripTop_alerts = []; let KripTop_confirmDelete = false; let KripTop_confirmCalls = 0; let KripTop_exportBlob; let KripTop_downloads = 0;
window.alert = KripTop_text => KripTop_alerts.push(KripTop_text);
window.confirm = () => { KripTop_confirmCalls++; return KripTop_confirmDelete; };
URL.createObjectURL = KripTop_blob => { KripTop_exportBlob = KripTop_blob; return 'blob:kriptop-test'; };
URL.revokeObjectURL = () => {};
KripTop_dom.window.HTMLAnchorElement.prototype.click = function () { KripTop_downloads++; };
const KripTop_external = process.env.KRIPTOP_E2E_API_BASE_URL?.replace(/\/$/, '');
if (KripTop_external && process.env.KRIPTOP_ALLOW_E2E_WRITES !== '1') throw new Error('Set KRIPTOP_ALLOW_E2E_WRITES=1 to authorize a temporary employee for external UI tests.');
const KripTop_fixture = KripTop_createMemoryStore();
if (!KripTop_external && process.env.KRIPTOP_TEST_EMPTY === '1') for (const KripTop_employee of await KripTop_fixture.KripTop_list()) await KripTop_fixture.KripTop_delete(KripTop_employee.id);
const KripTop_server = KripTop_external ? null : KripTop_createApp(KripTop_fixture).listen(0, '127.0.0.1');
if (KripTop_server) await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
const KripTop_url = KripTop_external || `http://127.0.0.1:${KripTop_server.address().port}`;
const KripTop_testName = `KripTop_UI_Test_${KripTop_randomUUID()}`;
let KripTop_before = null;
async function KripTop_readEmployees() {
  const KripTop_response = await fetch(`${KripTop_url}/api/employees`, { headers: { Authorization: 'Bearer mock-jwt-token' }, signal: AbortSignal.timeout(12000) });
  KripTop_assert.equal(KripTop_response.status, 200); return KripTop_response.json();
}
const KripTop_money = KripTop_value => `฿${KripTop_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
try {
  KripTop_before = await KripTop_readEmployees();
  await KripTop_build({ entryPoints: ['App.tsx'], bundle: true, platform: 'node', format: 'cjs', outfile: '.expo/workflow-app.cjs', alias: { 'react-native': 'react-native-web' }, resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'], mainFields: ['module', 'main'], external: ['react', 'react-dom', 'react-dom/*'], define: { 'process.env.EXPO_PUBLIC_API_BASE_URL': JSON.stringify(KripTop_url), __DEV__: 'false' }, logLevel: 'silent' });
  const { default: KripTop_React } = await import('react');
  const { render: KripTop_render, screen: KripTop_screen, fireEvent: KripTop_fireEvent, waitFor: KripTop_waitFor, within: KripTop_within, cleanup: KripTop_cleanup, configure: KripTop_configure } = await import('@testing-library/react');
  KripTop_configure({ asyncUtilTimeout: 12000 });
  const KripTop_require = KripTop_createRequire(import.meta.url);
  KripTop_render(KripTop_React.createElement(KripTop_require('../.expo/workflow-app.cjs').default));
  const KripTop_ready = () => KripTop_waitFor(() => KripTop_assert.equal(KripTop_screen.getByRole('button', { name: 'Refresh' }).disabled, false));
  async function KripTop_navigate(KripTop_page) {
    if (!KripTop_screen.queryByRole('button', { name: `Go to ${KripTop_page}` })) KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Open navigation' }));
    KripTop_fireEvent.click(await KripTop_screen.findByRole('button', { name: `Go to ${KripTop_page}` }));
    await KripTop_screen.findByRole('heading', { name: KripTop_page });
    await KripTop_ready();
  }
  function KripTop_checkMetrics(KripTop_values) {
    const KripTop_sum = KripTop_values.reduce((KripTop_total, KripTop_employee) => KripTop_total + KripTop_employee.salary, 0);
    const KripTop_active = KripTop_values.filter(KripTop_employee => KripTop_employee.status === 'Active').length;
    for (const [KripTop_label, KripTop_value] of [['Total Employees', KripTop_values.length], ['Active Employees', KripTop_active], ['On Leave Employees', KripTop_values.length - KripTop_active], ['Total Monthly Payroll', KripTop_money(KripTop_sum)], ['Average Monthly Salary', KripTop_values.length ? KripTop_money(KripTop_sum / KripTop_values.length) : '—'], ['Highest Salary', KripTop_values.length ? KripTop_money(Math.max(...KripTop_values.map(KripTop_employee => KripTop_employee.salary))) : '—'], ['Lowest Salary', KripTop_values.length ? KripTop_money(Math.min(...KripTop_values.map(KripTop_employee => KripTop_employee.salary))) : '—']]) KripTop_assert.ok(KripTop_screen.getByLabelText(`${KripTop_label}: ${KripTop_value}`));
  }
  KripTop_assert.ok(!KripTop_screen.queryByRole('button', { name: 'Open navigation' }));
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Username'), { target: { value: 'admin' } });
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Password'), { target: { value: 'wrong' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Sign in' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_alerts.some(KripTop_text => KripTop_text.includes('Login failed'))));
  KripTop_assert.ok(!KripTop_screen.queryByRole('button', { name: 'Open navigation' }));
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Password'), { target: { value: 'password123' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Sign in' }));
  await KripTop_screen.findByRole('heading', { name: 'Executive Dashboard' }); await KripTop_ready();
  KripTop_checkMetrics(KripTop_before);
  console.log('PASS login guard and all seven KPIs match API data');
  await KripTop_navigate('Salary Analytics');
  for (const KripTop_heading of ['Salary distribution', 'Employee status', 'Average salary by position', 'Payroll composition']) KripTop_assert.ok(KripTop_screen.getByRole('heading', { name: KripTop_heading }));
  await KripTop_navigate('Employee Management');
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Add Employee' }));
  KripTop_assert.ok(KripTop_alerts.some(KripTop_text => KripTop_text.includes('Check employee details')));
  for (const [KripTop_label, KripTop_value] of [['Full name', KripTop_testName], ['Position', 'QA Analyst'], ['Monthly salary (THB)', '39000']]) KripTop_fireEvent.change(KripTop_screen.getByLabelText(KripTop_label), { target: { value: KripTop_value } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Add Employee' }));
  await KripTop_screen.findByText(KripTop_testName); await KripTop_ready();
  const KripTop_id = (await KripTop_readEmployees()).find(KripTop_employee => KripTop_employee.name === KripTop_testName).id;
  const KripTop_row = () => KripTop_screen.getByTestId(`employee-${KripTop_id}`);
  KripTop_fireEvent.click(KripTop_within(KripTop_row()).getByRole('button', { name: 'Toggle Status' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_within(KripTop_row()).getByText('On Leave'))); await KripTop_ready();
  KripTop_fireEvent.click(KripTop_within(KripTop_row()).getByRole('button', { name: 'Edit' }));
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Position'), { target: { value: 'Senior QA Analyst' } });
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Monthly salary (THB)'), { target: { value: '62400.50' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Save changes' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_within(KripTop_row()).getByText('Senior QA Analyst'))); await KripTop_ready();
  KripTop_assert.ok(KripTop_within(KripTop_row()).getByText('On Leave'));
  const KripTop_saved = (await KripTop_readEmployees()).find(KripTop_employee => KripTop_employee.id === KripTop_id);
  KripTop_assert.equal(KripTop_saved.salary, 62400.5); KripTop_assert.equal(KripTop_saved.position, 'Senior QA Analyst');
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Search employees'), { target: { value: KripTop_testName } });
  KripTop_assert.ok(KripTop_screen.getByText(`Showing 1 of ${KripTop_before.length + 1} employees`));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Filter: Active' })); KripTop_assert.ok(KripTop_screen.getByText('No employees match these filters.'));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Filter: On Leave' })); KripTop_assert.ok(KripTop_screen.getByText(KripTop_testName));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Filter: All' })); KripTop_fireEvent.change(KripTop_screen.getByLabelText('Search employees'), { target: { value: '' } });
  const KripTop_current = await KripTop_readEmployees();
  for (const KripTop_direction of ['ascending', 'descending']) {
    KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: `Salary ${KripTop_direction}` }));
    const KripTop_actual = KripTop_screen.getAllByTestId(/^employee-/).map(KripTop_element => KripTop_current.find(KripTop_employee => `employee-${KripTop_employee.id}` === KripTop_element.dataset.testid).salary);
    KripTop_assert.deepEqual(KripTop_actual, [...KripTop_actual].sort((KripTop_a, KripTop_b) => KripTop_direction === 'ascending' ? KripTop_a - KripTop_b : KripTop_b - KripTop_a));
  }
  console.log('PASS add, status toggle, persistent edit, search, status filters and both salary sorts');
  await KripTop_navigate('Executive Dashboard'); KripTop_checkMetrics(KripTop_current);
  await KripTop_navigate('K-Means Clustering');
  if (!KripTop_external) {
    const KripTop_originalFetch = globalThis.fetch;
    globalThis.fetch = async KripTop_path => new Response(JSON.stringify({ error: String(KripTop_path).endsWith('salary-clusters') ? 'Temporary analysis unavailable' : 'Temporary employee list unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Analyze Salary Structure' }));
    await KripTop_screen.findByText('Temporary analysis unavailable'); await KripTop_ready();
    await KripTop_navigate('Executive Dashboard'); KripTop_checkMetrics(KripTop_current);
    globalThis.fetch = KripTop_originalFetch;
    await KripTop_navigate('K-Means Clustering');
    console.log('PASS API failure states preserve the last successful metrics');
  }
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Analyze Salary Structure' }));
  KripTop_assert.ok(KripTop_screen.getByLabelText('Analyzing salaries…')); await KripTop_ready();
  for (const KripTop_heading of ['K-Means salary scatter', 'Average salary by cluster', 'Employee distribution by cluster', 'Sorted salary profiles']) KripTop_assert.ok(KripTop_screen.getByRole('heading', { name: KripTop_heading }));
  const KripTop_points = KripTop_screen.getAllByLabelText(/^Tier [123]: ฿62,400\.5$/);
  KripTop_fireEvent.click(KripTop_points[0]);
  KripTop_assert.ok(KripTop_screen.getByText(KripTop_text => KripTop_text.includes(KripTop_testName) && KripTop_text.includes('฿62,400.5 / month')));
  const KripTop_counts = KripTop_screen.getAllByText(/^\d+ employees · (average \/ month|empty tier)$/).map(KripTop_element => Number(KripTop_element.textContent.split(' ')[0]));
  KripTop_assert.equal(KripTop_counts.length, 3); KripTop_assert.equal(KripTop_counts.reduce((KripTop_sum, KripTop_count) => KripTop_sum + KripTop_count, 0), KripTop_current.length);
  await KripTop_navigate('Reports & Insights');
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Export CSV' }));
  KripTop_assert.equal(KripTop_downloads, 1); const KripTop_csv = await KripTop_exportBlob.text();
  KripTop_assert.ok(KripTop_csv.includes(KripTop_testName) && KripTop_csv.includes('62400.5'));
  console.log('PASS all private pages, analytics charts, live tier counts, loading indicator and CSV export');
  await KripTop_navigate('Employee Management');
  KripTop_fireEvent.click(KripTop_within(KripTop_row()).getByRole('button', { name: 'Delete' }));
  KripTop_assert.ok(KripTop_confirmCalls > 0); KripTop_assert.ok(KripTop_screen.getByText(KripTop_testName));
  KripTop_confirmDelete = true; KripTop_fireEvent.click(KripTop_within(KripTop_row()).getByRole('button', { name: 'Delete' }));
  await KripTop_waitFor(() => KripTop_assert.ok(!KripTop_screen.queryByText(KripTop_testName))); await KripTop_ready();
  await KripTop_navigate('Executive Dashboard'); KripTop_checkMetrics(KripTop_before);
  if (!KripTop_screen.queryByRole('button', { name: 'Logout' })) KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Open navigation' }));
  KripTop_fireEvent.click(await KripTop_screen.findByRole('button', { name: 'Logout' }));
  KripTop_assert.ok(KripTop_screen.getByRole('button', { name: 'Sign in' })); KripTop_assert.ok(!KripTop_screen.queryByRole('button', { name: 'Open navigation' }));
  KripTop_cleanup(); console.log(`PASS ${KripTop_width}px navigation, delete cancellation/confirmation, automatic metric refresh and logout`);
} catch (KripTop_error) {
  console.error('WORKFLOW FAILED:', KripTop_error.message?.slice(0, 2500)); process.exitCode = 1;
} finally {
  if (KripTop_before) {
    try {
      for (const KripTop_employee of await KripTop_readEmployees()) if (KripTop_employee.name === KripTop_testName) {
        const KripTop_response = await fetch(`${KripTop_url}/api/employees/${encodeURIComponent(KripTop_employee.id)}`, { method: 'DELETE', headers: { Authorization: 'Bearer mock-jwt-token' }, signal: AbortSignal.timeout(12000) }); KripTop_assert.equal(KripTop_response.status, 200);
      }
      KripTop_assert.ok(JSON.stringify(await KripTop_readEmployees()) === JSON.stringify(KripTop_before), 'Existing employees must remain unchanged after UI tests.');
      console.log('PASS existing employee snapshot unchanged');
    } catch { console.error('Cleanup/preservation check failed for only this test employee name:', KripTop_testName); process.exitCode = 1; }
  }
  if (KripTop_server) { KripTop_server.closeAllConnections(); await new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve)); }
  KripTop_dom.window.close();
}
