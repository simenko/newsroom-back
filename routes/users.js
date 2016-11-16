/* global Debug */

const debug = Debug('app:usersRoute');

const express = require('express');

const filterUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    role: user.role,
  };
};

module.exports = function (passport, userModel) {
  const router = express.Router();

  router.get('/', passport.check, (req, res, next) => {
    userModel.find({}, (err, users) => {
      if (err) return next(err);
      res.json(users.map(filterUser));
    });
  });

  router.get('/:_id', passport.check, (req, res, next) => {
    res.json(req.user);
  });

  router.post('/register', (req, res, next) => {
    userModel.create(req.body, (err, user) => {
      if (err) {
        err.status = 400;
        return next(err);
      }
      req.login(user, (err, res) => {
        if (err) return next(err);
      });
      res.status(201);
      res.json(filterUser(user));
    });
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return next({ status: 401 });
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  router.post('/logout', passport.check, (req, res, next) => {
    req.session.destroy();
    req.logout();
    // TODO: remove all edit locks initialized by this user
    res.end();
  });

  router.put('/:_id', passport.check, (req, res, next) => {
    res.sendStatus(501);
  });

  router.delete('/:_id', passport.check, (req, res, next) => {
    res.sendStatus(501);
  });

  return router;
};
