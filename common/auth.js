debug = Debug("app:auth");

const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, userModel) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
      done(err, user);
    });
  });
  passport.use('local', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, email, password, done) {
      userModel.findOne({'email': email}, function (err, user) {
        if (err)
          return done(err);
        if (!user)
          return done(null, false);
        if (!user.validPassword(password))
          return done(null, false);
        return done(null, user);
      });
    }));
}
