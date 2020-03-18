# express-auth
Barebone express app with authentication stuff predone

## How to use
Download this code and init your own git repository from it. This way your project can be separate from this project. Forking is recommended only if you are going to improve this barebone somehow.

### Things to do to get it running

 - Create postgresql database
 - set `DATABASE_URL` env var to contain your database url `postgres://user:pass@host:port/dbname`
 - set `JWT_SECRET` env var to something random and secret to keep your tokens safe. Not necessary for development
 - set `ADMIN_PASS` env var to preffered admin password. This can be used to login into the app. Good in development, in production this should be something hard to quess. If left empty, random password is generated with crypto `crypto.randomBytes(40).toString('hex')`
 - set `PORT` env var to contain the port you wish this application to use. Defaults to 3000
 - run `npm test` to see if its working
 - run `npm run reset-database` to reset database, create tables and default admin user
 - run `npm start` to start the server. Nothing special should not happen
 

## What is included
 - dotenv to manage env vars in different development environments
 - After authentication JWT is created and can be used to access the app. You can store the token however you like, cookies are recommended for web applications.
 - Tests to ensure that authorization works as intended
 - Database create and reset scripts at `scripts` folder

