/* global Debug */

const debug = Debug('app:storiesRoute');

const express = require('express');

module.exports = function (passport, storyModel) {
  const router = express.Router();

  router.post('/', passport.check, (req, res, next) => {
    storyModel.create(req.body, (err, story) => {
      if (err) return next(err);
      res.status(201);
      res.json(story);
    });
  });

  router.get('/', (req, res, next) => {
    storyModel.getPublishedStoriesContent((err, stories) => {
      if (err) return next(err);
      res.json(stories);
    });
  });


  router.get('/metadata', passport.check, (req, res, next) => {
    storyModel.getStoriesMetadata((err, stories) => {
      if (err) return next(err);
      res.json(stories);
    });
  });

  router.get('/details/:_id', passport.check, (req, res, next) => {
    storyModel.getFullStory(req.params._id, (err, story) => {
      if (err) return next(err);
      if (!story) return next({ status: 404 });
      res.json(story);
    });
  });

  router.get('/:_id', (req, res, next) => {
    storyModel.getPublishedStoryContent(req.params._id, (err, story) => {
      if (err) return next(err);
      if (!story) return next({ status: 404 });
      res.json(story);
    });
  });

  router.put('/:_id', passport.check, (req, res, next) => {
    delete req.body._id;
    req.body.updated_at = Date.now();
    storyModel.findOneAndUpdate(
      { _id: req.params._id },
      req.body,
      { runValidators: true, new: true },
      (err, updatedStory) => {
        if (err) return next(err);
        if (!updatedStory) return next({ status: 404 });
        res.json(updatedStory);
      });
  });

  router.delete('/:_id', passport.check, (req, res, next) => {
    storyModel.findByIdAndRemove(req.params._id, (err, story) => {
      if (err) return next(err);
      if (!story) return next({ status: 404 });
      res.end();
    });
  });

  return router;
};
