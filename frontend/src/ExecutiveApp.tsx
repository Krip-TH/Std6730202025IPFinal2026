import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart3, ChevronRight, FileText, LayoutDashboard, Leaf, LogOut, Menu, Network, RefreshCw, ShieldCheck, Users, Wallet, X, CheckCircle2 } from 'lucide-react-native';
import { KripTop_request } from './api';
import { KripTop_useHR, KripTop_errorMessage } from './useHR';
import { KripTop_employeeCSV } from './analytics';
import { KripTop_Button, KripTop_Card, KripTop_Field, KripTop_Loading, KripTop_alert, KripTop_styles, KripTop_theme } from './ui';
import { KripTop_Employees } from './Employees';
import { KripTop_ClusterPage, KripTop_Executive, KripTop_Reports, KripTop_SalaryPage } from './pages';

type KripTop_Page = 'Executive Dashboard' | 'Employee Management' | 'Salary Analytics' | 'K-Means Clustering' | 'Reports & Insights';
const KripTop_navigation = [
  { name: 'Executive Dashboard' as const, icon: LayoutDashboard, description: 'Your workforce at a glance' },
  { name: 'Employee Management' as const, icon: Users, description: 'A better everyday view of your team' },
  { name: 'Salary Analytics' as const, icon: Wallet, description: 'Understand the composition of your payroll' },
  { name: 'K-Means Clustering' as const, icon: Network, description: 'Explore the salary tiers within your organization' },
  { name: 'Reports & Insights' as const, icon: FileText, description: 'Turn the current snapshot into a clear report' },
];

function KripTop_Brand({ light: KripTop_light = false }: { light?: boolean }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 35, height: 35, borderRadius: 10, backgroundColor: KripTop_light ? '#335b48' : '#176859', alignItems: 'center', justifyContent: 'center' }}><Leaf size={21} color="#e9f4e9" /></View><View><Text style={{ color: KripTop_light ? '#fff' : KripTop_theme.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.5 }}>KripTop <Text style={{ fontWeight: '400' }}>HR</Text></Text><Text style={{ fontSize: 9, color: KripTop_light ? '#adc9b8' : '#7c9081', letterSpacing: 1.4, marginTop: 2 }}>PEOPLE & INSIGHTS</Text></View></View>;
}

