import { test as KripTop_test } from 'node:test';
import KripTop_assert from 'node:assert/strict';
import { build as KripTop_build } from 'esbuild';
import { createRequire as KripTop_createRequire } from 'node:module';
import { KripTop_analyzeEmployees } from '../../backend/src/clusters.js';
await KripTop_build({ entryPoints: ['src/analytics.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: '.expo/analytics-test.cjs', logLevel: 'silent' });
const KripTop_require = KripTop_createRequire(import.meta.url);
const { KripTop_summary, KripTop_distribution, KripTop_positions, KripTop_tiers, KripTop_insights, KripTop_employeeCSV } = KripTop_require('../.expo/analytics-test.cjs');
const KripTop_employees = [10000, 20000, 50000, 60000, 90000, 100000].map((KripTop_salary, KripTop_index) => ({ id: String(KripTop_index), name: `Test ${KripTop_index}`, position: KripTop_index < 2 ? 'Assistant' : 'Analyst', status: KripTop_index % 2 ? 'On Leave' : 'Active', salary: KripTop_salary }));
const KripTop_analysis = { success: true, ...KripTop_analyzeEmployees(KripTop_employees) };

KripTop_test('seven executive metrics and position means match source employee values', () => {
  KripTop_assert.deepEqual(KripTop_summary(KripTop_employees), { total: 6, active: 3, leave: 3, payroll: 330000, average: 55000, highest: 100000, lowest: 10000 });
  KripTop_assert.deepEqual(KripTop_positions(KripTop_employees).map(KripTop_item => [KripTop_item.label, KripTop_item.value]), [['Analyst', 75000], ['Assistant', 15000]]);
});
KripTop_test('salary bands assign every employee exactly once at boundaries', () => {
  const KripTop_values = [0.01, 24999.99, 25000, 50000, 75000, 100000].map((KripTop_salary, KripTop_index) => ({ ...KripTop_employees[0], id: String(KripTop_index), salary: KripTop_salary }));
  KripTop_assert.deepEqual(KripTop_distribution(KripTop_values).map(KripTop_item => KripTop_item.value), [2, 1, 1, 1, 1]);
});
KripTop_test('tier count, percentage and payroll use actual server membership', () => {
  const KripTop_groups = KripTop_tiers(KripTop_analysis);
  KripTop_assert.equal(KripTop_groups.reduce((KripTop_sum, KripTop_group) => KripTop_sum + KripTop_group.count, 0), 6);
  KripTop_assert.equal(KripTop_groups.reduce((KripTop_sum, KripTop_group) => KripTop_sum + KripTop_group.payroll, 0), 330000);
  KripTop_assert.ok(Math.abs(KripTop_groups.reduce((KripTop_sum, KripTop_group) => KripTop_sum + KripTop_group.percentage, 0) - 100) < 1e-8);
  KripTop_assert.ok(KripTop_insights(KripTop_employees, KripTop_analysis).some(KripTop_item => KripTop_item.text.includes('50.0%')));
});
KripTop_test('zero employees and empty tiers produce finite, honest summaries', () => {
  const KripTop_empty = { success: true, ...KripTop_analyzeEmployees([]) };
  KripTop_assert.equal(KripTop_summary([]).highest, null);
  KripTop_assert.equal(KripTop_summary([]).average, 0);
  KripTop_assert.ok(KripTop_tiers(KripTop_empty).every(KripTop_group => KripTop_group.percentage === 0 && KripTop_group.payroll === 0));
  KripTop_assert.ok(KripTop_insights([], KripTop_empty)[0].text.includes('Add an employee'));
});
KripTop_test('CSV quotes commas/newlines, neutralizes spreadsheet formulas and includes real tiers', () => {
  const KripTop_values = [{ ...KripTop_employees[0], name: '=SUM(1,2)', position: 'QA, "Senior"\nAnalyst' }];
  const KripTop_csv = KripTop_employeeCSV(KripTop_values, KripTop_analysis);
  KripTop_assert.ok(KripTop_csv.includes('"\'=SUM(1,2)"'));
  KripTop_assert.ok(KripTop_csv.includes('"QA, ""Senior""\nAnalyst"'));
  KripTop_assert.ok(KripTop_csv.includes(KripTop_analysis.assignments[0].group));
});
