import pg from 'pg-promise';
import crypto from 'crypto';
import _ from 'lodash';
import { createErrorPromise } from './lib';

import { cryptPassword } from './lib';

const dburl = process.env.DATABASE_URL;
const pgp = pg();

const db = pgp(dburl);

export function create_user(name, password, email) {
  password = password || crypto.randomBytes(40).toString('hex');

  const sql = 'INSERT INTO users (username, password, email) VALUES ($1,$2,$3) RETURNING id;';

  return cryptPassword(password)
    .then(p => db.one(sql, [name, p, email], evt => evt.id));
}

export function findUser(params) {
  if (!params) {
    return createErrorPromise('Invalid params', 400); // Must have some params
  }

  const queryPieces = [];
  const queryParams = {};

  let query = 'SELECT * FROM users';

  if (params.email) {
    queryPieces.push('email=${email}');
    queryParams.email = params.email;
  }

  if (params.username) {
    queryPieces.push('username=${username}');
    queryParams.username = params.username;
  }

  if (queryPieces.length != 0) {
    const where = _.join(queryPieces, ' AND ');
    query += ` WHERE ${where} `;
  } else {
    return createErrorPromise('Invalid params', 400); // Must have some query pieces. Without them, it will return first user entity.
  }

  return db.one(query, queryParams);
}

export function saveAccesstoken(user, token) {
  const sql =  'INSERT INTO access_token (token, expires, user_id) VALUES (${token},${expires},${user_id});';

  return db.none(sql, {
    token: token.token,
    expires: token.expires,
    user_id: user.id,
  });
}

export function deleteAccesstokensForUser(user_id) {
  const sql = 'DELETE FROM access_token WHERE user_id=$1;';

  return db.none(sql, [user_id]);
}

export function findUserWithToken(access_token) {
  const sql = `SELECT DISTINCT u.id, u.username, u.email FROM users u \
    INNER JOIN access_token a ON a.user_id=u.id \
    WHERE a.token=$1`;

  return db.one(sql, [access_token.token]);
}
