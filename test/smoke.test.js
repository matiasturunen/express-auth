import app from '../src/server/server.js';
import request from 'supertest';

describe('Server', () => {
  it('Should start up', () =>
    request(app).get('/')
      .expect(200)
  );
});
