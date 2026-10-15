import type { KripTop_Analysis, KripTop_Employee } from './api';

export const KripTop_colors = ['#78b393', '#279b7b', '#173f36'];
export const KripTop_money = (KripTop_value: number) => `฿${KripTop_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const KripTop_compact = (KripTop_value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(KripTop_value);
export const KripTop_percent = (KripTop_part: number, KripTop_total: number) => KripTop_total ? KripTop_part / KripTop_total * 100 : 0;

export function KripTop_summary(KripTop_employees: KripTop_Employee[]) {
  const KripTop_salaries = KripTop_employees.map(KripTop_employee => KripTop_employee.salary);
  const KripTop_payroll = KripTop_salaries.reduce((KripTop_sum, KripTop_salary) => KripTop_sum + KripTop_salary, 0);
  const KripTop_active = KripTop_employees.filter(KripTop_employee => KripTop_employee.status === 'Active').length;
  return { total: KripTop_employees.length, active: KripTop_active, leave: KripTop_employees.length - KripTop_active,
    payroll: KripTop_payroll, average: KripTop_employees.length ? KripTop_payroll / KripTop_employees.length : 0,
    highest: KripTop_salaries.length ? KripTop_salaries.reduce((KripTop_max, KripTop_salary) => Math.max(KripTop_max, KripTop_salary)) : null,
    lowest: KripTop_salaries.length ? KripTop_salaries.reduce((KripTop_min, KripTop_salary) => Math.min(KripTop_min, KripTop_salary)) : null };
}

export function KripTop_distribution(KripTop_employees: KripTop_Employee[]) {
  const KripTop_bounds = [0, 25000, 50000, 75000, 100000, Infinity];
  return ['<25k', '25–50k', '50–75k', '75–100k', '≥100k'].map((KripTop_label, KripTop_index) => ({ label: KripTop_label, value: KripTop_employees.filter(KripTop_employee => KripTop_employee.salary >= KripTop_bounds[KripTop_index] && KripTop_employee.salary < KripTop_bounds[KripTop_index + 1]).length, color: '#279b7b' }));
}

export function KripTop_positions(KripTop_employees: KripTop_Employee[]) {
  const KripTop_groups = new Map<string, { total: number; count: number }>();
  for (const KripTop_employee of KripTop_employees) {
    const KripTop_group = KripTop_groups.get(KripTop_employee.position) || { total: 0, count: 0 };
    KripTop_group.total += KripTop_employee.salary; KripTop_group.count++;
    KripTop_groups.set(KripTop_employee.position, KripTop_group);
  }
  return [...KripTop_groups].map(([KripTop_label, KripTop_group]) => ({ label: KripTop_label, value: KripTop_group.total / KripTop_group.count, count: KripTop_group.count, color: '#279b7b' })).sort((KripTop_a, KripTop_b) => KripTop_b.value - KripTop_a.value);
}

export function KripTop_tiers(KripTop_analysis: KripTop_Analysis) {
  return [...KripTop_analysis.clusters].sort((KripTop_a, KripTop_b) => KripTop_a.centroid - KripTop_b.centroid).map((KripTop_cluster, KripTop_index) => {
    const KripTop_members = KripTop_analysis.assignments.filter(KripTop_assignment => KripTop_assignment.group === KripTop_cluster.group);
    return { ...KripTop_cluster, color: KripTop_colors[KripTop_index], members: KripTop_members, payroll: KripTop_members.reduce((KripTop_sum, KripTop_member) => KripTop_sum + KripTop_member.salary, 0), percentage: KripTop_percent(KripTop_cluster.count, KripTop_analysis.employees.length) };
  });
}

export function KripTop_insights(KripTop_employees: KripTop_Employee[], KripTop_analysis: KripTop_Analysis | null) {
  const KripTop_metrics = KripTop_summary(KripTop_employees);
  if (!KripTop_metrics.total) return [{ title: 'Build your first workforce snapshot', text: 'Add an employee to calculate payroll and salary groups.' }];
  const KripTop_result = [{ title: 'Workforce availability', text: `${KripTop_metrics.leave} of ${KripTop_metrics.total} employees (${KripTop_percent(KripTop_metrics.leave, KripTop_metrics.total).toFixed(1)}%) are on leave. Use this count when reviewing team coverage.` }];
  if (!KripTop_analysis) return [...KripTop_result, { title: 'Salary tiers await analysis', text: 'Refresh the salary analysis to review tier-level payroll allocation.' }];
  const KripTop_groups = KripTop_tiers(KripTop_analysis).filter(KripTop_tier => KripTop_tier.count > 0);
  if (!KripTop_groups.length) return KripTop_result;
  const KripTop_highest = KripTop_groups.at(-1)!;
  const KripTop_largestCount = Math.max(...KripTop_groups.map(KripTop_group => KripTop_group.count));
  const KripTop_largest = KripTop_groups.filter(KripTop_group => KripTop_group.count === KripTop_largestCount).map(KripTop_group => KripTop_group.group).join(' & ');
  const KripTop_concentration = [...KripTop_groups].sort((KripTop_a, KripTop_b) => KripTop_b.payroll - KripTop_a.payroll)[0];
  KripTop_result.push({ title: 'Highest average salary', text: `${KripTop_highest.group} has the highest occupied-tier average at ${KripTop_money(KripTop_highest.centroid)} per month across ${KripTop_highest.count} employees.` },
    { title: 'Largest employee group', text: `${KripTop_largest} ${KripTop_largest.includes('&') ? 'each contain' : 'contains'} ${KripTop_largestCount} employees (${KripTop_percent(KripTop_largestCount, KripTop_metrics.total).toFixed(1)}% of the team).` },
    { title: 'Payroll concentration', text: `${KripTop_concentration.group} accounts for ${KripTop_percent(KripTop_concentration.payroll, KripTop_metrics.payroll).toFixed(1)}% of monthly payroll (${KripTop_money(KripTop_concentration.payroll)}). Review this segment when planning the payroll budget.` });
  if (KripTop_groups.length > 1) KripTop_result.push({ title: 'Salary span between groups', text: `The difference between the highest and lowest occupied-tier averages is ${KripTop_money(KripTop_highest.centroid - KripTop_groups[0].centroid)} per month.` });
  return KripTop_result;
}

function KripTop_csvCell(KripTop_value: string | number) {
  let KripTop_text = String(KripTop_value);
  if (typeof KripTop_value === 'string' && /^[\s]*[=+\-@]/.test(KripTop_text)) KripTop_text = `'${KripTop_text}`;
  return `"${KripTop_text.replace(/"/g, '""')}"`;
}
export function KripTop_employeeCSV(KripTop_employees: KripTop_Employee[], KripTop_analysis: KripTop_Analysis | null) {
  const KripTop_membership = new Map(KripTop_analysis?.assignments.map(KripTop_assignment => [KripTop_assignment.id, KripTop_assignment.group]) || []);
  return [['id', 'name', 'position', 'status', 'monthly_salary_thb', 'salary_tier'], ...KripTop_employees.map(KripTop_employee => [KripTop_employee.id, KripTop_employee.name, KripTop_employee.position, KripTop_employee.status, KripTop_employee.salary, KripTop_membership.get(KripTop_employee.id) || 'Not analyzed'])].map(KripTop_row => KripTop_row.map(KripTop_csvCell).join(',')).join('\r\n');
}
