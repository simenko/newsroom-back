require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const socketIo = require( "socket.io" );

/**
 * App config and internal modules loading. Internal modules use dependency injection pattern between themselves, while
 * for external dependencies require() is used. 
 */
global.Debug = require('debug');
const app = express();
app.io = socketIo();
const connection = require('./common/db')();
const userModel = require('./models/user')(connection);
const storyModel = require('./models/story')(connection);
require('./common/sockets')(app.io, userModel, storyModel)
require('./common/auth')(passport, userModel);
const usersRoute = require('./routes/users')(passport, userModel);
const storiesRoute = require('./routes/stories')(passport, storyModel);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ROUTES
 */

app.use('/api/users', usersRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = process.env.DEBUG ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
