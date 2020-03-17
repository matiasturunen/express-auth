import pg from 'pg-promise';

// Load enviroment variables from the file, if the app status is not production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export function createDatabase() {
  const pgp = pg();

  const dblib = require('../src/server/db.js');

  const dburl = process.env.DATABASE_URL;
  const db = pgp(dburl);

  const sql1 = 'BEGIN;\
              CREATE TABLE users (\
                  id SERIAL PRIMARY KEY,\
                  username TEXT NOT NULL UNIQUE,\
                  password TEXT NOT NULL,\
                  email TEXT UNIQUE\
              );\
              CREATE TABLE access_token (\
                  id SERIAL PRIMARY KEY,\
                  token TEXT NOT NULL,\
                  expires DATE,\
                  user_id INT REFERENCES users(id)\
              );\
              COMMIT;';

  return db.none(sql1)
    .then(() => dblib.create_user('admin', process.env.ADMIN_PASS || '', '')); // Create admin with password from env var. Or leave empty for generated random password
}

if (require.main === module) {
  createDatabase()
    .catch(err => console.error('Database reset and seeding failed: ', err));
}
