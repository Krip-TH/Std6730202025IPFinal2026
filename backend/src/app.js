import express from 'express';
import cors from 'cors';
import { randomUUID as KripTop_randomUUID } from 'node:crypto';
import { KripTop_analyzeEmployees } from './clusters.js';
import { KripTop_createMysqlStore } from './mysql-store.js';
import { KripTop_validEmployee, KripTop_validationMessage } from './validation.js';

export function KripTop_createApp(KripTop_store = KripTop_createMysqlStore()) {
  const KripTop_app = express();
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
  KripTop_app.get('/api/employees/salary-clusters', async (KripTop_req, KripTop_res) => {
    KripTop_res.json({ success: true, ...KripTop_analyzeEmployees(await KripTop_store.KripTop_list()) });
  });
  KripTop_app.get('/api/employees', async (KripTop_req, KripTop_res) => KripTop_res.json(await KripTop_store.KripTop_list()));
  KripTop_app.post('/api/employees', async (KripTop_req, KripTop_res) => {
    const { name: KripTop_name, position: KripTop_position, salary: KripTop_salary } = KripTop_req.body ?? {};
    if (!KripTop_validEmployee(KripTop_req.body)) {
      return KripTop_res.status(400).json({ success: false, error: KripTop_validationMessage });
    }
    const KripTop_employee = { id: KripTop_randomUUID(), name: KripTop_name.trim(), position: KripTop_position.trim(), status: 'Active', salary: Number(KripTop_salary.toFixed(2)) };
    return KripTop_res.status(201).json(await KripTop_store.KripTop_add(KripTop_employee));
  });
  KripTop_app.put('/api/employees/:id/status', async (KripTop_req, KripTop_res) => {
    const KripTop_employee = await KripTop_store.KripTop_toggle(KripTop_req.params.id);
    if (!KripTop_employee) return KripTop_res.status(404).json({ success: false, error: 'Employee not found.' });
    return KripTop_res.json(KripTop_employee);
  });
  KripTop_app.put('/api/employees/:id', async (KripTop_req, KripTop_res) => {
    if (!KripTop_validEmployee(KripTop_req.body)) return KripTop_res.status(400).json({ success: false, error: KripTop_validationMessage });
    const KripTop_employee = await KripTop_store.KripTop_update(KripTop_req.params.id, {
      name: KripTop_req.body.name.trim(), position: KripTop_req.body.position.trim(), salary: Number(KripTop_req.body.salary.toFixed(2)),
    });
    if (!KripTop_employee) return KripTop_res.status(404).json({ success: false, error: 'Employee not found.' });
    return KripTop_res.json(KripTop_employee);
  });
  KripTop_app.delete('/api/employees/:id', async (KripTop_req, KripTop_res) => {
    if (!await KripTop_store.KripTop_delete(KripTop_req.params.id)) return KripTop_res.status(404).json({ success: false, error: 'Employee not found.' });
    return KripTop_res.json({ success: true });
  });
  KripTop_app.use((KripTop_req, KripTop_res) => KripTop_res.status(404).json({ success: false, error: 'Route not found.' }));
  KripTop_app.use((KripTop_error, KripTop_req, KripTop_res, KripTop_next) => {
    const KripTop_status = KripTop_error.status === 400 || KripTop_error.status === 413 ? KripTop_error.status : 500;
    KripTop_res.status(KripTop_status).json({ success: false, error: KripTop_status === 500 ? 'Internal server error.' : 'Invalid JSON request or request too large.' });
  });
  return KripTop_app;
}
