const debug = require('debug')('newsroom-back:users-route');

const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.post('/', (req, res, next) => {
  debug(req.body)
  User.create(req.body)
    .then(user => {
      res.status(201);
      res.json(user);
    })
    .catch(next);
  });

module.exports = router;
