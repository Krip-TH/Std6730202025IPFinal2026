import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Line, Circle, Path, G, Text as KripTop_SvgText } from 'react-native-svg';
import { scaleBand as KripTop_scaleBand, scaleLinear as KripTop_scaleLinear } from 'd3-scale';
import { arc as KripTop_arc, pie as KripTop_pie, line as KripTop_line } from 'd3-shape';
import { KripTop_Card, KripTop_Empty, KripTop_styles, KripTop_theme } from './ui';
import { KripTop_compact, KripTop_money, KripTop_percent, KripTop_tiers } from './analytics';
import type { KripTop_Analysis } from './api';

export type KripTop_Datum = { label: string; value: number; color: string; empty?: boolean };
type KripTop_SalaryPoint = { id: string; salary: number; group: string; index: number };
function KripTop_PointTarget({ point: KripTop_point, left: KripTop_left, top: KripTop_top, selected: KripTop_selected, onSelect: KripTop_onSelect }: { point: KripTop_SalaryPoint; left: number; top: number; selected: boolean; onSelect: (KripTop_point: KripTop_SalaryPoint) => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${KripTop_point.group}: ${KripTop_money(KripTop_point.salary)}`} onPress={() => KripTop_onSelect(KripTop_point)} hitSlop={7} style={{ position: 'absolute', left: KripTop_left - 9, top: KripTop_top - 9, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: KripTop_selected ? '#345e44' : 'transparent' }} />;
}
function KripTop_datumLabel(KripTop_datum: KripTop_Datum, KripTop_currency: boolean, KripTop_short = false) {
  if (KripTop_datum.empty) return '—';
  if (KripTop_currency) return KripTop_short ? `฿${KripTop_compact(KripTop_datum.value)}` : KripTop_money(KripTop_datum.value);
  return KripTop_datum.value.toLocaleString();
}
function KripTop_ChartFrame({ children: KripTop_children, height: KripTop_height = 240 }: { children: (KripTop_width: number, KripTop_height: number) => React.ReactNode; height?: number }) {
  const [KripTop_width, KripTop_setWidth] = useState(320);
  return <View style={{ width: '100%', minWidth: 0 }} onLayout={KripTop_event => { const KripTop_next = Math.max(240, KripTop_event.nativeEvent.layout.width); if (Math.abs(KripTop_next - KripTop_width) > 1) KripTop_setWidth(KripTop_next); }}>{KripTop_children(KripTop_width, KripTop_height)}</View>;
}
function KripTop_Legend({ data: KripTop_data, money: KripTop_isMoney = false }: { data: KripTop_Datum[]; money?: boolean }) {
  return <View style={{ gap: 10 }}>{KripTop_data.map(KripTop_item => <View key={KripTop_item.label} style={[KripTop_styles.row, { flexWrap: 'nowrap', gap: 10 }]}><View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: KripTop_item.color }} /><Text style={[KripTop_styles.muted, { flex: 1 }]}>{KripTop_item.label}</Text><Text style={{ fontSize: 12, fontWeight: '700', color: KripTop_theme.ink }}>{KripTop_datumLabel(KripTop_item, KripTop_isMoney)}</Text></View>)}</View>;
}
export function KripTop_BarChart({ title: KripTop_title, subtitle: KripTop_subtitle, data: KripTop_data, money: KripTop_isMoney = false, axis: KripTop_axis = '' }: { title: string; subtitle: string; data: KripTop_Datum[]; money?: boolean; axis?: string }) {
  const KripTop_max = Math.max(0, ...KripTop_data.map(KripTop_item => KripTop_item.value));
  return <KripTop_Card title={KripTop_title} subtitle={KripTop_subtitle}>{!KripTop_max ? <KripTop_Empty text="No values to chart in this snapshot." /> : <>
    <KripTop_ChartFrame>{(KripTop_width, KripTop_height) => {
      const KripTop_left = KripTop_isMoney ? 64 : 35; const KripTop_bottom = KripTop_height - 42;
      const KripTop_x = KripTop_scaleBand<string>().domain(KripTop_data.map(KripTop_item => KripTop_item.label)).range([KripTop_left, KripTop_width - 8]).padding(0.48);
      const KripTop_y = KripTop_scaleLinear().domain([0, KripTop_max]).nice(4).range([KripTop_bottom, 20]);
      return <Svg width="100%" height={KripTop_height} viewBox={`0 0 ${KripTop_width} ${KripTop_height}`} accessibilityLabel={`${KripTop_title}: ${KripTop_data.map(KripTop_item => `${KripTop_item.label} ${KripTop_datumLabel(KripTop_item, KripTop_isMoney)}`).join('; ')}`}>
        {KripTop_y.ticks(4).filter(KripTop_tick => KripTop_isMoney || Number.isInteger(KripTop_tick)).map(KripTop_tick => <G key={KripTop_tick}><Line x1={KripTop_left} y1={KripTop_y(KripTop_tick)} x2={KripTop_width - 8} y2={KripTop_y(KripTop_tick)} stroke="#edf1ec" strokeDasharray="3 4" /><KripTop_SvgText x={KripTop_left - 8} y={KripTop_y(KripTop_tick) + 4} textAnchor="end" fill="#839187" fontSize={10}>{KripTop_isMoney ? `฿${KripTop_compact(KripTop_tick)}` : KripTop_tick}</KripTop_SvgText></G>)}
        {KripTop_data.map(KripTop_item => <G key={KripTop_item.label}><Rect x={KripTop_x(KripTop_item.label)} y={KripTop_y(KripTop_item.value)} width={KripTop_x.bandwidth()} height={Math.max(0, KripTop_bottom - KripTop_y(KripTop_item.value))} fill={KripTop_item.color} rx={4} /><KripTop_SvgText x={(KripTop_x(KripTop_item.label) || 0) + KripTop_x.bandwidth() / 2} y={KripTop_y(KripTop_item.value) - 8} textAnchor="middle" fontSize={10} fill={KripTop_theme.ink}>{KripTop_datumLabel(KripTop_item, KripTop_isMoney, true)}</KripTop_SvgText><KripTop_SvgText x={(KripTop_x(KripTop_item.label) || 0) + KripTop_x.bandwidth() / 2} y={KripTop_bottom + 20} textAnchor="middle" fontSize={10} fill="#76877e">{KripTop_item.label}</KripTop_SvgText></G>)}
      </Svg>;
    }}</KripTop_ChartFrame>{KripTop_axis ? <Text style={[KripTop_styles.muted, { textAlign: 'center', fontSize: 10 }]}>{KripTop_axis}</Text> : null}
  </>}</KripTop_Card>;
}
export function KripTop_Donut({ title: KripTop_title, subtitle: KripTop_subtitle, data: KripTop_data, money: KripTop_isMoney = false, centerLabel: KripTop_centerLabel = 'employees' }: { title: string; subtitle: string; data: KripTop_Datum[]; money?: boolean; centerLabel?: string }) {
  const KripTop_total = KripTop_data.reduce((KripTop_sum, KripTop_item) => KripTop_sum + KripTop_item.value, 0);
  const KripTop_arcs = KripTop_pie<KripTop_Datum>().sort(null).value(KripTop_item => KripTop_item.value)(KripTop_data);
  const KripTop_shape = KripTop_arc<(typeof KripTop_arcs)[number]>().innerRadius(60).outerRadius(79).cornerRadius(3).padAngle(0.035);
  return <KripTop_Card title={KripTop_title} subtitle={KripTop_subtitle}>{!KripTop_total ? <KripTop_Empty text="No values to chart in this snapshot." /> : <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
    <Svg width={180} height={180} viewBox="0 0 180 180" accessibilityLabel={`${KripTop_title}: ${KripTop_data.map(KripTop_item => `${KripTop_item.label} ${KripTop_percent(KripTop_item.value, KripTop_total).toFixed(1)}%`).join('; ')}`}><G transform="translate(90,90)">{KripTop_arcs.filter(KripTop_arcItem => KripTop_arcItem.value > 0).map(KripTop_arcItem => <Path key={KripTop_arcItem.data.label} d={KripTop_shape(KripTop_arcItem) || ''} fill={KripTop_arcItem.data.color} />)}</G><KripTop_SvgText x={90} y={88} textAnchor="middle" fontSize={25} fontWeight="700" fill={KripTop_theme.ink}>{KripTop_isMoney ? `฿${KripTop_compact(KripTop_total)}` : KripTop_total}</KripTop_SvgText><KripTop_SvgText x={90} y={108} textAnchor="middle" fill="#829286" fontSize={10}>{KripTop_centerLabel}</KripTop_SvgText></Svg>
    <View style={{ minWidth: 150, flexGrow: 1, gap: 16 }}>{KripTop_data.map(KripTop_item => <View key={KripTop_item.label} style={{ gap: 5 }}><View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}><View style={{ width: 7, height: 7, borderRadius: 3, backgroundColor: KripTop_item.color }} /><Text style={KripTop_styles.muted}>{KripTop_item.label}</Text></View><Text style={{ color: KripTop_theme.ink, fontSize: 16, fontWeight: '700' }}>{KripTop_datumLabel(KripTop_item, KripTop_isMoney)} <Text style={KripTop_styles.muted}> · {KripTop_percent(KripTop_item.value, KripTop_total).toFixed(1)}%</Text></Text></View>)}</View>
  </View>}</KripTop_Card>;
}
export function KripTop_HorizontalBars({ title: KripTop_title, subtitle: KripTop_subtitle, data: KripTop_data }: { title: string; subtitle: string; data: KripTop_Datum[] }) {
  const KripTop_x = KripTop_scaleLinear().domain([0, Math.max(1, ...KripTop_data.map(KripTop_item => KripTop_item.value))]).range([0, 100]);
  return <KripTop_Card title={KripTop_title} subtitle={KripTop_subtitle}>{!KripTop_data.length ? <KripTop_Empty /> : <View style={{ gap: 20 }}>{KripTop_data.map(KripTop_item => <View key={KripTop_item.label} style={{ gap: 8 }}><View style={KripTop_styles.row}><Text style={[KripTop_styles.muted, { flex: 1 }]}>{KripTop_item.label}</Text><Text style={{ fontSize: 12, color: KripTop_theme.ink, fontWeight: '700' }}>{KripTop_money(KripTop_item.value)}</Text></View><View style={{ height: 8, borderRadius: 5, backgroundColor: '#f0f4ee', overflow: 'hidden' }}><View accessibilityLabel={`${KripTop_item.label}: ${KripTop_money(KripTop_item.value)}`} style={{ width: `${KripTop_x(KripTop_item.value)}%`, backgroundColor: KripTop_item.color, height: 8, borderRadius: 5 }} /></View></View>)}</View>}</KripTop_Card>;
}

export function KripTop_ClusterPlot({ analysis: KripTop_analysis, profile: KripTop_profile = false }: { analysis: KripTop_Analysis; profile?: boolean }) {
  const [KripTop_selected, KripTop_setSelected] = useState<{ id: string; salary: number; group: string } | null>(null);
  const KripTop_groups = KripTop_tiers(KripTop_analysis);
  const KripTop_title = KripTop_profile ? 'Sorted salary profiles' : 'K-Means salary scatter';
  return <KripTop_Card title={KripTop_title} subtitle={KripTop_profile ? 'Each series orders current salaries within its tier. This is not a historical trend.' : 'Every dot is an employee; dashed lines mark the calculated tier centroids.'}>
    {!KripTop_analysis.employees.length ? <KripTop_Empty /> : <>
      <KripTop_ChartFrame height={290}>{(KripTop_width, KripTop_height) => {
        const KripTop_left = 60, KripTop_right = KripTop_profile ? 12 : 78, KripTop_bottom = KripTop_height - 40;
        const KripTop_maxX = KripTop_profile ? Math.max(1, ...KripTop_groups.map(KripTop_group => KripTop_group.count)) : KripTop_analysis.employees.length;
        const KripTop_x = KripTop_scaleLinear().domain([0.5, KripTop_maxX + 0.5]).range([KripTop_left, KripTop_width - KripTop_right]);
        const KripTop_maxSalary = Math.max(1, ...KripTop_analysis.employees.map(KripTop_employee => KripTop_employee.salary));
        const KripTop_y = KripTop_scaleLinear().domain([0, KripTop_maxSalary * 1.12]).nice(4).range([KripTop_bottom, 15]);
        const KripTop_lineShape = KripTop_line<{ salary: number; index: number }>().x(KripTop_point => KripTop_x(KripTop_point.index)).y(KripTop_point => KripTop_y(KripTop_point.salary));
        const KripTop_index = new Map(KripTop_analysis.employees.map((KripTop_employee, KripTop_i) => [KripTop_employee.id, KripTop_i + 1]));
        const KripTop_targets: KripTop_SalaryPoint[] = KripTop_groups.flatMap(KripTop_group => [...KripTop_group.members].sort((KripTop_a, KripTop_b) => KripTop_a.salary - KripTop_b.salary).map((KripTop_member, KripTop_i) => ({ ...KripTop_member, index: KripTop_profile ? KripTop_i + 1 : KripTop_index.get(KripTop_member.id)! })));
        return <View style={{ height: KripTop_height, width: '100%' }}><Svg width="100%" height={KripTop_height} viewBox={`0 0 ${KripTop_width} ${KripTop_height}`} accessibilityLabel={KripTop_title}>
          {KripTop_y.ticks(4).map(KripTop_tick => <G key={KripTop_tick}><Line x1={KripTop_left} x2={KripTop_width - KripTop_right} y1={KripTop_y(KripTop_tick)} y2={KripTop_y(KripTop_tick)} stroke="#edf1ec" /><KripTop_SvgText x={KripTop_left - 8} y={KripTop_y(KripTop_tick) + 4} textAnchor="end" fill="#829286" fontSize={10}>฿{KripTop_compact(KripTop_tick)}</KripTop_SvgText></G>)}
          {KripTop_x.ticks(Math.min(5, KripTop_maxX)).filter(Number.isInteger).map(KripTop_tick => <KripTop_SvgText key={KripTop_tick} x={KripTop_x(KripTop_tick)} y={KripTop_bottom + 21} textAnchor="middle" fill="#829286" fontSize={10}>{KripTop_tick}</KripTop_SvgText>)}
          {KripTop_groups.map(KripTop_group => {
            const KripTop_points = [...KripTop_group.members].sort((KripTop_a, KripTop_b) => KripTop_a.salary - KripTop_b.salary).map((KripTop_member, KripTop_i) => ({ ...KripTop_member, index: KripTop_profile ? KripTop_i + 1 : KripTop_index.get(KripTop_member.id)! }));
            return <G key={KripTop_group.group}>{KripTop_profile && KripTop_points.length > 1 && <Path d={KripTop_lineShape(KripTop_points) || ''} stroke={KripTop_group.color} strokeWidth={2.5} fill="none" />}{!KripTop_profile && KripTop_group.count > 0 && <><Line x1={KripTop_left} x2={KripTop_width - KripTop_right} y1={KripTop_y(KripTop_group.centroid)} y2={KripTop_y(KripTop_group.centroid)} stroke={KripTop_group.color} strokeDasharray="4 5" opacity={0.7} /><KripTop_SvgText x={KripTop_width - KripTop_right + 5} y={KripTop_y(KripTop_group.centroid) + 3} fontSize={9} fill={KripTop_group.color}>{KripTop_group.group}: ฿{KripTop_compact(KripTop_group.centroid)}</KripTop_SvgText></>}{KripTop_points.map(KripTop_point => <Circle key={KripTop_point.id} cx={KripTop_x(KripTop_point.index)} cy={KripTop_y(KripTop_point.salary)} r={KripTop_profile ? 4 : 5} fill={KripTop_group.color} stroke="white" strokeWidth={1.5} />)}</G>;
          })}
        </Svg>{KripTop_targets.map(KripTop_point => <KripTop_PointTarget key={KripTop_point.id} point={KripTop_point} left={KripTop_x(KripTop_point.index)} top={KripTop_y(KripTop_point.salary)} selected={KripTop_selected?.id === KripTop_point.id} onSelect={KripTop_setSelected} />)}</View>;
      }}</KripTop_ChartFrame><Text style={[KripTop_styles.muted, { textAlign: 'center', fontSize: 10 }]}>{KripTop_profile ? 'Salary rank within each tier' : 'Employee index (directory order)'} · Monthly salary (THB)</Text>
      <Text style={KripTop_styles.muted}>{KripTop_selected ? `${KripTop_analysis.employees.find(KripTop_employee => KripTop_employee.id === KripTop_selected.id)?.name || 'Employee'} · ${KripTop_selected.group} · ${KripTop_money(KripTop_selected.salary)} / month` : 'Tap a salary point to inspect its employee, tier and exact monthly salary.'}</Text>
      <KripTop_Legend data={KripTop_groups.map(KripTop_group => ({ label: `${KripTop_group.group} · ${KripTop_group.count} employees`, value: KripTop_group.count ? KripTop_group.centroid : 0, color: KripTop_group.color, empty: KripTop_group.count === 0 }))} money />
    </>}
  </KripTop_Card>;
}
