/* global Debug */

const debug = Debug('app:storyModel');

const autoIncrement = require('mongoose-auto-increment');
const mongoose = require('mongoose');

module.exports = function (connection) {
  autoIncrement.initialize(connection);
  const storySchema = new mongoose.Schema({
    title: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: String,
    },
    stage: {
      type: String,
      default: 'idea',
      enum: ['idea', 'draft', 'ready to review', 'ready to publish', 'published', 'archived'],
    },
    created_by: {
      type: Number,
      ref: 'User',
      required: true,
    },
    locked_by: {
      type: Number, ref: 'User'
    },
    created_at: Date,
    updated_at: Date,
    published_at: Date
  });

  storySchema.plugin(autoIncrement.plugin, 'Story');

  storySchema.pre('save', function (next, callback) {
    this.updated_at = new Date();
    if (!this.created_at) {
      this.created_at = this.updated_at;
    }
    next();
    /**
     *  TODO: Possible checks:
     *  1. deadline must be in future
     *  2. Only editors can shift deadline
     *  3. Only editors can lock and unlock
     *
     */
  });

  storySchema.pre('update', function (next, callback) {
    this.update({}, { $set: { updatedAt: new Date() } });
    next();
    /**
     *  TODO: Possible checks:
     *  1. deadline must be in future
     *  2. Only editors can shift deadline
     *  3. Only editors can lock and unlock
     *
     */
  });

  storySchema.statics.getPublishedStoriesContent = function (callback) {
    return this.find({ stage: 'published' }, '_id title content assignee published_at')
      .populate('assignee', 'name')
      .exec((err, stories) => {
        if (err) return callback(err);
        return callback(null, stories);
      });
  };

  storySchema.statics.getPublishedStoryContent = function (_id, callback) {
    return this.findOne({ _id, stage: 'published' }, '_id title content created_by published_at')
      .populate('created_by', 'name')
      .exec((err, story) => {
        if (err) return callback(err);
        return callback(null, story);
      });
  };

  storySchema.statics.getStoriesMetadata = function (callback) {
    return this.find({}, '-content -history')
      .populate('created_by', 'name')
      .populate('locked_by', 'name')
      .exec((err, stories) => {
        if (err) return callback(err);
        return callback(null, stories);
      });
  };

  storySchema.statics.getFullStory = function (_id, callback) {
    return this.findById(_id)
      .populate('created_by', 'name')
      .populate('locked_by', 'name')
      .exec((err, story) => {
        if (err) return callback(err);
        return callback(null, story);
      });
  };

  storySchema.statics.updateStory = function (_id, data, user, callback) {
    if (data.locked_by && user.role !== 'editor') return callback({ status: 403 });
    this.findById(_id, (err, story) => {
      if (err) return callback(err);
      if (!story) return callback({ status: 404 });
      delete data._id;
      data.updated_at = Date.now();
      if (data.stage === 'published' && !story.published_at) {
        data.published_at = data.updated_at;
      }
      if (data.locked_by) data.locked_by = data.locked_by._id;
      story.update(data,
        { runValidators: true, new: true },
        (err, updatedStory) => {
          if (err) return callback(err);
          if (!updatedStory) return next({ status: 500 });
          return callback(null, updatedStory);
        });
    });
  };

  return mongoose.model('Story', storySchema);
};