function KripTop_PrivateApp({ token: KripTop_token, onLogout: KripTop_onLogout }: { token: string; onLogout: () => void }) {
  const KripTop_data = KripTop_useHR(KripTop_token);
  const { width: KripTop_width } = useWindowDimensions();
  const KripTop_wide = KripTop_width >= 1180;
  const [KripTop_page, KripTop_setPage] = useState<KripTop_Page>('Executive Dashboard');
  const [KripTop_collapsed, KripTop_setCollapsed] = useState(false);
  const [KripTop_drawer, KripTop_setDrawer] = useState(false);
  const KripTop_drawerX = useRef(new Animated.Value(-280)).current;
  const KripTop_sideWidth = useRef(new Animated.Value(KripTop_wide ? 246 : 0)).current;
  const KripTop_scroll = useRef<ScrollView>(null);
  const KripTop_disabled = KripTop_data.KripTop_loading || KripTop_data.KripTop_busy;
  const KripTop_current = KripTop_navigation.find(KripTop_item => KripTop_item.name === KripTop_page)!;
  useEffect(() => { Animated.timing(KripTop_sideWidth, { toValue: KripTop_wide && !KripTop_collapsed ? 246 : 0, duration: 230, useNativeDriver: false }).start(); }, [KripTop_wide, KripTop_collapsed, KripTop_sideWidth]);
  function KripTop_closeDrawer() { Animated.timing(KripTop_drawerX, { toValue: -280, duration: 190, useNativeDriver: Platform.OS !== 'web' }).start(() => KripTop_setDrawer(false)); }
  function KripTop_toggleMenu() {
    if (KripTop_wide) { KripTop_setCollapsed(KripTop_value => !KripTop_value); return; }
    KripTop_drawerX.setValue(-280); KripTop_setDrawer(true);
    Animated.timing(KripTop_drawerX, { toValue: 0, duration: 230, useNativeDriver: Platform.OS !== 'web' }).start();
  }
  function KripTop_navigate(KripTop_next: KripTop_Page) { KripTop_setPage(KripTop_next); if (KripTop_drawer) KripTop_closeDrawer(); KripTop_scroll.current?.scrollTo({ y: 0, animated: false }); }
  async function KripTop_export() {
    try {
      const KripTop_csv = KripTop_employeeCSV(KripTop_data.KripTop_employees, KripTop_data.KripTop_analysis);
      if (Platform.OS === 'web') {
        const KripTop_url = URL.createObjectURL(new Blob(['\ufeff', KripTop_csv], { type: 'text/csv;charset=utf-8;' }));
        const KripTop_link = document.createElement('a'); KripTop_link.href = KripTop_url; KripTop_link.download = 'KripTop_HR_Employee_Report.csv'; document.body.appendChild(KripTop_link); KripTop_link.click(); KripTop_link.remove(); setTimeout(() => URL.revokeObjectURL(KripTop_url), 1000);
      } else await Share.share({ title: 'KripTop HR employee CSV report', message: KripTop_csv });
    } catch (KripTop_error) { KripTop_alert('Export unavailable', KripTop_errorMessage(KripTop_error)); }
  }
  function KripTop_sidebar(KripTop_mobile = false) {
    return <View style={{ width: KripTop_mobile ? 280 : 246, flex: 1, backgroundColor: '#fff', borderRightWidth: 1, borderColor: KripTop_theme.line, paddingTop: KripTop_mobile ? 48 : 28, paddingHorizontal: 20, gap: 31 }}>
      <View style={KripTop_styles.row}><KripTop_Brand />{KripTop_mobile && <Pressable accessibilityRole="button" accessibilityLabel="Close navigation" onPress={KripTop_closeDrawer} style={{ padding: 6 }}><X size={19} color={KripTop_theme.ink} /></Pressable>}</View>
      <View style={{ gap: 8 }}><Text style={[KripTop_styles.eyebrow, { marginLeft: 12, marginBottom: 7, color: '#9caaa0', fontSize: 9 }]}>WORKSPACE</Text>{KripTop_navigation.map(KripTop_item => <Pressable key={KripTop_item.name} accessibilityRole="button" accessibilityLabel={`Go to ${KripTop_item.name}`} accessibilityState={{ selected: KripTop_page === KripTop_item.name }} onPress={() => KripTop_navigate(KripTop_item.name)} style={({ pressed: KripTop_pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 14, backgroundColor: KripTop_page === KripTop_item.name ? '#eaf3e9' : KripTop_pressed ? '#f4f7f1' : 'transparent' }]}><KripTop_item.icon size={17} color={KripTop_page === KripTop_item.name ? '#31724f' : '#8c9c90'} strokeWidth={1.7} /><Text style={{ flex: 1, color: KripTop_page === KripTop_item.name ? '#2d694a' : '#778a7b', fontSize: 12, fontWeight: KripTop_page === KripTop_item.name ? '700' : '500' }}>{KripTop_item.name}</Text></Pressable>)}</View>
      <View style={{ flex: 1 }} />
      <View style={{ backgroundColor: '#f4f7ee', padding: 15, borderRadius: 12, gap: 8 }}><BarChart3 size={21} color="#709b75" /><Text style={{ color: '#4f7658', fontSize: 12, fontWeight: '700' }}>Clarity for better planning.</Text><Text style={[KripTop_styles.muted, { fontSize: 10, lineHeight: 17 }]}>One connected view of your team, payroll and salary structure.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Logout" disabled={KripTop_disabled} onPress={KripTop_onLogout} style={{ paddingVertical: 20, flexDirection: 'row', gap: 11, alignItems: 'center', borderTopWidth: 1, borderColor: KripTop_theme.line, marginBottom: 15 }}><LogOut size={17} color="#89988c" /><Text style={{ color: '#6b7f70', fontSize: 12, fontWeight: '600' }}>Logout</Text></Pressable>
    </View>;
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: KripTop_theme.background }}><View style={{ flex: 1, flexDirection: 'row' }}>
    {KripTop_wide && <Animated.View style={{ width: KripTop_sideWidth, overflow: 'hidden' }}>{KripTop_sidebar()}</Animated.View>}
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ backgroundColor: '#fff', minHeight: 75, borderBottomWidth: 1, borderColor: KripTop_theme.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: KripTop_width < 600 ? 18 : 32, gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, flex: 1 }}><Pressable accessibilityRole="button" accessibilityLabel="Open navigation" accessibilityState={{ expanded: KripTop_drawer || (KripTop_wide && !KripTop_collapsed) }} onPress={KripTop_toggleMenu} style={{ padding: 8, borderWidth: 1, borderColor: '#e8eee7', borderRadius: 8 }}><Menu size={19} color="#52745b" /></Pressable><Text style={[KripTop_styles.muted, { fontSize: 11 }]} numberOfLines={1}>Workspace {KripTop_width > 600 ? ` / ${KripTop_page}` : ''}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9f1e4' }}><Text style={{ color: '#557f59', fontWeight: '700', fontSize: 11 }}>AD</Text></View>{KripTop_width > 600 && <View><Text style={{ color: KripTop_theme.ink, fontSize: 12, fontWeight: '700' }}>Administrator</Text><Text style={[KripTop_styles.muted, { fontSize: 9, lineHeight: 14 }]}>HR workspace</Text></View>}</View></View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={KripTop_scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: KripTop_width < 600 ? 18 : 32, gap: 24, maxWidth: 1500, width: '100%', alignSelf: 'center', paddingBottom: 32 }}>
        <View style={KripTop_styles.row}><View style={{ gap: 5, flexShrink: 1 }}><Text style={KripTop_styles.eyebrow}>PEOPLE OPERATIONS</Text><Text accessibilityRole="header" style={[KripTop_styles.title, KripTop_width < 600 && { fontSize: 26 }]}>{KripTop_page}</Text><Text style={KripTop_styles.muted}>{KripTop_current.description}</Text></View><View style={{ gap: 7, alignItems: 'flex-end' }}><KripTop_Button title="Refresh" icon={RefreshCw} variant="ghost" disabled={KripTop_disabled} onPress={() => void KripTop_data.KripTop_refresh()} /><Text style={[KripTop_styles.muted, { fontSize: 9 }]}>{KripTop_data.KripTop_updated ? `Updated ${new Date(KripTop_data.KripTop_updated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })} ICT` : 'Loading current data'}</Text></View></View>
        {KripTop_data.KripTop_error ? <View style={{ borderRadius: 12, padding: 16, backgroundColor: '#fff1ed', gap: 6 }}><Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_data.KripTop_error}</Text><Text style={KripTop_styles.muted}>Refresh to retry. Any displayed values belong to the last successful snapshot.</Text></View> : null}
        {KripTop_data.KripTop_notice ? <View accessibilityLiveRegion="polite" style={{ padding: 13, backgroundColor: '#eaf4e9', borderRadius: 10, flexDirection: 'row', gap: 9, alignItems: 'center' }}><CheckCircle2 size={16} color="#4e865a" /><Text style={{ color: '#477851', fontSize: 12 }}>{KripTop_data.KripTop_notice}</Text></View> : null}
        {KripTop_data.KripTop_analysisError && KripTop_page !== 'K-Means Clustering' ? <Text style={KripTop_styles.error} accessibilityRole="alert">{KripTop_data.KripTop_analysisError}</Text> : null}
        {KripTop_data.KripTop_loading && KripTop_page !== 'K-Means Clustering' && <KripTop_Loading />}
        {KripTop_data.KripTop_updated && KripTop_page === 'Executive Dashboard' && <KripTop_Executive data={KripTop_data} onEmployees={() => KripTop_navigate('Employee Management')} />}
        {KripTop_data.KripTop_updated && KripTop_page === 'Employee Management' && <KripTop_Employees data={KripTop_data} />}
        {KripTop_data.KripTop_updated && KripTop_page === 'Salary Analytics' && <KripTop_SalaryPage employees={KripTop_data.KripTop_employees} />}
        {KripTop_page === 'K-Means Clustering' && <KripTop_ClusterPage data={KripTop_data} />}
        {KripTop_data.KripTop_updated && KripTop_page === 'Reports & Insights' && <KripTop_Reports data={KripTop_data} onExport={() => void KripTop_export()} />}
        <View style={[KripTop_styles.row, { borderTopWidth: 1, borderColor: '#e3eae2', paddingTop: 18 }]}><Text style={[KripTop_styles.muted, { fontSize: 10 }]}>© 2026 KripTop HR · People & Insights</Text><Text style={[KripTop_styles.muted, { fontSize: 10 }]}>Current salaries · THB per month</Text></View>
      </ScrollView></KeyboardAvoidingView>
    </View>
    <Modal visible={KripTop_drawer && !KripTop_wide} transparent animationType="none" onRequestClose={KripTop_closeDrawer}><View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(15,39,29,0.3)' }}><Animated.View accessibilityViewIsModal style={{ width: 280, transform: [{ translateX: KripTop_drawerX }] }}>{KripTop_sidebar(true)}</Animated.View><Pressable accessibilityRole="button" accessibilityLabel="Close navigation backdrop" onPress={KripTop_closeDrawer} style={{ flex: 1 }} /></View></Modal>
  </View></SafeAreaView>;
}

