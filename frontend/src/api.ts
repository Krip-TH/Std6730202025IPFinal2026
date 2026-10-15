// Verified Express endpoint, distinct from the Cloud MySQL service.
export const KripTop_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://119.59.102.161:3117').replace(/\/$/, '');
export type KripTop_Employee = { id: string; name: string; position: string; status: 'Active' | 'On Leave'; salary: number };
export type KripTop_Cluster = { group: string; centroid: number; count: number };
export type KripTop_Assignment = { id: string; group: string; salary: number };
export type KripTop_Analysis = { success: boolean; clusters: KripTop_Cluster[]; assignments: KripTop_Assignment[]; employees: KripTop_Employee[]; generatedAt: string };

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
      throw new Error(`Cannot reach API at ${KripTop_API_BASE_URL}. Check the API URL, server and network connection.`);
    }
    throw KripTop_error;
  } finally { clearTimeout(KripTop_timeout); }
}
