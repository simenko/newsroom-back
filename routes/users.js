const debug = Debug('app:usersRoute')

const express = require('express');

module.exports = function (passport, userModel) {
  const router = express.Router();


  router.get('/', (req, res, next) => {
    if (!req.isAuthenticated()) {
      next({ status: 401 });
    } else {
      res.status(200);
      userModel.find({}, (err, users) => {
        if (err) {
          next(err);
        } else {
          res.status(200);
          res.json(users);
        }
      });
    }
  });

  router.get('/:_id', (req, res, next) => {
    if (!req.isAuthenticated()) {
      next({ status: 401 });
    } else {
      res.status(200);
      res.json(req.user);
    }
  });

  router.post('/register', (req, res, next) => {
    userModel.create(req.body, (err, user) => {
      if (err) {
        err.status = 400;
        next(err);
      } else {
        req.login(user, (err, res) => {
          if (err) next(err);
        });
        res.status(201);
        res.json({
          _id: user._id,
          name: user.name,
          role: user.role,
        });
      }
    });
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        next(err);
      } else {
        req.login(user, (loginErr) => {
          if (loginErr) {
            next(loginErr);
          } else {
            res.json(user);
          }
        });
      }
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
      req.session.destroy();
      req.logout();
      // TODO: remove all edit locks initialized by this user
      res.status(200);
      res.json('You have logged out');
    } else {
      next({ status: 401, message: 'You you are not logged in' });
    }
  });

  router.put('/', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(501);
      res.json('not implemented');
    } else {
      next({ status: 401, message: 'You must login to edit your account' })
    }
  });

  router.delete('/', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(501);
      res.json('not implemented');
    } else {
      next({ status: 401, message: 'You must login to delete your account' });
    }
  });

  return router;
}
