module.exports = function (mongoose, config) {
  mongoose.Promise = global.Promise;
  return mongoose.connect(config.dbUri);
};


