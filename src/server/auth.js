import jwt from 'jsonwebtoken';
import * as db from './db';
import { createErrorPromise, comparePassword } from './lib';
import Promise from 'bluebird';

function isEmptyStr(str) {
  return (!str || str == '');
}

function createAccesstoken(user, lifetime) {
  const timeNow = new Date();
  const expires = new Date(timeNow.getTime() + (lifetime * 1000));

  const accessToken = {
    token: jwt.sign(user, process.env.JWT_SECRET || 'b3G4o[UO;J6@f{wr'),  // changing this will render all generated tokens useless
    expires: expires,
    userId: user.id,
  };

  return db.saveAccesstoken(user, accessToken)
    .then(() => accessToken);
}

function doLoginUser(credentials) {
  return db.findUser(credentials)
    .then(user => {
      if (user) {
        return comparePassword(credentials.password, user.password)
          .then(ok => {
            if (ok) {
              return createAccesstoken(user, 82000);
            } else {
              return createErrorPromise('Invalid credentials', 401);
            }
          });
      } else {
        return createErrorPromise('Invalid credentials', 401);
      }
    })
    .catch(err => {
      if (err.message) {
        if (err.message == 'No data returned from the query.') {
          return createErrorPromise('Invalid credentials', 401);
        }
      }
      if (err.status) {
        return createErrorPromise(err.message || 'Error', err.status);
      }
      console.error(err);
      return createErrorPromise('Something went wrong', 500);
    });
}

export function loginUser(user) {
  if (!user) {
    return Promise.reject(createErrorPromise('User param cant be empty!'));
  }

  if (isEmptyStr(user.password)) {
    return Promise.reject(createErrorPromise('Password cant be empty!', 400));
  } else if (!isEmptyStr(user.email)) {
    return doLoginUser({
      email: user.email,
      password: user.password,
    });
  } else if (!isEmptyStr(user.username)) {
    return doLoginUser({
      username: user.username,
      password: user.password,
    });
  } else {
    return Promise.reject(createErrorPromise('Must enter either username or email!', 400));
  }
}

// express middleware funtion to check if auth token appears in the request
export function ensureAuthorized(req, res, next) {
  const authHeader = req.headers['Authorization'];
  if (req.query.accessToken) {
    // Token in url
    req.accessToken = req.query.accessToken;
    if (!req.accessToken.token && req.accessToken) {
      req.accessToken = { token: req.accessToken };
    }
    next();
  } else if (req.body.accessToken) {
    // Token in request body
    req.accessToken = req.body.accessToken;
    if (!req.accessToken.token && req.accessToken) {
      req.accessToken = { token: req.accessToken };
    }
    next();
  } else if (typeof authHeader !== 'undefined') {
    // Token in request header
    req.accessToken = authHeader.split(' ')[1];
    if (!req.accessToken.token && req.accessToken) {
      req.accessToken = { token: req.accessToken };
    }
    next();
  } else {
    // No token
    res.sendStatus(401);
  }
}

// log out user by removing all accesstokens
export function logoutUser(user) {
  if (!user) {
    return createErrorPromise('User must exist!');
  }

  return db.deleteAccesstokensForUser(user.id);
}
