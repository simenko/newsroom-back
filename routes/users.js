const debug = Debug('app:usersRoute')

const express = require('express');

module.exports = function (passport, userModel) {
  const router = express.Router();

  router.post('/register', (req, res, next) => {
    userModel.create(req.body, (err, user) => {
      if (err) {
        next(err);
      } else {
        req.login(user, (err, res) => {
          if (err) next(err);
        });
        res.status(201);
        res.json(user);
      }
    })
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
            res.json({authenticated: true});
          }
        });
      }
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
      req.logout();
      // TODO: remove all edit locks initialized by this user
      res.status(200);
      res.json('You have logged out')
    } else {
      next({ status: 401, message: 'You you are not logged in' });
    }
  });

  router.put('/:id', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(501);
      res.json('not implemented');
    } else {
      next({status: 401, message: 'You must login to edit your account'})
    }
  });

  router.delete('/:id', (req, res, next) => {
    if (req.isAuthenticated() && (req.params.id === req.user._id)) {
      res.status(501);
      res.json('not implemented');
    } else {
      next({ status: 401, message: 'You must login to delete your account' });
    }
  });

  return router;
}
