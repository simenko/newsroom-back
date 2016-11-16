require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const socketIo = require('socket.io');
const MongoStore = require('connect-mongo')(session);

/**
 * App config and internal modules loading.
 */
global.Debug = require('debug');

const app = express();
app.io = socketIo();
const connection = require('./common/db')();
const userModel = require('./models/user')(connection);
const storyModel = require('./models/story')(connection);
require('./common/sockets')(app.io, userModel, storyModel);
require('./common/auth')(passport, userModel);
const usersRoute = require('./routes/users')(passport, userModel);
const storiesRoute = require('./routes/stories')(passport, storyModel);

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.disable('etag');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  store: new MongoStore({ mongooseConnection: connection.connection }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


/**
 * ROUTES
 */
app.use('/', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER_URI);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


app.use('/api/users', usersRoute);
app.use('/api/stories', storiesRoute);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.DEBUG ? err : {};
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
