const autoIncrement = require('mongoose-auto-increment');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

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

          // http://stackoverflow.com/a/1373724
          return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data);
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
  userSchema.pre('save', function (next) {
    setDates.bind(this)();
    hashPassword.bind(this)()
      .then(next);
  });

  function setDates() {
    const currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
      this.created_at = currentDate;
    }
    ;
  };

  function hashPassword() {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          bcrypt.hash(this.password, salt, (err, encrypted) => {
            if (err) {
              reject(err);
            } else {
              this.password = encrypted;
              resolve();
            }
          });
        }
      });
    });
  };

  return mongoose.model('User', userSchema);
}
