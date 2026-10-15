import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export const KripTop_theme = { green: '#176859', ink: '#173e35', muted: '#76877e', line: '#e6ece7', background: '#f5f7f4' };
export const KripTop_alert = (KripTop_title: string, KripTop_text: string) => Platform.OS === 'web' ? window.alert(`${KripTop_title}\n${KripTop_text}`) : Alert.alert(KripTop_title, KripTop_text);

export function KripTop_Button({ title: KripTop_title, onPress: KripTop_onPress, disabled: KripTop_disabled = false, variant: KripTop_variant = 'primary', icon: KripTop_Icon }: { title: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; icon?: LucideIcon }) {
  const KripTop_color = KripTop_variant === 'primary' ? '#fff' : KripTop_variant === 'danger' ? '#ae4743' : KripTop_theme.ink;
  return <Pressable accessibilityRole="button" accessibilityLabel={KripTop_title} disabled={KripTop_disabled} onPress={KripTop_onPress} style={({ pressed: KripTop_pressed }) => [KripTop_styles.button, KripTop_variant === 'secondary' && { backgroundColor: '#edf3ed', borderColor: '#e0e9e0' }, KripTop_variant === 'danger' && { backgroundColor: '#fff1ed', borderColor: '#fff1ed' }, KripTop_variant === 'ghost' && { backgroundColor: 'transparent', borderColor: KripTop_theme.line }, (KripTop_disabled || KripTop_pressed) && { opacity: 0.5 }]}>
    {KripTop_Icon && <KripTop_Icon size={16} color={KripTop_color} strokeWidth={1.8} />}<Text style={[KripTop_styles.buttonText, { color: KripTop_color }]}>{KripTop_title}</Text>
  </Pressable>;
}
export function KripTop_Field({ label: KripTop_label, ...KripTop_props }: React.ComponentProps<typeof TextInput> & { label: string }) {
  return <View style={KripTop_styles.field}><Text style={KripTop_styles.label}>{KripTop_label}</Text><TextInput accessibilityLabel={KripTop_label} placeholderTextColor="#96a49b" style={KripTop_styles.input} {...KripTop_props} /></View>;
}
export function KripTop_Card({ children: KripTop_children, title: KripTop_title, subtitle: KripTop_subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return <View style={KripTop_styles.card}>{KripTop_title && <View style={{ gap: 5 }}><Text accessibilityRole="header" style={KripTop_styles.heading}>{KripTop_title}</Text>{KripTop_subtitle && <Text style={KripTop_styles.muted}>{KripTop_subtitle}</Text>}</View>}{KripTop_children}</View>;
}
export function KripTop_Loading({ text: KripTop_text = 'Refreshing workforce data…' }: { text?: string }) {
  return <View accessibilityLiveRegion="polite" style={KripTop_styles.loading}><ActivityIndicator color={KripTop_theme.green} accessibilityLabel={KripTop_text} /><Text style={KripTop_styles.muted}>{KripTop_text}</Text></View>;
}
export function KripTop_Empty({ text: KripTop_text = 'No employee records yet. Add a team member to start your analysis.' }: { text?: string }) {
  return <View style={KripTop_styles.empty}><Text style={KripTop_styles.muted}>{KripTop_text}</Text></View>;
}
export const KripTop_styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: KripTop_theme.line, padding: 22, gap: 20, boxShadow: '0px 3px 14px rgba(22, 53, 38, 0.025)' },
  heading: { fontSize: 18, fontWeight: '700', color: KripTop_theme.ink, letterSpacing: -0.3 },
  muted: { fontSize: 12, lineHeight: 20, color: KripTop_theme.muted },
  title: { fontSize: 30, lineHeight: 38, fontWeight: '800', color: KripTop_theme.ink, letterSpacing: -0.8 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '800', color: '#5a8f73' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  column: { flexBasis: 360, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  button: { minHeight: 42, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: KripTop_theme.green, borderWidth: 1, borderColor: KripTop_theme.green },
  buttonText: { fontSize: 12, fontWeight: '700' },
  field: { flexGrow: 1, minWidth: 170, gap: 8 }, label: { color: '#53695b', fontSize: 12, fontWeight: '600' },
  input: { backgroundColor: '#fafcf9', borderWidth: 1, borderColor: '#dfe7e0', borderRadius: 9, padding: 13, color: KripTop_theme.ink, fontSize: 14, minHeight: 46 },
  loading: { padding: 18, gap: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: 35, paddingHorizontal: 18, alignItems: 'center', backgroundColor: '#f8faf6', borderRadius: 12 },
  error: { color: '#a7423e', fontSize: 13, lineHeight: 21 },
  badge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700', color: '#377a54', backgroundColor: '#e9f4eb' },
});
