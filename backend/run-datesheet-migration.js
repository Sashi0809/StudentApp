const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_year INTEGER;

ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS target_year INTEGER DEFAULT 0;
`;

pool.query(sql)
  .then(() => console.log('Datesheet migration successful'))
  .catch(err => console.error('Error in migration', err))
  .finally(() => pool.end());
