const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'APPROVED';

UPDATE users SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
`;

pool.query(sql)
  .then(() => console.log('Approval migration successful'))
  .catch(err => console.error('Error in migration', err))
  .finally(() => pool.end());
