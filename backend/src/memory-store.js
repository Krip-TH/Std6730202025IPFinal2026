// Explicit opt-in original exam mode and isolated test fixture; never a DB error fallback.
export function KripTop_createMemoryStore() {
  const KripTop_employees = [
    { id: '1', name: 'John Doe', position: 'Software Engineer', status: 'Active', salary: 45000 },
    { id: '2', name: 'Maya Chen', position: 'HR Manager', status: 'Active', salary: 62000 },
    { id: '3', name: 'Noah Williams', position: 'Office Assistant', status: 'On Leave', salary: 18000 },
    { id: '4', name: 'Amara Patel', position: 'Product Director', status: 'Active', salary: 85000 },
    { id: '5', name: 'Niran Suri', position: 'Junior Designer', status: 'Active', salary: 25000 },
  ];
  return {
    async KripTop_list() { return KripTop_employees.map(KripTop_item => ({ ...KripTop_item })); },
    async KripTop_salaries() { return KripTop_employees.map(KripTop_item => KripTop_item.salary); },
    async KripTop_add(KripTop_employee) { KripTop_employees.push({ ...KripTop_employee }); return KripTop_employee; },
    async KripTop_update(KripTop_id, KripTop_values) {
      const KripTop_employee = KripTop_employees.find(KripTop_item => KripTop_item.id === KripTop_id);
      if (!KripTop_employee) return null;
      Object.assign(KripTop_employee, KripTop_values);
      return { ...KripTop_employee };
    },
    async KripTop_toggle(KripTop_id) {
      const KripTop_employee = KripTop_employees.find(KripTop_item => KripTop_item.id === KripTop_id);
      if (!KripTop_employee) return null;
      KripTop_employee.status = KripTop_employee.status === 'Active' ? 'On Leave' : 'Active';
      return { ...KripTop_employee };
    },
    async KripTop_delete(KripTop_id) {
      const KripTop_index = KripTop_employees.findIndex(KripTop_item => KripTop_item.id === KripTop_id);
      if (KripTop_index === -1) return false;
      KripTop_employees.splice(KripTop_index, 1);
      return true;
    },
    async KripTop_check() {},
    async KripTop_close() {},
  };
}
