import React, { useMemo, useState } from 'react';
import { Alert, Platform, Text, View, useWindowDimensions } from 'react-native';
import { Plus, Search, Pencil, Trash2, ArrowLeftRight, X } from 'lucide-react-native';
import { KripTop_Button, KripTop_Card, KripTop_Empty, KripTop_Field, KripTop_alert, KripTop_styles, KripTop_theme } from './ui';
import { KripTop_money } from './analytics';
import type { KripTop_Employee } from './api';
import type { KripTop_HR } from './useHR';

export function KripTop_Employees({ data: KripTop_data }: { data: KripTop_HR }) {
  const [KripTop_name, KripTop_setName] = useState(''); const [KripTop_position, KripTop_setPosition] = useState(''); const [KripTop_salary, KripTop_setSalary] = useState('');
  const [KripTop_editing, KripTop_setEditing] = useState<string | null>(null);
  const [KripTop_search, KripTop_setSearch] = useState('');
  const [KripTop_status, KripTop_setStatus] = useState('All');
  const [KripTop_sort, KripTop_setSort] = useState('Default order');
  const { width: KripTop_width } = useWindowDimensions();
  const KripTop_disabled = KripTop_data.KripTop_busy || KripTop_data.KripTop_loading;
  const KripTop_visible = useMemo(() => {
    const KripTop_query = KripTop_search.trim().toLocaleLowerCase();
    const KripTop_result = KripTop_data.KripTop_employees.filter(KripTop_employee => (KripTop_status === 'All' || KripTop_employee.status === KripTop_status) && `${KripTop_employee.name} ${KripTop_employee.position}`.toLocaleLowerCase().includes(KripTop_query));
    return KripTop_sort === 'Default order' ? KripTop_result : KripTop_result.sort((KripTop_a, KripTop_b) => KripTop_sort === 'Salary ascending' ? KripTop_a.salary - KripTop_b.salary : KripTop_b.salary - KripTop_a.salary);
  }, [KripTop_data.KripTop_employees, KripTop_search, KripTop_status, KripTop_sort]);
  function KripTop_reset() { KripTop_setName(''); KripTop_setPosition(''); KripTop_setSalary(''); KripTop_setEditing(null); }
  async function KripTop_save() {
    const KripTop_amount = Number(KripTop_salary);
    if (!KripTop_name.trim() || Array.from(KripTop_name.trim()).length > 100 || !KripTop_position.trim() || Array.from(KripTop_position.trim()).length > 100 || !KripTop_salary.trim() || !Number.isFinite(KripTop_amount) || KripTop_amount < 0.01 || KripTop_amount > 9999999999.99 || Math.abs(KripTop_amount - Number(KripTop_amount.toFixed(2))) > Number.EPSILON * Math.max(1, KripTop_amount) * 2) { KripTop_alert('Check employee details', 'Enter a name and position (up to 100 characters each) and a salary from 0.01 to 9,999,999,999.99 with at most two decimal places.'); return; }
    const KripTop_ok = await KripTop_data.KripTop_mutate(KripTop_editing ? `/api/employees/${encodeURIComponent(KripTop_editing)}` : '/api/employees', KripTop_editing ? 'PUT' : 'POST', { name: KripTop_name.trim(), position: KripTop_position.trim(), salary: KripTop_amount }, KripTop_editing ? 'Employee details saved.' : 'Employee added.');
    if (KripTop_ok) KripTop_reset();
  }
  function KripTop_edit(KripTop_employee: KripTop_Employee) { KripTop_setEditing(KripTop_employee.id); KripTop_setName(KripTop_employee.name); KripTop_setPosition(KripTop_employee.position); KripTop_setSalary(String(KripTop_employee.salary)); }
  function KripTop_delete(KripTop_employee: KripTop_Employee) {
    const KripTop_confirm = () => void KripTop_data.KripTop_mutate(`/api/employees/${encodeURIComponent(KripTop_employee.id)}`, 'DELETE', undefined, 'Employee deleted.').then(KripTop_ok => { if (KripTop_ok && KripTop_editing === KripTop_employee.id) KripTop_reset(); });
    if (Platform.OS === 'web') { if (window.confirm(`Are you sure? Delete ${KripTop_employee.name}?`)) KripTop_confirm(); }
    else Alert.alert('Are you sure?', `Delete ${KripTop_employee.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: KripTop_confirm }]);
  }
  return <>
    <KripTop_Card title={KripTop_editing ? 'Edit employee' : 'Add a team member'} subtitle={KripTop_editing ? 'Update details and salary. The current status will be preserved.' : 'New team members start with Active status.'}>
      <View style={KripTop_styles.grid}><KripTop_Field label="Full name" value={KripTop_name} onChangeText={KripTop_setName} placeholder="e.g. Alex Morgan" /><KripTop_Field label="Position" value={KripTop_position} onChangeText={KripTop_setPosition} placeholder="e.g. Product Designer" /><KripTop_Field label="Monthly salary (THB)" value={KripTop_salary} onChangeText={KripTop_setSalary} placeholder="45000" keyboardType="decimal-pad" /></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}><KripTop_Button title={KripTop_data.KripTop_busy ? 'Saving…' : KripTop_editing ? 'Save changes' : 'Add Employee'} icon={KripTop_editing ? Pencil : Plus} disabled={KripTop_disabled} onPress={() => void KripTop_save()} />{KripTop_editing && <KripTop_Button title="Cancel edit" icon={X} variant="secondary" disabled={KripTop_disabled} onPress={KripTop_reset} />}</View>
    </KripTop_Card>
    <KripTop_Card title="Employee directory" subtitle={`Showing ${KripTop_visible.length} of ${KripTop_data.KripTop_employees.length} employees`}>
      <View style={KripTop_styles.grid}><View style={{ flexGrow: 1, flexBasis: 220 }}><KripTop_Field label="Search employees" placeholder="Search by name or position" value={KripTop_search} onChangeText={KripTop_setSearch} /></View><View style={{ gap: 8, justifyContent: 'flex-end' }}><Text style={KripTop_styles.label}>Status filter</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{['All', 'Active', 'On Leave'].map(KripTop_value => <KripTop_Button key={KripTop_value} title={`Filter: ${KripTop_value}`} variant={KripTop_status === KripTop_value ? 'primary' : 'secondary'} onPress={() => KripTop_setStatus(KripTop_value)} />)}</View></View></View>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>{['Default order', 'Salary ascending', 'Salary descending'].map(KripTop_value => <KripTop_Button key={KripTop_value} title={KripTop_value} variant={KripTop_sort === KripTop_value ? 'secondary' : 'ghost'} onPress={() => KripTop_setSort(KripTop_value)} />)}</View>
      {!KripTop_visible.length && <KripTop_Empty text={KripTop_data.KripTop_employees.length ? 'No employees match these filters.' : 'No employees yet. Add your first team member above.'} />}
      {KripTop_visible.map(KripTop_employee => <View key={KripTop_employee.id} testID={`employee-${KripTop_employee.id}`} style={{ paddingVertical: 17, borderTopWidth: 1, borderColor: '#edf1eb', gap: 14 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}><View style={{ flexDirection: 'row', gap: 13, alignItems: 'center', flex: 1, minWidth: 180 }}><View style={{ backgroundColor: '#edf4e8', width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#548363', fontWeight: '700', fontSize: 12 }}>{KripTop_employee.name.split(/\s+/).slice(0, 2).map(KripTop_part => KripTop_part[0]).join('').toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={{ color: KripTop_theme.ink, fontWeight: '700', fontSize: 14 }}>{KripTop_employee.name}</Text><Text style={KripTop_styles.muted}>{KripTop_employee.position}</Text></View></View><Text style={[KripTop_styles.badge, KripTop_employee.status === 'On Leave' && { color: '#9b7b37', backgroundColor: '#fbf4e3' }]}>{KripTop_employee.status}</Text><Text style={{ color: KripTop_theme.ink, fontSize: 17, fontWeight: '700', minWidth: KripTop_width > 900 ? 130 : undefined }}>{KripTop_money(KripTop_employee.salary)} <Text style={KripTop_styles.muted}>/ mo</Text></Text></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: KripTop_width > 900 ? 'flex-end' : 'flex-start' }}><KripTop_Button title="Edit" icon={Pencil} variant="ghost" disabled={KripTop_disabled} onPress={() => KripTop_edit(KripTop_employee)} /><KripTop_Button title="Toggle Status" icon={ArrowLeftRight} variant="secondary" disabled={KripTop_disabled} onPress={() => void KripTop_data.KripTop_mutate(`/api/employees/${encodeURIComponent(KripTop_employee.id)}/status`, 'PUT', undefined, 'Employee status updated.')} /><KripTop_Button title="Delete" icon={Trash2} variant="danger" disabled={KripTop_disabled} onPress={() => KripTop_delete(KripTop_employee)} /></View>
      </View>)}
    </KripTop_Card>
  </>;
}
