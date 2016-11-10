const express = require('express');

module.exports = function (passport, userModel) {
  const router = express.Router();

  router.post('/register', (req, res, next) => {
    userModel.create(req.body, (err, res) => {
      if (err) {
        next(err);
      } else {
        req.login(user, (err, res) => {
          if (err) next (err);
        });
        res.status(201);
        res.json(user);
      }
    })
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send({ success : false, message : 'authentication failed' });
      }
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.send({ success : true, message : 'authentication succeeded' });
      });
    })(req, res, next)
  });

  router.get('/protected', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(200);
      res.json('ok')
    } else {
      next({status: 401, message: 'unauthorized'})
    }
  })

  return router;
}
