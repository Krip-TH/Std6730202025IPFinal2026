import { Platform } from 'react-native';

export const KripTop_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')).replace(/\/$/, '');
export type KripTop_Employee = { id: string; name: string; position: string; status: 'Active' | 'On Leave'; salary: number };
export type KripTop_Cluster = { group: string; centroid: number; count: number };

export async function KripTop_request<T>(KripTop_path: string, KripTop_token: string | null, KripTop_options: RequestInit = {}): Promise<T> {
  const KripTop_controller = new AbortController();
  const KripTop_timeout = setTimeout(() => KripTop_controller.abort(), 12000);
  try {
    const KripTop_response = await fetch(`${KripTop_API_BASE_URL}${KripTop_path}`, {
      ...KripTop_options,
      signal: KripTop_controller.signal,
      headers: { 'Content-Type': 'application/json', ...(KripTop_token ? { Authorization: `Bearer ${KripTop_token}` } : {}), ...KripTop_options.headers },
    });
    const KripTop_data = await KripTop_response.json();
    if (!KripTop_response.ok) throw new Error(KripTop_data.error || `Request failed (${KripTop_response.status}).`);
    return KripTop_data as T;
  } catch (KripTop_error) {
    if (KripTop_error instanceof Error && (KripTop_error.name === 'AbortError' || KripTop_error.message.includes('fetch') || KripTop_error.message.includes('Network'))) {
      throw new Error(`Cannot reach API at ${KripTop_API_BASE_URL}. Check the server, LAN IP and Wi-Fi connection.`);
    }
    throw KripTop_error;
  } finally { clearTimeout(KripTop_timeout); }
}
