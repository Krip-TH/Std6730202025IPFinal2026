import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Users, UserCheck, Coffee, Wallet, Calculator, ArrowUpRight, ArrowDownRight, Sparkles, RefreshCw, Download } from 'lucide-react-native';
import { KripTop_Button, KripTop_Card, KripTop_Empty, KripTop_Loading, KripTop_styles, KripTop_theme } from './ui';
import { KripTop_BarChart, KripTop_Donut, KripTop_HorizontalBars, KripTop_ClusterPlot } from './charts';
import { KripTop_distribution, KripTop_insights, KripTop_money, KripTop_percent, KripTop_positions, KripTop_summary, KripTop_tiers } from './analytics';
import type { KripTop_Analysis, KripTop_Employee } from './api';
import type { KripTop_HR } from './useHR';

export function KripTop_KPIs({ employees: KripTop_employees }: { employees: KripTop_Employee[] }) {
  const KripTop_metrics = KripTop_summary(KripTop_employees);
  const KripTop_items = [
    { label: 'Total Employees', value: String(KripTop_metrics.total), icon: Users, caption: 'Across your organization' },
    { label: 'Active Employees', value: String(KripTop_metrics.active), icon: UserCheck, caption: `${KripTop_percent(KripTop_metrics.active, KripTop_metrics.total).toFixed(1)}% of the team` },
    { label: 'On Leave Employees', value: String(KripTop_metrics.leave), icon: Coffee, caption: 'Current leave status' },
    { label: 'Total Monthly Payroll', value: KripTop_money(KripTop_metrics.payroll), icon: Wallet, caption: 'Base salaries · THB / month' },
    { label: 'Average Monthly Salary', value: KripTop_metrics.total ? KripTop_money(KripTop_metrics.average) : '—', icon: Calculator, caption: 'Per employee · THB / month' },
    { label: 'Highest Salary', value: KripTop_metrics.highest !== null ? KripTop_money(KripTop_metrics.highest) : '—', icon: ArrowUpRight, caption: 'Current maximum · THB' },
    { label: 'Lowest Salary', value: KripTop_metrics.lowest !== null ? KripTop_money(KripTop_metrics.lowest) : '—', icon: ArrowDownRight, caption: 'Current minimum · THB' },
  ];
  return <View style={KripTop_styles.grid}>{KripTop_items.map(KripTop_item => <View key={KripTop_item.label} style={{ flexBasis: 195, flexGrow: 1, minWidth: 0, padding: 20, gap: 13, borderWidth: 1, borderColor: KripTop_theme.line, borderRadius: 15, backgroundColor: '#fff' }} accessible accessibilityLabel={`${KripTop_item.label}: ${KripTop_item.value}`}><View style={KripTop_styles.row}><Text style={[KripTop_styles.muted, { fontWeight: '600', color: '#627669', flex: 1 }]}>{KripTop_item.label}</Text><View style={{ padding: 7, borderRadius: 9, backgroundColor: '#f1f6ef' }}><KripTop_item.icon size={16} color="#5a8f73" strokeWidth={1.8} /></View></View><Text style={{ color: KripTop_theme.ink, fontSize: 26, fontWeight: '700', letterSpacing: -0.8 }}>{KripTop_item.value}</Text><Text style={[KripTop_styles.muted, { fontSize: 10 }]}>{KripTop_item.caption}</Text></View>)}</View>;
}

export function KripTop_Insights({ employees: KripTop_employees, analysis: KripTop_analysis }: { employees: KripTop_Employee[]; analysis: KripTop_Analysis | null }) {
  return <KripTop_Card title="Executive insights" subtitle="A practical reading of the current workforce and salary snapshot."><View style={KripTop_styles.grid}>{KripTop_insights(KripTop_employees, KripTop_analysis).map(KripTop_insight => <View key={KripTop_insight.title} style={{ flexBasis: 220, flexGrow: 1, gap: 10, padding: 17, borderRadius: 12, backgroundColor: '#f6f9f3' }}><Sparkles size={17} color="#6b9878" /><Text style={{ fontSize: 13, fontWeight: '700', color: KripTop_theme.ink }}>{KripTop_insight.title}</Text><Text style={KripTop_styles.muted}>{KripTop_insight.text}</Text></View>)}</View></KripTop_Card>;
}

