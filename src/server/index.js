// Load enviroment variables from the file, if the app status is not production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
require('babel-register');
require('./server.js');
