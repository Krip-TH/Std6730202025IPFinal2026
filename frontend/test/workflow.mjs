import { JSDOM as KripTop_JSDOM } from 'jsdom';
import { build as KripTop_build } from 'esbuild';
import KripTop_assert from 'node:assert/strict';
import { createRequire as KripTop_createRequire } from 'node:module';
import { KripTop_createApp } from '../../backend/src/app.js';

const KripTop_dom = new KripTop_JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const KripTop_key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'ShadowRoot', 'MutationObserver', 'getComputedStyle']) {
  Object.defineProperty(globalThis, KripTop_key, { value: KripTop_dom.window[KripTop_key], configurable: true });
}
globalThis.requestAnimationFrame = KripTop_callback => setTimeout(KripTop_callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const KripTop_alerts = [];
window.alert = KripTop_message => KripTop_alerts.push(KripTop_message);
let KripTop_confirmDelete = false;
window.confirm = () => KripTop_confirmDelete;
const KripTop_server = KripTop_createApp().listen(0, '127.0.0.1');
await new Promise(KripTop_resolve => KripTop_server.once('listening', KripTop_resolve));
const KripTop_url = `http://127.0.0.1:${KripTop_server.address().port}`;
try {
  await KripTop_build({ entryPoints: ['App.tsx'], bundle: true, platform: 'node', format: 'cjs', outfile: '.expo/workflow-app.cjs', alias: { 'react-native': 'react-native-web' }, external: ['react', 'react-dom', 'react-dom/*'], define: { 'process.env.EXPO_PUBLIC_API_BASE_URL': JSON.stringify(KripTop_url), __DEV__: 'false' }, logLevel: 'silent' });
  const { default: KripTop_React } = await import('react');
  const { render: KripTop_render, screen: KripTop_screen, fireEvent: KripTop_fireEvent, waitFor: KripTop_waitFor, within: KripTop_within, cleanup: KripTop_cleanup } = await import('@testing-library/react');
  const KripTop_require = KripTop_createRequire(import.meta.url);
  const KripTop_App = KripTop_require('../.expo/workflow-app.cjs').default;
  KripTop_render(KripTop_React.createElement(KripTop_App));
  console.log('UI rendered');
  KripTop_assert.equal(KripTop_screen.queryByText('Team overview'), null, 'dashboard must be blocked before login');
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Username'), { target: { value: 'admin' } });
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Password'), { target: { value: 'wrong' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Sign in' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_alerts.some(KripTop_text => KripTop_text.includes('Login failed'))));
  console.log('Invalid login verified');
  KripTop_assert.equal(KripTop_screen.queryByText('Team overview'), null);
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Password'), { target: { value: 'password123' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Sign in' }));
  await KripTop_screen.findByText('John Doe');
  console.log('Valid login verified');
  await KripTop_waitFor(() => KripTop_assert.equal(KripTop_screen.getAllByRole('button', { name: 'Delete' }).length, 5));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Add Employee' }));
  KripTop_assert.ok(KripTop_alerts.some(KripTop_text => KripTop_text.includes('Check employee details')));
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Full name'), { target: { value: 'Workflow Test Person' } });
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Position'), { target: { value: 'QA Analyst' } });
  KripTop_fireEvent.change(KripTop_screen.getByLabelText('Monthly salary (THB)'), { target: { value: '39000' } });
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Add Employee' }));
  await KripTop_screen.findByText('Workflow Test Person');
  console.log('Add verified');
  await KripTop_waitFor(() => KripTop_assert.equal(KripTop_screen.getByRole('button', { name: 'Analyze Salary Structure' }).disabled, false));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Analyze Salary Structure' }));
  await KripTop_screen.findByText('Tier 1');
  console.log('Analysis rendered');
  const KripTop_counts = KripTop_screen.getAllByText(/employees · average \/ month/).map(KripTop_element => Number(KripTop_element.textContent.split(' ')[0]));
  KripTop_assert.equal(KripTop_counts.reduce((KripTop_sum, KripTop_count) => KripTop_sum + KripTop_count, 0), 6);
  console.log('Analysis counts verified');
  const KripTop_card = KripTop_screen.getByText('Workflow Test Person').parentElement.parentElement.parentElement;
  KripTop_fireEvent.click(KripTop_within(KripTop_card).getByRole('button', { name: 'Toggle Status' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_within(KripTop_card).getByText('On Leave')));
  console.log('Toggle verified');
  KripTop_assert.equal(KripTop_screen.queryByText('Tier 1'), null, 'mutations invalidate analysis');
  console.log('Invalidation verified');
  await KripTop_waitFor(() => KripTop_assert.equal(KripTop_within(KripTop_card).getByRole('button', { name: 'Delete' }).disabled, false));
  KripTop_fireEvent.click(KripTop_within(KripTop_card).getByRole('button', { name: 'Delete' }));
  KripTop_assert.ok(KripTop_screen.getByText('Workflow Test Person'), 'cancel delete keeps employee');
  console.log('Cancel verified');
  KripTop_confirmDelete = true;
  KripTop_fireEvent.click(KripTop_within(KripTop_card).getByRole('button', { name: 'Delete' }));
  await KripTop_waitFor(() => KripTop_assert.ok(KripTop_screen.queryByText('Workflow Test Person') === null, 'deleted employee should disappear'));
  console.log('Delete verified');
  await KripTop_waitFor(() => KripTop_assert.equal(KripTop_screen.getByRole('button', { name: 'Sign out' }).disabled, false));
  KripTop_fireEvent.click(KripTop_screen.getByRole('button', { name: 'Sign out' }));
  KripTop_assert.ok(KripTop_screen.getByRole('button', { name: 'Sign in' }));
  KripTop_assert.equal(KripTop_screen.queryByText('Team overview'), null);
  KripTop_cleanup();
  console.log('PASS: rendered UI + real Express API: login guard, invalid/valid login, validation, add, analytics counts, toggle, invalidation, delete cancel/confirm, sign out.');
} catch (KripTop_error) {
  console.error('WORKFLOW FAILED:', KripTop_error.message?.slice(0, 2000));
  process.exitCode = 1;
} finally {
  KripTop_server.closeAllConnections();
  await new Promise(KripTop_resolve => KripTop_server.close(KripTop_resolve));
  KripTop_dom.window.close();
}

