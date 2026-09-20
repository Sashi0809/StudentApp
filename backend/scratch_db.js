import { query } from './src/db.js';

async function alterDb() {
  try {
    const res = await query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS current_semester INTEGER DEFAULT 1;
    `);
    console.log("Success:", res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

alterDb();
