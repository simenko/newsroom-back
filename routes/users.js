/* global Debug */

const debug = Debug('app:usersRoute');

const express = require('express');

module.exports = function (passport, userModel) {
  const router = express.Router();

  router.get('/', passport.check, (req, res, next) => {
    userModel.list((err, users) => {
      if (err) return next(err);
      res.json(users);
    });
  });

  router.get('/:_id', passport.check, (req, res, next) => {
    userModel.details(req.params._id, (err, user) => {
      if (err) return next(err);
      if (!user) return next({ status: 404 });
      res.json(user);
    });
  });

  router.post('/', (req, res, next) => {
    userModel.create(req.body, (err, user) => {
      if (err) {
        err.status = 400;
        return next(err);
      }
      res.status(201);
      res.json(user);
    });
  });

  router.put('/:_id', passport.check, (req, res, next) => {
    res.sendStatus(501);
  });

  router.delete('/:_id', passport.check, (req, res, next) => {
    res.sendStatus(501);
  });

  return router;
};
