/* global Debug */

const debug = Debug('app:userModel');

const autoIncrement = require('mongoose-auto-increment');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');

module.exports = function (connection) {
  autoIncrement.initialize(connection);
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator(data) {
          return validator.isEmail(data);
        },
        message: '{VALUE} is not a valid email!',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 1,
    },
    role: {
      type: String,
      default: 'author',
      enum: ['author', 'editor'],
    },
    created_at: Date,
    updated_at: Date,
  });

  userSchema.plugin(autoIncrement.plugin, 'User');

  userSchema.pre('save', function (next, callback) {
    this.updated_at = new Date();
    if (!this.created_at) {
      this.created_at = this.updated_at;
    }
    userSchema.methods.hashPassword(this.password, (err, hashedPass) => {
      if (err) return callback(err);
      this.password = hashedPass;
      return next();
    });
  });

  userSchema.statics.list = function (callback) {
    return this.find({}, '_id name role', (err, users) => {
      if (err) return callback(err);
      return callback(null, users);
    });
  };

  userSchema.statics.details = function (_id, callback) {
    return this.findOne({ _id }, '-__v -password', (err, user) => {
      if (err) return callback(err);
      return callback(null, user);
    });
  };

  userSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, res) => {
      if (err) return callback(err);
      if (!res) return callback({ status: 401 });
      return callback(null, res);
    });
  };

  userSchema.methods.hashPassword = function (password, callback) {
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) return callback(err);
      return callback(null, hashed);
    });
  };

  return mongoose.model('User', userSchema);
};
