import express from 'express';
import bodyParser from 'body-parser';
import * as auth from './auth';
import * as db from './db';

const app = express();
const port = process.env.PORT || 3000;

console.log(`App status: ${process.env.NODE_ENV}`);

app.use(express.static('src/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

// save url id to request body
app.param('id', (req, res, next, id) => {
  req.body.id = id;
  next();
});

app.param('user', (req, res, next, id) => {
  db.findUserById(id)
    .then(user => {
      req.user = user;  // save request target user to request
      next();
    }).catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

/*
 * Send custom error with custom status if its defined. Otherwise send 500 error as response
 */
function customOr500(err, res) {
  if (err.status) {
    res.status(err.status);
    res.send(err.message);
  } else {
    res.status(500);
    res.send('Something went wrong =(');
    console.error(err);
  }
}

/*
 * Login / logout
 */

app.post('/api/login', (req, res) => {
  auth.loginUser(req.body)
    .then(accessToken => res.send(accessToken))
    .catch(err => customOr500(err, res));
});

// log out current user
app.post('/api/logout', auth.ensureAuthorized, (req, res) => {
  db.findUserWithToken(req.accessToken)
    .then(user => auth.logoutUser(user))
    .then(() => res.sendStatus(200))
    .catch(err => customOr500(err, res));
});

app.listen(port, () => console.log(`Checklist app listening on port ${port}!`));

// export app to use it somewhere else
export default app;
