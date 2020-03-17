import { dropTables } from './drop_tables';
import { createDatabase } from './create_database';

export function resetDatabase() {
  return dropTables()
    .then(() => createDatabase());
}

if (require.main === module) {
  resetDatabase()
    .catch(err => console.error('Database reset and seeding failed: ', err));
}
