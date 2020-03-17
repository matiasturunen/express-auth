import app from '../src/server/server';
import request from 'supertest';
import { findUserWithToken, create_user } from '../src/server/db';
import { resetDatabase } from '../scripts/reset_database.js';
import * as auth from '../src/server/auth';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

const expect = chai.expect;
chai.use(chaiAsPromised);

// make user create script to think that admin is doing all the thigns
function createUser(user) {

  return create_user(
    user.username,
    user.password,
    user.email
  ).catch(err => console.log(err));
}

const user1 = {
  username: 'pekka',
  email: 'pekka@example.fi',
  password: 'peKK@',
};
const user2 = {
  username: 'ville',
  email: 'ville@example.fi',
  password: 'v1lle',
};

describe('REST API - Auth', () => {

  describe('/api/login', () => {
    before(() => resetDatabase()
      .then(() => createUser(user1))
      .then(() => createUser(user2))
      .catch(err => console.log(err))
    );

    it('Should let in with correct credentials', () =>
      request(app).post('/api/login')
        .send({ username: user1.username, password: user1.password })
        .expect(200)
    );

    it('should not let in with wrong password', () =>
      request(app).post('/api/login')
        .send({ username: 'ville', password: 'vallaton' })
        .expect(401)
    );

    it('should not let in with wrong username', () =>
      request(app).post('/api/login')
        .send({ username: 'kalle', password: 'v1lle' })
        .expect(401)
    );
  });

  describe('/api/logout', () => {
    before(() => resetDatabase()
      .then(() => createUser(user1))
      .then(() => createUser(user2))
      .catch(err => console.log(err))
    );

    it('should allow logout', () =>
      auth.loginUser({ username: user1.username, password: user1.password })
        .then(accessToken => request(app).post('/api/logout')
          .query({ accessToken: accessToken.token })
          .expect(200))
    );

    it('should not allow logout without accessToken', () =>
      request(app).post('/api/logout')
        .expect(401)
    );

    it('should not delete all accessTokens on single logout', () => {
      let user1token = '';

      return auth.loginUser({ username: user1.username, password: user1.password })
        .then(accessToken => user1token = accessToken)
        .then(() => auth.loginUser({ username: user2.username, password: user2.password }))
        .then(accessToken => request(app).post('/api/logout').query({ accessToken: accessToken }))
        .then(() => findUserWithToken(user1token))
        .then(user => expect(user).to.not.be.null);
    });
  });
});

describe('Auth unit tests:', () => {
  before(() => resetDatabase()
    .then(() => createUser(user1))
    .then(() => createUser(user2))
    .catch(err => console.log(err))
  );

  it('loginUser() should return accessToken on success', () =>
    auth.loginUser({ username: user1.username, password: user1.password })
      .then(accessToken => expect(accessToken).to.not.be.null)
  );

  it('loginUser() should return error on fail', () =>
    auth.loginUser({ username: 'itdoesnotexist', password: 'notCorrect' })
      .catch(err => expect(err).to.not.be.null)
  );

  it('findUserWithToken() should return user after login', () =>
    auth.loginUser({ username: user1.username, password: user1.password })
      .then(accessToken => findUserWithToken(accessToken))
      .then(user => expect(user).to.not.be.null)
  );

  it('logoutUser() should delete current users accessTokens', () => {
    let accessToken = '';
    return auth.loginUser({ username: user1.username, password: user1.password })
      .then(at => {
        accessToken = at;
        return at;
      })
      .then(at => findUserWithToken(accessToken))
      .then(user => auth.logoutUser(user))
      .then(() => findUserWithToken(accessToken))
      .catch(err => expect(err).to.not.be.null);
  });
});
