const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: string,
  },
  email: {
    type: string,
    required: true,
    unique: true,
    validate: {
      validator: function(data) {

        // http://stackoverflow.com/a/1373724
        return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data);
      },
      message: `${data} is not a valid email!`
    },
  },
  passowrd: {
    type: string,
    required: true
  },
  role: {
    type: string,
    enum: ['author', 'editor']
  }
});

module.exports = mongoose.model('User', userSchema);
