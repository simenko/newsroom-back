const debug = require('debug')('newsroom-back:user-model');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/newsroom');


const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(data) {

        // http://stackoverflow.com/a/1373724
        return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data);
      },
      message: `{VALUE} is not a valid email!`
    },
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['author', 'editor']
  }
});

module.exports = mongoose.model('User', userSchema);
