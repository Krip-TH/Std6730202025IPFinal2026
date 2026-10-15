import { createPool as KripTop_createPool } from 'mysql2/promise';

// Identifiers cannot use value placeholders. This exact, fixed identifier is never user input.
export const KripTop_TABLE = 'std6730202025IPFinal2026';

export function KripTop_createDatabasePool(KripTop_env = process.env) {
  for (const KripTop_key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (!KripTop_env[KripTop_key]) throw new Error(`Missing required environment variable: ${KripTop_key}`);
  }
  if (KripTop_env.DB_NAME !== 'ip_std6730202025') throw new Error('DB_NAME must be ip_std6730202025.');
  const KripTop_port = Number(KripTop_env.DB_PORT || 3306);
  if (!Number.isInteger(KripTop_port) || KripTop_port < 1 || KripTop_port > 65535) throw new Error('DB_PORT must be an integer between 1 and 65535.');
  return KripTop_createPool({
    host: KripTop_env.DB_HOST, port: KripTop_port, database: KripTop_env.DB_NAME,
    user: KripTop_env.DB_USER, password: KripTop_env.DB_PASSWORD,
    waitForConnections: true, connectionLimit: 5, queueLimit: 20, connectTimeout: 10000,
    charset: 'utf8mb4', multipleStatements: false,
  });
}

function KripTop_employeeFromRow(KripTop_row) {
  return { id: KripTop_row.id, name: KripTop_row.name, position: KripTop_row.position, status: KripTop_row.status, salary: Number(KripTop_row.salary) };
}

export function KripTop_createMysqlStore(KripTop_pool = KripTop_createDatabasePool()) {
  return {
    async KripTop_list() {
      const [KripTop_rows] = await KripTop_pool.execute('SELECT `id`, `name`, `position`, `status`, `salary` FROM `std6730202025IPFinal2026` ORDER BY `name`, `id`');
      return KripTop_rows.map(KripTop_employeeFromRow);
    },
    async KripTop_salaries() {
      const [KripTop_rows] = await KripTop_pool.execute('SELECT `salary` FROM `std6730202025IPFinal2026`');
      return KripTop_rows.map(KripTop_row => Number(KripTop_row.salary));
    },
    async KripTop_add(KripTop_employee) {
      await KripTop_pool.execute('INSERT INTO `std6730202025IPFinal2026` (`id`, `name`, `position`, `status`, `salary`) VALUES (?, ?, ?, ?, ?)',
        [KripTop_employee.id, KripTop_employee.name, KripTop_employee.position, KripTop_employee.status, KripTop_employee.salary]);
      return KripTop_employee;
    },
    async KripTop_update(KripTop_id, KripTop_values) {
      const KripTop_connection = await KripTop_pool.getConnection();
      try {
        await KripTop_connection.beginTransaction();
        const [KripTop_rows] = await KripTop_connection.execute('SELECT `id`, `name`, `position`, `status`, `salary` FROM `std6730202025IPFinal2026` WHERE `id` = ? FOR UPDATE', [KripTop_id]);
        if (!KripTop_rows.length) { await KripTop_connection.commit(); return null; }
        await KripTop_connection.execute('UPDATE `std6730202025IPFinal2026` SET `name` = ?, `position` = ?, `salary` = ? WHERE `id` = ?', [KripTop_values.name, KripTop_values.position, KripTop_values.salary, KripTop_id]);
        await KripTop_connection.commit();
        return { ...KripTop_employeeFromRow(KripTop_rows[0]), ...KripTop_values };
      } catch (KripTop_error) {
        await KripTop_connection.rollback();
        throw KripTop_error;
      } finally { KripTop_connection.release(); }
    },
    async KripTop_toggle(KripTop_id) {
      const KripTop_connection = await KripTop_pool.getConnection();
      try {
        await KripTop_connection.beginTransaction();
        const [KripTop_rows] = await KripTop_connection.execute('SELECT `id`, `name`, `position`, `status`, `salary` FROM `std6730202025IPFinal2026` WHERE `id` = ? FOR UPDATE', [KripTop_id]);
        if (!KripTop_rows.length) { await KripTop_connection.commit(); return null; }
        const KripTop_employee = KripTop_employeeFromRow(KripTop_rows[0]);
        KripTop_employee.status = KripTop_employee.status === 'Active' ? 'On Leave' : 'Active';
        await KripTop_connection.execute('UPDATE `std6730202025IPFinal2026` SET `status` = ? WHERE `id` = ?', [KripTop_employee.status, KripTop_id]);
        await KripTop_connection.commit();
        return KripTop_employee;
      } catch (KripTop_error) {
        await KripTop_connection.rollback();
        throw KripTop_error;
      } finally { KripTop_connection.release(); }
    },
    async KripTop_delete(KripTop_id) {
      const [KripTop_result] = await KripTop_pool.execute('DELETE FROM `std6730202025IPFinal2026` WHERE `id` = ?', [KripTop_id]);
      return KripTop_result.affectedRows > 0;
    },
    async KripTop_check() {
      // Read-only startup check: never creates or seeds the Cloud database automatically.
      await KripTop_pool.execute('SELECT `id`, `name`, `position`, `status`, `salary` FROM `std6730202025IPFinal2026` LIMIT 0');
    },
    async KripTop_close() { await KripTop_pool.end(); },
  };
}
