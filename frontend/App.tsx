import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { KripTop_API_BASE_URL, KripTop_request, type KripTop_Employee, type KripTop_Cluster } from './src/api';

const KripTop_money = (KripTop_value: number) => `฿${KripTop_value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const KripTop_message = (KripTop_error: unknown) => KripTop_error instanceof Error ? KripTop_error.message : 'Something went wrong. Please retry.';
function KripTop_alert(KripTop_title: string, KripTop_text: string) {
  if (Platform.OS === 'web') window.alert(`${KripTop_title}\n${KripTop_text}`);
  else Alert.alert(KripTop_title, KripTop_text);
}
function KripTop_Button({ title: KripTop_title, onPress: KripTop_onPress, disabled: KripTop_disabled = false, secondary: KripTop_secondary = false, danger: KripTop_danger = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={KripTop_title} disabled={KripTop_disabled} onPress={KripTop_onPress} style={({ pressed: KripTop_pressed }) => [KripTop_styles.button, KripTop_secondary && KripTop_styles.secondary, KripTop_danger && KripTop_styles.danger, (KripTop_disabled || KripTop_pressed) && { opacity: 0.55 }]}>
    <Text style={[KripTop_styles.buttonText, KripTop_secondary && { color: '#244c48' }, KripTop_danger && { color: '#b23b3b' }]}>{KripTop_title}</Text>
  </Pressable>;
}
function KripTop_Field({ label: KripTop_label, ...KripTop_props }: React.ComponentProps<typeof TextInput> & { label: string }) {
  return <View style={KripTop_styles.field}><Text style={KripTop_styles.label}>{KripTop_label}</Text><TextInput accessibilityLabel={KripTop_label} placeholderTextColor="#8a9693" style={KripTop_styles.input} {...KripTop_props} /></View>;
}

export default function KripTop_App() {
  const [KripTop_token, KripTop_setToken] = useState<string | null>(null);
  const [KripTop_username, KripTop_setUsername] = useState('');
  const [KripTop_password, KripTop_setPassword] = useState('');
  const [KripTop_employees, KripTop_setEmployees] = useState<KripTop_Employee[]>([]);
  const [KripTop_clusters, KripTop_setClusters] = useState<KripTop_Cluster[] | null>(null);
  const [KripTop_name, KripTop_setName] = useState('');
  const [KripTop_position, KripTop_setPosition] = useState('');
  const [KripTop_salary, KripTop_setSalary] = useState('');
  const [KripTop_busy, KripTop_setBusy] = useState(false);
  const [KripTop_loading, KripTop_setLoading] = useState(false);
  const [KripTop_analyzing, KripTop_setAnalyzing] = useState(false);
  const [KripTop_error, KripTop_setError] = useState('');
  const [KripTop_analysisError, KripTop_setAnalysisError] = useState('');
  const [KripTop_notice, KripTop_setNotice] = useState('');

  async function KripTop_load() {
    KripTop_setLoading(true); KripTop_setError('');
    try { KripTop_setEmployees(await KripTop_request<KripTop_Employee[]>('/api/employees', KripTop_token)); }
    catch (KripTop_caught) { KripTop_setError(KripTop_message(KripTop_caught)); }
    finally { KripTop_setLoading(false); }
  }
  useEffect(() => { if (KripTop_token) void KripTop_load(); }, [KripTop_token]);

  async function KripTop_login() {
    if (!KripTop_username.trim() || !KripTop_password) { KripTop_alert('Missing credentials', 'Enter your username and password.'); return; }
    KripTop_setBusy(true); KripTop_setError('');
    try {
      const KripTop_result = await KripTop_request<{ success: boolean; token: string }>('/api/login', null, { method: 'POST', body: JSON.stringify({ username: KripTop_username.trim(), password: KripTop_password }) });
      KripTop_setToken(KripTop_result.token); KripTop_setPassword('');
    } catch (KripTop_caught) { KripTop_setError(KripTop_message(KripTop_caught)); KripTop_alert('Login failed', KripTop_message(KripTop_caught)); }
    finally { KripTop_setBusy(false); }
  }

  async function KripTop_mutate(KripTop_path: string, KripTop_method: string, KripTop_body?: object) {
    KripTop_setBusy(true); KripTop_setError(''); KripTop_setNotice('');
    try {
      await KripTop_request(KripTop_path, KripTop_token, { method: KripTop_method, ...(KripTop_body ? { body: JSON.stringify(KripTop_body) } : {}) });
      KripTop_setClusters(null); KripTop_setAnalysisError('');
      if (KripTop_method === 'POST') { KripTop_setName(''); KripTop_setPosition(''); KripTop_setSalary(''); }
      KripTop_setNotice(KripTop_method === 'POST' ? 'Employee added.' : KripTop_method === 'DELETE' ? 'Employee deleted.' : 'Status updated.');
      await KripTop_load();
    } catch (KripTop_caught) { KripTop_setError(KripTop_message(KripTop_caught)); }
    finally { KripTop_setBusy(false); }
  }
  function KripTop_add() {
    const KripTop_amount = Number(KripTop_salary);
    if (!KripTop_name.trim() || !KripTop_position.trim() || !KripTop_salary.trim() || !Number.isFinite(KripTop_amount) || KripTop_amount <= 0 || KripTop_amount > Number.MAX_SAFE_INTEGER) {
      KripTop_alert('Check employee details', 'Enter a name, position and a positive numeric salary.'); return;
    }
    void KripTop_mutate('/api/employees', 'POST', { name: KripTop_name.trim(), position: KripTop_position.trim(), salary: KripTop_amount });
  }
  function KripTop_delete(KripTop_employee: KripTop_Employee) {
    const KripTop_confirm = () => void KripTop_mutate(`/api/employees/${encodeURIComponent(KripTop_employee.id)}`, 'DELETE');
    if (Platform.OS === 'web') { if (window.confirm(`Are you sure? Delete ${KripTop_employee.name}?`)) KripTop_confirm(); }
    else Alert.alert('Are you sure?', `Delete ${KripTop_employee.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: KripTop_confirm }]);
  }
  async function KripTop_analyze() {
    KripTop_setAnalyzing(true); KripTop_setAnalysisError(''); KripTop_setClusters(null);
    try { KripTop_setClusters((await KripTop_request<{ success: boolean; clusters: KripTop_Cluster[] }>('/api/employees/salary-clusters', KripTop_token)).clusters); }
    catch (KripTop_caught) { KripTop_setAnalysisError(KripTop_message(KripTop_caught)); }
    finally { KripTop_setAnalyzing(false); }
  }
  const KripTop_disabled = KripTop_busy || KripTop_loading || KripTop_analyzing;
  return <SafeAreaView style={KripTop_styles.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={KripTop_styles.page}>
    <View style={KripTop_styles.brandRow}><View style={KripTop_styles.logo}><Text style={KripTop_styles.logoText}>K</Text></View><View><Text style={KripTop_styles.brand}>KripTop / people</Text><Text style={KripTop_styles.muted}>HR MANAGER & SALARY ANALYTICS</Text></View></View>
    {!KripTop_token ? <View style={KripTop_styles.login}>
      <Text style={KripTop_styles.eyebrow}>YOUR TEAM, IN FOCUS</Text><Text style={KripTop_styles.title}>Good work starts{ '\n' }with your people.</Text><Text style={KripTop_styles.subtitle}>Sign in to manage your team and understand your salary structure.</Text>
      <View style={KripTop_styles.card}><Text style={KripTop_styles.heading}>Welcome back</Text><KripTop_Field label="Username" value={KripTop_username} onChangeText={KripTop_setUsername} autoCapitalize="none" autoCorrect={false} /><KripTop_Field label="Password" value={KripTop_password} onChangeText={KripTop_setPassword} secureTextEntry onSubmitEditing={() => void KripTop_login()} />
        {KripTop_error ? <Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_error}</Text> : null}
        <KripTop_Button title={KripTop_busy ? 'Signing in…' : 'Sign in'} disabled={KripTop_busy} onPress={() => void KripTop_login()} />{KripTop_busy && <ActivityIndicator color="#176859" />}
      </View><Text style={KripTop_styles.muted}>Exam demo · admin / password123</Text><Text selectable style={KripTop_styles.muted}>API: {KripTop_API_BASE_URL}</Text>
    </View> : <>
      <View style={KripTop_styles.sectionRow}><View><Text style={KripTop_styles.eyebrow}>PEOPLE OPERATIONS</Text><Text style={KripTop_styles.title}>Team overview</Text><Text style={KripTop_styles.subtitle}>A clear view of your people and payroll.</Text></View><KripTop_Button title="Sign out" secondary disabled={KripTop_disabled} onPress={() => { KripTop_setToken(null); KripTop_setEmployees([]); KripTop_setClusters(null); KripTop_setError(''); KripTop_setNotice(''); KripTop_setAnalysisError(''); KripTop_setName(''); KripTop_setPosition(''); KripTop_setSalary(''); }} /></View>
      <View style={KripTop_styles.grid}>{[['Total employees', String(KripTop_employees.length)], ['Active now', String(KripTop_employees.filter(KripTop_item => KripTop_item.status === 'Active').length)], ['Monthly payroll', KripTop_money(KripTop_employees.reduce((KripTop_total, KripTop_item) => KripTop_total + KripTop_item.salary, 0))]].map(([KripTop_label, KripTop_value]) => <View key={KripTop_label} style={KripTop_styles.stat}><Text style={KripTop_styles.muted}>{KripTop_label}</Text><Text style={KripTop_styles.statValue}>{KripTop_value}</Text></View>)}</View>
      {KripTop_error ? <View style={KripTop_styles.errorBox}><Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_error}</Text><KripTop_Button title="Retry employee list" secondary disabled={KripTop_disabled} onPress={() => void KripTop_load()} /></View> : null}
      {KripTop_notice ? <Text accessibilityLiveRegion="polite" style={KripTop_styles.notice}>{KripTop_notice}</Text> : null}
      <View style={KripTop_styles.card}><Text style={KripTop_styles.heading}>Add a team member</Text><Text style={KripTop_styles.muted}>New employees start with Active status.</Text><View style={KripTop_styles.grid}><KripTop_Field label="Full name" placeholder="e.g. Alex Morgan" value={KripTop_name} onChangeText={KripTop_setName} /><KripTop_Field label="Position" placeholder="e.g. Product Designer" value={KripTop_position} onChangeText={KripTop_setPosition} /><KripTop_Field label="Monthly salary (THB)" placeholder="45000" value={KripTop_salary} onChangeText={KripTop_setSalary} keyboardType="decimal-pad" /></View><KripTop_Button title={KripTop_busy ? 'Saving…' : 'Add Employee'} disabled={KripTop_disabled} onPress={KripTop_add} /></View>
      <View style={KripTop_styles.analytics}><View style={KripTop_styles.sectionRow}><View style={{ flex: 1 }}><Text style={KripTop_styles.eyebrow}>SALARY INTELLIGENCE</Text><Text style={KripTop_styles.heading}>Understand your salary structure</Text><Text style={KripTop_styles.muted}>K-Means groups current salaries into three tiers.</Text></View><KripTop_Button title="Analyze Salary Structure" disabled={KripTop_disabled} onPress={() => void KripTop_analyze()} /></View>
        {KripTop_analyzing && <ActivityIndicator accessibilityLabel="Analyzing salaries" color="#176859" />}{KripTop_analysisError ? <Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_analysisError}</Text> : null}
        {KripTop_clusters ? <View style={KripTop_styles.grid}>{KripTop_clusters.map(KripTop_cluster => <View key={KripTop_cluster.group} style={KripTop_styles.stat}><Text style={KripTop_styles.eyebrow}>{KripTop_cluster.group}</Text><Text style={KripTop_styles.statValue}>{KripTop_cluster.count ? KripTop_money(KripTop_cluster.centroid) : '—'}</Text><Text style={KripTop_styles.muted}>{KripTop_cluster.count} employees · {KripTop_cluster.count ? 'average / month' : 'no assigned salaries'}</Text></View>)}</View> : !KripTop_analyzing && <Text style={KripTop_styles.muted}>Run an analysis to see your salary tiers. Results clear when employee data changes.</Text>}
      </View>
      <View style={KripTop_styles.sectionRow}><Text style={KripTop_styles.heading}>Employee directory</Text><KripTop_Button title="Refresh" secondary disabled={KripTop_disabled} onPress={() => { KripTop_setClusters(null); void KripTop_load(); }} /></View>
      {KripTop_loading && <ActivityIndicator accessibilityLabel="Loading employees" color="#176859" />}
      {!KripTop_loading && !KripTop_error && !KripTop_employees.length && <Text style={KripTop_styles.muted}>No employees yet. Add your first team member above.</Text>}
      {KripTop_employees.map(KripTop_employee => <View key={KripTop_employee.id} style={KripTop_styles.employee}><View style={KripTop_styles.sectionRow}><View style={{ flex: 1 }}><Text style={KripTop_styles.employeeName}>{KripTop_employee.name}</Text><Text style={KripTop_styles.muted}>{KripTop_employee.position}</Text></View><Text style={[KripTop_styles.badge, KripTop_employee.status === 'On Leave' && KripTop_styles.leave]}>{KripTop_employee.status}</Text></View><Text style={KripTop_styles.salary}>{KripTop_money(KripTop_employee.salary)} <Text style={KripTop_styles.muted}>/ month</Text></Text><View style={KripTop_styles.actions}><KripTop_Button title="Toggle Status" secondary disabled={KripTop_disabled} onPress={() => void KripTop_mutate(`/api/employees/${encodeURIComponent(KripTop_employee.id)}/status`, 'PUT')} /><KripTop_Button title="Delete" danger disabled={KripTop_disabled} onPress={() => KripTop_delete(KripTop_employee)} /></View></View>)}
      <Text style={KripTop_styles.footer}>KripTop HR · Student 6730202025 · In-memory exam demo</Text>
    </>}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const KripTop_styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f6f3' }, page: { padding: 24, paddingTop: 40, gap: 22, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }, logo: { backgroundColor: '#176859', borderRadius: 14, paddingHorizontal: 17, paddingVertical: 9 }, logoText: { color: 'white', fontSize: 26, fontWeight: '800' }, brand: { color: '#193e36', fontSize: 20, fontWeight: '700' },
  login: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: 22, paddingTop: 20 }, eyebrow: { color: '#417e68', fontSize: 11, fontWeight: '800', letterSpacing: 1.7 }, title: { color: '#193e36', fontSize: 34, fontWeight: '800', marginVertical: 8, lineHeight: 41 }, subtitle: { color: '#677a73', fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: '#e1e9e3' }, heading: { fontSize: 21, fontWeight: '700', color: '#193e36' }, muted: { fontSize: 12, color: '#697c74', lineHeight: 20 },
  field: { gap: 8, flexGrow: 1, minWidth: 180 }, label: { fontSize: 13, fontWeight: '600', color: '#3f554c' }, input: { borderWidth: 1, borderColor: '#d8e2dc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#193e36', backgroundColor: '#fcfdfb' },
  button: { backgroundColor: '#176859', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: 'white', fontWeight: '700', fontSize: 13 }, secondary: { backgroundColor: '#e9f0ea' }, danger: { backgroundColor: '#fff0ed' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, stat: { backgroundColor: '#fff', borderRadius: 14, padding: 20, flexGrow: 1, flexBasis: 220, gap: 8, borderWidth: 1, borderColor: '#e1e9e3' }, statValue: { fontSize: 28, color: '#193e36', fontWeight: '700' },
  analytics: { backgroundColor: '#e8efe6', borderRadius: 20, padding: 24, gap: 20 }, employee: { backgroundColor: '#fff', borderRadius: 16, padding: 22, gap: 14, borderWidth: 1, borderColor: '#e1e9e3' }, employeeName: { fontSize: 18, fontWeight: '700', color: '#193e36' }, badge: { backgroundColor: '#e3f4e8', color: '#277349', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, fontWeight: '700' }, leave: { backgroundColor: '#fff2d9', color: '#936515' }, salary: { fontSize: 22, fontWeight: '600', color: '#244c48' }, actions: { flexDirection: 'row', gap: 10 },
  error: { color: '#b23b3b', lineHeight: 22 }, errorBox: { backgroundColor: '#fff0ed', borderRadius: 12, padding: 16, gap: 10 }, notice: { color: '#277349' }, footer: { color: '#829187', fontSize: 12, textAlign: 'center', paddingVertical: 20 },
});
