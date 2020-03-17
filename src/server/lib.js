import Promise from 'bluebird';
import bcrypt from 'bcryptjs';

export function createErrorPromise(message, status) {
  const err = new Error(message);
  err.message = message;
  err.status = status || 500;

  return Promise.reject(err);
}

export function cryptPassword(password) {
  const genSalt = Promise.promisify(bcrypt.genSalt);
  const hash = Promise.promisify(bcrypt.hash);

  return genSalt(2)
    .then(salt => hash(password, salt));
}

export function comparePassword(password, userPassword) {
  const compare = Promise.promisify(bcrypt.compare);

  // compare(plaintext, hash)
  return compare(password, userPassword);
}
