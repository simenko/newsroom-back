/* global Debug */

debug = Debug('app:auth');

const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, userModel) {
  passport.serializeUser((user, callback) => {
    callback(null, user.id);
  });

  passport.deserializeUser((id, callback) => {
    userModel.findById(id, (err, user) => {
      callback(err, user);
    });
  });

  passport.use('local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, (req, email, password, callback) => {
      userModel.findOne({ email }, (err, user) => {
        if (err) return callback(err);
        if (!user) return callback({ status: 401 });
        user.checkPassword(password, (err, res) => {
          if (err) return callback(err);
          return callback(null, user);
        });
      });
    })
  );

  passport.check = (req, res, next) => {
    if (!req.isAuthenticated()) return next({ status: 401 });
    return next();
  };
};
