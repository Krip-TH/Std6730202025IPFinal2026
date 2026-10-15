import express from 'express';
import cors from 'cors';
import { randomUUID as KripTop_randomUUID } from 'node:crypto';
import { KripTop_clusterSalaries } from './clusters.js';

export function KripTop_createApp() {
  const KripTop_app = express();
  let KripTop_employees = [
    { id: '1', name: 'John Doe', position: 'Software Engineer', status: 'Active', salary: 45000 },
    { id: '2', name: 'Maya Chen', position: 'HR Manager', status: 'Active', salary: 62000 },
    { id: '3', name: 'Noah Williams', position: 'Office Assistant', status: 'On Leave', salary: 18000 },
    { id: '4', name: 'Amara Patel', position: 'Product Director', status: 'Active', salary: 85000 },
    { id: '5', name: 'Niran Suri', position: 'Junior Designer', status: 'Active', salary: 25000 },
  ];
  KripTop_app.use(cors());
  KripTop_app.use(express.json({ limit: '16kb' }));
  KripTop_app.post('/api/login', (KripTop_req, KripTop_res) => {
    if (KripTop_req.body?.username === 'admin' && KripTop_req.body?.password === 'password123') return KripTop_res.json({ success: true, token: 'mock-jwt-token' });
    return KripTop_res.status(401).json({ success: false, error: 'Invalid username or password.' });
  });
  // Exam mock token only: not production authentication.
  KripTop_app.use('/api/employees', (KripTop_req, KripTop_res, KripTop_next) => {
    if (KripTop_req.get('Authorization') !== 'Bearer mock-jwt-token') return KripTop_res.status(401).json({ success: false, error: 'Please log in.' });
    KripTop_next();
  });
  KripTop_app.get('/api/employees/salary-clusters', (KripTop_req, KripTop_res) => {
    KripTop_res.json({ success: true, clusters: KripTop_clusterSalaries(KripTop_employees.map(KripTop_employee => KripTop_employee.salary)) });
  });
  KripTop_app.get('/api/employees', (KripTop_req, KripTop_res) => KripTop_res.json(KripTop_employees));
  KripTop_app.post('/api/employees', (KripTop_req, KripTop_res) => {
    const { name: KripTop_name, position: KripTop_position, salary: KripTop_salary } = KripTop_req.body ?? {};
    if (typeof KripTop_name !== 'string' || !KripTop_name.trim() || typeof KripTop_position !== 'string' || !KripTop_position.trim() || typeof KripTop_salary !== 'number' || !Number.isFinite(KripTop_salary) || KripTop_salary <= 0 || KripTop_salary > Number.MAX_SAFE_INTEGER) {
      return KripTop_res.status(400).json({ success: false, error: 'Name and position are required. Salary must be a positive finite number within the safe numeric range.' });
    }
    const KripTop_employee = { id: KripTop_randomUUID(), name: KripTop_name.trim(), position: KripTop_position.trim(), status: 'Active', salary: KripTop_salary };
    KripTop_employees.push(KripTop_employee);
    return KripTop_res.status(201).json(KripTop_employee);
  });
  KripTop_app.put('/api/employees/:id/status', (KripTop_req, KripTop_res) => {
    const KripTop_employee = KripTop_employees.find(KripTop_item => KripTop_item.id === KripTop_req.params.id);
    if (!KripTop_employee) return KripTop_res.status(404).json({ success: false, error: 'Employee not found.' });
    KripTop_employee.status = KripTop_employee.status === 'Active' ? 'On Leave' : 'Active';
    return KripTop_res.json(KripTop_employee);
  });
  KripTop_app.delete('/api/employees/:id', (KripTop_req, KripTop_res) => {
    const KripTop_index = KripTop_employees.findIndex(KripTop_item => KripTop_item.id === KripTop_req.params.id);
    if (KripTop_index === -1) return KripTop_res.status(404).json({ success: false, error: 'Employee not found.' });
    KripTop_employees.splice(KripTop_index, 1);
    return KripTop_res.json({ success: true });
  });
  KripTop_app.use((KripTop_req, KripTop_res) => KripTop_res.status(404).json({ success: false, error: 'Route not found.' }));
  KripTop_app.use((KripTop_error, KripTop_req, KripTop_res, KripTop_next) => {
    const KripTop_status = KripTop_error.status === 400 || KripTop_error.status === 413 ? KripTop_error.status : 500;
    KripTop_res.status(KripTop_status).json({ success: false, error: KripTop_status === 500 ? 'Internal server error.' : 'Invalid JSON request or request too large.' });
  });
  return KripTop_app;
}
