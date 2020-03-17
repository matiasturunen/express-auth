import pg from 'pg-promise';

// Load enviroment variables from the file, if the app status is not production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export function dropTables() {
  const pgp = pg();

  const dburl = process.env.DATABASE_URL;
  const db = pgp(dburl);

  const sql = 'BEGIN;\
                  DROP TABLE IF EXISTS access_token;\
                  DROP TABLE IF EXISTS users;\
              COMMIT;';
  return db.none(sql);
}

if (require.main === module) {
  dropTables()
    .catch(err => console.error('Database reset and seeding failed: ', err));
}
