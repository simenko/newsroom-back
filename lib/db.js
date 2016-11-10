const mongoose = require('mongoose');

module.exports = function () {
  mongoose.Promise = global.Promise;
  return mongoose.connect(config.dbUri);
};