export default function KripTop_App() {
  const [KripTop_token, KripTop_setToken] = useState<string | null>(null);
  const [KripTop_username, KripTop_setUsername] = useState(''); const [KripTop_password, KripTop_setPassword] = useState('');
  const [KripTop_busy, KripTop_setBusy] = useState(false); const [KripTop_error, KripTop_setError] = useState('');
  const { width: KripTop_width } = useWindowDimensions();
  async function KripTop_login() {
    if (!KripTop_username.trim() || !KripTop_password) { KripTop_alert('Missing credentials', 'Enter your username and password.'); return; }
    KripTop_setBusy(true); KripTop_setError('');
    try {
      const KripTop_result = await KripTop_request<{ success: boolean; token: string }>('/api/login', null, { method: 'POST', body: JSON.stringify({ username: KripTop_username.trim(), password: KripTop_password }) });
      KripTop_setToken(KripTop_result.token); KripTop_setPassword('');
    } catch (KripTop_caught) { KripTop_setError(KripTop_errorMessage(KripTop_caught)); KripTop_alert('Login failed', KripTop_errorMessage(KripTop_caught)); }
    finally { KripTop_setBusy(false); }
  }
  if (KripTop_token) return <KripTop_PrivateApp token={KripTop_token} onLogout={() => { KripTop_setToken(null); KripTop_setError(''); }} />;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7f2' }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 26, gap: 36, width: '100%', maxWidth: 1200, alignSelf: 'center', paddingTop: 35 }}><KripTop_Brand /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 45, alignItems: 'center', justifyContent: 'center', paddingTop: KripTop_width > 800 ? 65 : 10 }}><View style={{ flexGrow: 1, flexBasis: 350, flexShrink: 1, gap: 20 }}><Text style={KripTop_styles.eyebrow}>YOUR PEOPLE. YOUR PERSPECTIVE.</Text><Text style={{ color: KripTop_theme.ink, fontSize: KripTop_width > 600 ? 50 : 36, fontWeight: '800', lineHeight: KripTop_width > 600 ? 59 : 44, letterSpacing: -1.7 }}>Good work starts{ '\n' }with your people.</Text><Text style={{ color: '#778b7a', fontSize: 15, lineHeight: 26, maxWidth: 420 }}>One clear workspace for your team, payroll and salary insights. Built for thoughtful HR decisions.</Text><View style={{ flexDirection: 'row', gap: 18, flexWrap: 'wrap', marginTop: 9 }}>{[{ icon: Users, text: 'People, connected' }, { icon: BarChart3, text: 'Insights, clarified' }, { icon: ShieldCheck, text: 'Your HR workspace' }].map(KripTop_item => <View key={KripTop_item.text} style={{ gap: 9, padding: 16, borderRadius: 12, backgroundColor: '#ecf2e7' }}><KripTop_item.icon size={20} color="#739875" /><Text style={{ color: '#6e8b6f', fontSize: 10 }}>{KripTop_item.text}</Text></View>)}</View></View><View style={{ flexBasis: 380, flexGrow: 1, flexShrink: 1, maxWidth: 450 }}><KripTop_Card><Text style={KripTop_styles.eyebrow}>WELCOME TO KRIPTOP HR</Text><Text style={[KripTop_styles.title, { fontSize: 27 }]}>Welcome back.</Text><Text style={KripTop_styles.muted}>Sign in to your people & insights workspace.</Text><KripTop_Field label="Username" value={KripTop_username} onChangeText={KripTop_setUsername} autoCapitalize="none" autoCorrect={false} placeholder="Enter your username" /><KripTop_Field label="Password" value={KripTop_password} onChangeText={KripTop_setPassword} secureTextEntry placeholder="Enter your password" onSubmitEditing={() => void KripTop_login()} />{KripTop_error ? <Text accessibilityRole="alert" style={KripTop_styles.error}>{KripTop_error}</Text> : null}<KripTop_Button title={KripTop_busy ? 'Signing in…' : 'Sign in'} disabled={KripTop_busy} onPress={() => void KripTop_login()} />{KripTop_busy && <ActivityIndicator color={KripTop_theme.green} />}<Text style={[KripTop_styles.muted, { textAlign: 'center', fontSize: 10 }]}>Exam demo · admin / password123</Text></KripTop_Card></View></View><Text style={[KripTop_styles.muted, { fontSize: 10, marginTop: 30 }]}>KripTop HR · Student 6730202025 · Internet Programming 2026</Text></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
