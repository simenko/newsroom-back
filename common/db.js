const mongoose = require('mongoose');

module.exports = function () {
  mongoose.Promise = global.Promise;
  return mongoose.connect(process.env.DB_URI);
};