export function KripTop_Executive({ data: KripTop_data, onEmployees: KripTop_onEmployees }: { data: KripTop_HR; onEmployees: () => void }) {
  return <>
    <View style={{ borderRadius: 18, backgroundColor: '#173f36', padding: 28, gap: 22, overflow: 'hidden' }}><Text style={[KripTop_styles.eyebrow, { color: '#98c7a9' }]}>A CLEARER VIEW OF YOUR ORGANIZATION</Text><View style={KripTop_styles.row}><View style={{ gap: 10, flexGrow: 1, flexShrink: 1, flexBasis: 300 }}><Text style={{ fontSize: 31, lineHeight: 38, color: '#fff', fontWeight: '700', letterSpacing: -0.7 }}>Your people. One clear picture.</Text><Text style={{ color: '#b1c7ba', fontSize: 13, lineHeight: 22 }}>Understand your workforce, manage payroll, and explore{ '\n' }the salary structure behind your team.</Text></View><KripTop_Button title="Manage your team" icon={Users} variant="secondary" onPress={KripTop_onEmployees} /></View><View style={{ height: 1, backgroundColor: '#34594a' }} /><Text style={{ color: '#a5c5b0', fontSize: 11 }}>CURRENT SNAPSHOT   ·   {KripTop_data.KripTop_employees.length} EMPLOYEES   ·   THB BASE SALARIES</Text></View>
    <KripTop_KPIs employees={KripTop_data.KripTop_employees} />
    <View style={KripTop_styles.grid}><View style={KripTop_styles.column}><KripTop_BarChart title="Salary distribution" subtitle="Employee count across monthly salary bands." data={KripTop_distribution(KripTop_data.KripTop_employees)} axis="Salary range (THB) · Employees per range" /></View><View style={KripTop_styles.column}><KripTop_Donut title="Employee status" subtitle="Current workforce availability." data={KripTop_statusData(KripTop_data.KripTop_employees)} /></View></View>
    <KripTop_Insights employees={KripTop_data.KripTop_employees} analysis={KripTop_data.KripTop_analysis} />
  </>;
}
function KripTop_statusData(KripTop_employees: KripTop_Employee[]) {
  return [{ label: 'Active', value: KripTop_employees.filter(KripTop_employee => KripTop_employee.status === 'Active').length, color: '#279b7b' }, { label: 'On Leave', value: KripTop_employees.filter(KripTop_employee => KripTop_employee.status === 'On Leave').length, color: '#c3a66a' }];
}
export function KripTop_SalaryPage({ employees: KripTop_employees }: { employees: KripTop_Employee[] }) {
  return <>
    <View style={KripTop_styles.grid}><View style={KripTop_styles.column}><KripTop_BarChart title="Salary distribution" subtitle="Employees per band. Lower bounds are inclusive." data={KripTop_distribution(KripTop_employees)} axis="Monthly salary range (THB) · Number of employees" /></View><View style={KripTop_styles.column}><KripTop_Donut title="Employee status" subtitle="Active and On Leave headcount." data={KripTop_statusData(KripTop_employees)} /></View></View>
    <View style={KripTop_styles.grid}><View style={KripTop_styles.column}><KripTop_HorizontalBars title="Average salary by position" subtitle="All positions, ordered by current average monthly salary." data={KripTop_positions(KripTop_employees)} /></View><View style={KripTop_styles.column}><KripTop_Donut title="Payroll composition" subtitle="Monthly base payroll allocated by employee status." centerLabel="monthly payroll" money data={['Active', 'On Leave'].map((KripTop_status, KripTop_index) => ({ label: KripTop_status, value: KripTop_employees.filter(KripTop_employee => KripTop_employee.status === KripTop_status).reduce((KripTop_sum, KripTop_employee) => KripTop_sum + KripTop_employee.salary, 0), color: KripTop_index === 0 ? '#279b7b' : '#c3a66a' }))} /></View></View>
  </>;
}

