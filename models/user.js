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
        validator: function (data) {
          return validator.isEmail(data);
        },
        message: `{VALUE} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
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

  userSchema.pre('save', function (next, done) {
    this.updated_at = new Date();
    if (!this.created_at) {
      this.created_at = this.updated_at;
    }
    userSchema.methods.hashPassword(this.password, (err, hashedPass) => {
      if (err) {
        done(err);
      }
      this.password = hashedPass;
      next();
    });
  });

  userSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, res);
    });
  };

  userSchema.methods.hashPassword = function (password, callback) {
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) {
        callback(err);
      } else {
        callback(null, hashed);
      }
      ;
    });
  };

  return mongoose.model('User', userSchema);
}


