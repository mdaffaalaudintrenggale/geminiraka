import 'dotenv/config';
import { initDB, closeDB, usingPostgres } from './db.js';

try {
  await initDB();
  console.log(`\nDatabase siap (${usingPostgres ? 'PostgreSQL / Supabase' : 'JSON lokal'}).\n`);
} catch (error) {
  console.error('\nGagal menyiapkan database:', error.message, '\n');
  process.exitCode = 1;
} finally {
  await closeDB();
}