export function KripTop_ClusterPage({ data: KripTop_data }: { data: KripTop_HR }) {
  const KripTop_analysis = KripTop_data.KripTop_analysis;
  const KripTop_groups = KripTop_analysis ? KripTop_tiers(KripTop_analysis) : [];
  return <>
    <KripTop_Card><View style={KripTop_styles.row}><View style={{ gap: 6, flex: 1 }}><Text style={KripTop_styles.heading}>Three tiers. One salary structure.</Text><Text style={KripTop_styles.muted}>Explore current monthly salaries using the backend's K-Means calculation.</Text></View><KripTop_Button title="Analyze Salary Structure" icon={RefreshCw} disabled={KripTop_data.KripTop_loading || KripTop_data.KripTop_busy} onPress={() => void KripTop_data.KripTop_refresh()} /></View></KripTop_Card>
    {KripTop_data.KripTop_loading && <KripTop_Loading text="Analyzing salaries…" />}
    {KripTop_data.KripTop_analysisError ? <Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_data.KripTop_analysisError}</Text> : null}
    {!KripTop_analysis && !KripTop_data.KripTop_loading ? <KripTop_Empty text="Salary analysis is unavailable. Use Analyze Salary Structure to retry." /> : null}
    {KripTop_analysis && <>
      <View style={KripTop_styles.grid}>{KripTop_groups.map((KripTop_group, KripTop_index) => <View key={KripTop_group.group} style={{ flexBasis: 240, flexGrow: 1, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: KripTop_theme.line, padding: 23, gap: 15, borderTopWidth: 3, borderTopColor: KripTop_group.color }}>
        <View style={KripTop_styles.row}><Text style={KripTop_styles.eyebrow}>{KripTop_group.group}</Text><Text style={KripTop_styles.badge}>{KripTop_group.percentage.toFixed(1)}%</Text></View><Text style={KripTop_styles.heading}>{['Low Salary Group', 'Medium Salary Group', 'High Salary Group'][KripTop_index]}</Text><Text style={{ fontSize: 28, fontWeight: '700', color: KripTop_theme.ink }}>{KripTop_group.count ? KripTop_money(KripTop_group.centroid) : '—'}</Text><Text style={KripTop_styles.muted}>{KripTop_group.count} employees · {KripTop_group.count ? 'average / month' : 'empty tier'}</Text><Text style={KripTop_styles.muted}>Monthly payroll: {KripTop_money(KripTop_group.payroll)}</Text>
      </View>)}</View>
      {KripTop_groups.filter(KripTop_group => KripTop_group.count).length < 3 && <Text style={KripTop_styles.muted}>Only {KripTop_groups.filter(KripTop_group => KripTop_group.count).length} of 3 tiers contain employees in this snapshot. Duplicate salaries or small teams can leave tiers empty.</Text>}
      <KripTop_ClusterPlot analysis={KripTop_analysis} />
      <View style={KripTop_styles.grid}><View style={KripTop_styles.column}><KripTop_BarChart title="Average salary by cluster" subtitle="Calculated centroid for each occupied tier." money data={KripTop_groups.map(KripTop_group => ({ label: KripTop_group.group, value: KripTop_group.count ? KripTop_group.centroid : 0, color: KripTop_group.color, empty: KripTop_group.count === 0 }))} axis="Salary tier · Average monthly salary (THB)" /></View><View style={KripTop_styles.column}><KripTop_Donut title="Employee distribution by cluster" subtitle="Employee share across the calculated salary tiers." data={KripTop_groups.map(KripTop_group => ({ label: KripTop_group.group, value: KripTop_group.count, color: KripTop_group.color }))} /></View></View>
      <KripTop_ClusterPlot analysis={KripTop_analysis} profile />
      <KripTop_Insights employees={KripTop_analysis.employees} analysis={KripTop_analysis} />
    </>}
  </>;
}

