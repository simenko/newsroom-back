debug = Debug("app:auth");

const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, userModel) {
  passport.serializeUser(function (user, callback) {
    callback(null, user.id);
  });

  passport.deserializeUser(function (id, callback) {
    userModel.findById(id, function (err, user) {
      callback(err, user);
    });
  });

  passport.use('local', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, email, password, callback) {
      userModel.findOne({'email': email}, (err, user) => {
        if (err) {
          callback(err);
        } else {
          user.checkPassword(password, (err, res) => {
            if (err) {
              callback(err);
            } else {
              callback(null, user)
            }
          });
        }
      });
    })
  );
}
