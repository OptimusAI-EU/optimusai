const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create Users table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'user',
      isEmailVerified INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating Users table:', err);
      return;
    }
    console.log('✓ Users table ready');

    // Hash password and insert admin user
    const password = 'Test1234!';
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }

      db.run(`
        INSERT OR IGNORE INTO Users (email, password, firstName, lastName, role, isEmailVerified)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['optimusrobots@proton.me', hash, 'Optimus', 'Admin', 'admin', 1], function(err) {
        if (err) {
          console.error('Error inserting admin user:', err);
        } else {
          console.log('✓ Admin user created/verified');
          console.log('  Email: optimusrobots@proton.me');
          console.log('  Password: Test1234!');
        }
        db.close();
      });
    });
  });
});