export function KripTop_Reports({ data: KripTop_data, onExport: KripTop_onExport }: { data: KripTop_HR; onExport: () => void }) {
  const KripTop_metrics = KripTop_summary(KripTop_data.KripTop_employees);
  const KripTop_groups = KripTop_data.KripTop_analysis ? KripTop_tiers(KripTop_data.KripTop_analysis) : [];
  return <>
    <KripTop_Card><View style={KripTop_styles.row}><View style={{ gap: 7, flex: 1 }}><Text style={KripTop_styles.heading}>Workforce & payroll report</Text><Text style={KripTop_styles.muted}>An executive summary of current employees, base salaries and calculated salary tiers.</Text></View><KripTop_Button title="Export CSV" icon={Download} disabled={KripTop_data.KripTop_loading || KripTop_data.KripTop_busy} onPress={KripTop_onExport} /></View></KripTop_Card>
    <View style={KripTop_styles.grid}><View style={KripTop_styles.column}><KripTop_Card title="Employee summary">{[['Total employees', KripTop_metrics.total], ['Active employees', KripTop_metrics.active], ['On leave employees', KripTop_metrics.leave], ['On leave proportion', `${KripTop_percent(KripTop_metrics.leave, KripTop_metrics.total).toFixed(1)}%`]].map(([KripTop_label, KripTop_value]) => <View key={KripTop_label} style={KripTop_styles.row}><Text style={KripTop_styles.muted}>{KripTop_label}</Text><Text style={{ fontWeight: '700', color: KripTop_theme.ink }}>{KripTop_value}</Text></View>)}</KripTop_Card></View><View style={KripTop_styles.column}><KripTop_Card title="Payroll summary">{[['Total monthly payroll', KripTop_money(KripTop_metrics.payroll)], ['Average monthly salary', KripTop_metrics.total ? KripTop_money(KripTop_metrics.average) : '—'], ['Highest salary', KripTop_metrics.highest !== null ? KripTop_money(KripTop_metrics.highest) : '—'], ['Lowest salary', KripTop_metrics.lowest !== null ? KripTop_money(KripTop_metrics.lowest) : '—']].map(([KripTop_label, KripTop_value]) => <View key={KripTop_label} style={KripTop_styles.row}><Text style={KripTop_styles.muted}>{KripTop_label}</Text><Text style={{ fontWeight: '700', color: KripTop_theme.ink }}>{KripTop_value}</Text></View>)}</KripTop_Card></View></View>
    <KripTop_Card title="Salary cluster summary" subtitle="Monthly base salary figures. Empty tiers have no assigned average.">{!KripTop_groups.length ? <KripTop_Empty text="Refresh analysis to include the salary cluster summary." /> : <ScrollView horizontal><View style={{ minWidth: 650, flexGrow: 1 }}><View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: KripTop_theme.line }}>{['Salary tier', 'Employees', 'Average salary', 'Monthly payroll', 'Payroll share'].map(KripTop_label => <Text key={KripTop_label} style={[KripTop_styles.muted, { flex: 1, fontWeight: '700', minWidth: 125 }]}>{KripTop_label}</Text>)}</View>{KripTop_groups.map(KripTop_group => <View key={KripTop_group.group} style={{ flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderColor: '#f0f3ed' }}>{[KripTop_group.group, KripTop_group.count, KripTop_group.count ? KripTop_money(KripTop_group.centroid) : '—', KripTop_money(KripTop_group.payroll), `${KripTop_percent(KripTop_group.payroll, KripTop_metrics.payroll).toFixed(1)}%`].map((KripTop_value, KripTop_index) => <Text key={KripTop_index} style={{ flex: 1, minWidth: 125, fontSize: 12, color: KripTop_theme.ink, fontWeight: KripTop_index === 0 ? '700' : '400' }}>{KripTop_value}</Text>)}</View>)}</View></ScrollView>}</KripTop_Card>
    <KripTop_Insights employees={KripTop_data.KripTop_employees} analysis={KripTop_data.KripTop_analysis} />
  </>;
}
