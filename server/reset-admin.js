import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDB, saveDB, initDB, closeDB } from './db.js';

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('\nPenggunaan: npm run reset:admin -- <username> <password>\n');
  process.exit(1);
}

if (!/^[a-zA-Z0-9_.-]{3,60}$/.test(username)) {
  console.error('\nUsername minimal 3 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\nPassword minimal 8 karakter.\n');
  process.exit(1);
}

await initDB();

const db = getDB();
db.account.username = username;
db.account.passwordHash = bcrypt.hashSync(password, 12);
db.account.updatedAt = new Date().toISOString();
await saveDB();
await closeDB();

console.log('\nAkun superadmin diperbarui.');
console.log(`  Username : ${username}`);
console.log(`  Password : ${password}`);
console.log('\nSilakan masuk di /admin.\n');
