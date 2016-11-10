const debug = Debug('app:storyModel')

const autoIncrement = require('mongoose-auto-increment');
const mongoose = require('mongoose');
const validator = require('validator');

module.exports = function (connection) {
  autoIncrement.initialize(connection);
  const storySchema = new mongoose.Schema({
    working_title: {
      type: String,
      required: true,
      minlength: 16,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    assets: [{
      url: {
        type: String,
        required: true,
        validate: {
          validator: function (data) {
            return validator.isURL(data);
          },
          message: `{VALUE} is not a valid URL!`,
        },
      },
      description: {
        type: String,
        maxlength: 500,
      },
    }],
    blocks: [{
      content: String,
      updated_at: Date,
      author: {
        type: Number, ref: 'User'
      },
      snapshots: [{
        content: String,
        updated_at: Date,
        author: {
          type: Number, ref: 'User'
        }
      }]
    }],
    stage: {
      type: String,
      default: 'idea',
      enum: ['idea', 'draft', 'ready to review', 'ready to publish', 'published', 'archived'],
    },
    created_by: {
      type: Number, ref: 'User'
    },
    assignee: {
      type: Number, ref: 'User'
    },
    locked_by: {
      type: Number, ref: 'User'
    },
    created_at: Date,
    updated_at: Date,
    deadline_at: Date,
    published_at: Date
  });

  storySchema.plugin(autoIncrement.plugin, 'Story');

  storySchema.pre('save', function (next, done) {
    this.updated_at = new Date();
    if (!this.created_at) {
      this.created_at = this.updated_at;
    }
    /**
     *  TODO: Possible checks:
     *  1. deadline must be in future
     *  2. Only editors can shift deadline
     *  3. Only editors can lock and unlock
     *
     */
  });

  return mongoose.model('Story', storySchema);
}


