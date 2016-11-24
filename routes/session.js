/* global Debug */

const debug = Debug('app:sessionRoute');

const express = require('express');

module.exports = function (passport) {
  const router = express.Router();

  router.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      debug(err, user, info)
      if (err) return next(err);
      if (!user) return next({ status: 401 });
      req.login(user, err => {
        if (err) return next(err);
        delete user.__v;
        delete user.password;
        res.json(user);
      });
    })(req, res, next);
  });

  router.delete('/', passport.check, (req, res, next) => {
    req.session.destroy();
    req.logout();
    res.end();
  });

  return router;
};
