const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    hod_id UUID REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name) VALUES ('Computer Science') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Mechanical Engineering') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Civil Engineering') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Electrical Engineering') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Physics') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Mathematics') ON CONFLICT DO NOTHING;
`;

pool.query(sql)
  .then(() => console.log('HOD and Department tables created successfully'))
  .catch(err => console.error('Error creating tables', err))
  .finally(() => pool.end());
