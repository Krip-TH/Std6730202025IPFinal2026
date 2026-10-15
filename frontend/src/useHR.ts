import { useCallback, useEffect, useRef, useState } from 'react';
import { KripTop_request, type KripTop_Employee, type KripTop_Analysis } from './api';

export const KripTop_errorMessage = (KripTop_error: unknown) => KripTop_error instanceof Error ? KripTop_error.message : 'Unable to complete the request. Please retry.';

export function KripTop_useHR(KripTop_token: string) {
  const [KripTop_employees, KripTop_setEmployees] = useState<KripTop_Employee[]>([]);
  const [KripTop_analysis, KripTop_setAnalysis] = useState<KripTop_Analysis | null>(null);
  const [KripTop_loading, KripTop_setLoading] = useState(true);
  const [KripTop_busy, KripTop_setBusy] = useState(false);
  const [KripTop_error, KripTop_setError] = useState('');
  const [KripTop_analysisError, KripTop_setAnalysisError] = useState('');
  const [KripTop_notice, KripTop_setNotice] = useState('');
  const [KripTop_updated, KripTop_setUpdated] = useState<string | null>(null);
  const KripTop_generation = useRef(0);
  const KripTop_mounted = useRef(true);
  const KripTop_refresh = useCallback(async () => {
    const KripTop_run = ++KripTop_generation.current;
    KripTop_setLoading(true); KripTop_setError(''); KripTop_setAnalysisError('');
    const [KripTop_listResult, KripTop_clusterResult] = await Promise.allSettled([
      KripTop_request<KripTop_Employee[]>('/api/employees', KripTop_token),
      KripTop_request<KripTop_Analysis>('/api/employees/salary-clusters', KripTop_token),
    ]);
    if (!KripTop_mounted.current || KripTop_run !== KripTop_generation.current) return;
    if (KripTop_listResult.status === 'fulfilled') KripTop_setEmployees(KripTop_listResult.value);
    else KripTop_setError(KripTop_errorMessage(KripTop_listResult.reason));
    if (KripTop_clusterResult.status === 'fulfilled' && Array.isArray(KripTop_clusterResult.value.assignments) && Array.isArray(KripTop_clusterResult.value.employees)) {
      // Memberships and metrics use the same server snapshot, even if another client edits between GETs.
      KripTop_setAnalysis(KripTop_clusterResult.value);
      KripTop_setEmployees(KripTop_clusterResult.value.employees);
      KripTop_setUpdated(KripTop_clusterResult.value.generatedAt);
    } else {
      KripTop_setAnalysis(null);
      KripTop_setAnalysisError(KripTop_clusterResult.status === 'rejected' ? KripTop_errorMessage(KripTop_clusterResult.reason) : 'Employee-level cluster details are unavailable. Please refresh after updating the backend.');
      if (KripTop_listResult.status === 'fulfilled') KripTop_setUpdated(new Date().toISOString());
    }
    KripTop_setLoading(false);
  }, [KripTop_token]);
  useEffect(() => {
    KripTop_mounted.current = true; void KripTop_refresh();
    return () => { KripTop_mounted.current = false; KripTop_generation.current++; };
  }, [KripTop_refresh]);
  useEffect(() => {
    if (KripTop_busy || KripTop_loading) return;
    const KripTop_timer = setInterval(() => { void KripTop_refresh(); }, 60000);
    return () => clearInterval(KripTop_timer);
  }, [KripTop_busy, KripTop_loading, KripTop_refresh]);
  async function KripTop_mutate(KripTop_path: string, KripTop_method: string, KripTop_body?: object, KripTop_success = 'Employee updated.') {
    KripTop_setBusy(true); KripTop_setError(''); KripTop_setNotice('');
    try {
      await KripTop_request(KripTop_path, KripTop_token, { method: KripTop_method, ...(KripTop_body ? { body: JSON.stringify(KripTop_body) } : {}) });
      if (!KripTop_mounted.current) return false;
      KripTop_setAnalysis(null); KripTop_setNotice(KripTop_success);
      await KripTop_refresh();
      return true;
    } catch (KripTop_caught) { if (KripTop_mounted.current) KripTop_setError(KripTop_errorMessage(KripTop_caught)); return false; }
    finally { if (KripTop_mounted.current) KripTop_setBusy(false); }
  }
  return { KripTop_employees, KripTop_analysis, KripTop_loading, KripTop_busy, KripTop_error, KripTop_analysisError, KripTop_notice, KripTop_updated, KripTop_refresh, KripTop_mutate };
}
export type KripTop_HR = ReturnType<typeof KripTop_useHR>;
