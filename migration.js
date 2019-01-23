const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(
    `DROP TABLE IF EXISTS Series`
  );
  db.run(
    `CREATE TABLE Series (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL
    )`
  );
});