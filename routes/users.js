const express = require('express');

module.exports = function (passport, userModel) {
  const router = express.Router();

  router.post('/', (req, res, next) => {
    debug(req.app);
    userModel.create(req.body)
      .then(user => {
        res.status(201);
        res.json(user);
      })
      .catch(next);
  });

// router.get('/:id'), (req, res, next) => {
//   debug(req.body);
//   User.
// }

  return router;
}
