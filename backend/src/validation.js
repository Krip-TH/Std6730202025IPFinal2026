export function KripTop_validEmployee(KripTop_body) {
  const { name: KripTop_name, position: KripTop_position, salary: KripTop_salary } = KripTop_body ?? {};
  return typeof KripTop_name === 'string' && Boolean(KripTop_name.trim()) && Array.from(KripTop_name.trim()).length <= 100
    && typeof KripTop_position === 'string' && Boolean(KripTop_position.trim()) && Array.from(KripTop_position.trim()).length <= 100
    && typeof KripTop_salary === 'number' && Number.isFinite(KripTop_salary) && KripTop_salary >= 0.01 && KripTop_salary <= 9999999999.99
    && Math.abs(KripTop_salary - Number(KripTop_salary.toFixed(2))) <= Number.EPSILON * Math.max(1, KripTop_salary) * 2;
}
export const KripTop_validationMessage = 'Name and position are required (maximum 100 characters). Salary must be positive, at most 9,999,999,999.99 and have at most two decimal places.';
