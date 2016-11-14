const debug = Debug('app:storiesRoute');

const express = require('express');

module.exports = function (passport, storyModel) {
  const router = express.Router();

  router.post('/', (req, res, next) => {
    if (req.isAuthenticated()) {
      storyModel.create(req.body, (err, story) => {
        if (err) {
          next(err);
        } else {
          res.status(201);
          res.json(story);
        }
      });
    } else {
      next({status: 401, message: 'You must be logged in to create stories'});
    }
  });

  router.get('/:_id', (req, res, next) => {
    storyModel.findById(req.params._id, (err, story) => {
      if (err) {
        next(err);
      } else if (req.isAuthenticated() || story.stage === 'published') {
        res.status(200);
        res.json(story);
      } else {
        next({ status: 404 });
      }
    });
  });

  router.get('/', (req, res, next) => {
    // TODO: limits and complex queries
    // if (req.isAuthenticated()) {
    storyModel.find({}, '_id title stage assignee locked_by created_by deadline_at created_at updated_at published_at')
      .populate('created_by', 'name')
      .populate('assignee', 'name')
      .populate('locked_by', 'name')
      .exec((err, stories) => {
        if (err) {
          next(err);
        } else {
          res.status(200);
          res.json(stories);
        }
      });
    // } else {
    //   // TODO: format published stories for public view
    //   next({ status: 404 });
    // }
  });

  router.put('/:_id', (req, res, next) => {
    storyModel.findById(req.params._id, (err, story) => {
      if (err) {
        next(err);
      } else if (req.isAuthenticated() && (
        !story.assignee
        || story.assignee === 'req.user._id'
        || req.user.role === 'editor')) {
        storyModel.update(req.body, (err, story) => {
          if (err) {
            next(err);
          } else {
            res.status(201);
            res.json(story);
          }
        });
      }
    });
  });

  router.put('/:_id', (req, res, next) => {
    storyModel.findById(req.params._id, (err, story) => {
      if (err) {
        next(err);
      } else if (req.isAuthenticated() && (req.user.role === 'editor')) {
        storyModel.findByIdAndRemove(req.params._id, (err, res) => {
          if (err) {
            next(err);
          } else {
            res.status(200);
            res.end();
          }
        });
      }
    });
  });

  router.delete('/:_id', (req, res, next) => {
    storyModel.findById(req.params._id, (err, story) => {
      if (err) {
        next(err);
      } else if (req.isAuthenticated()) {
        storyModel.findByIdAndRemove(req.params._id, (err, story) => {
          if (err) {
            next(err);
          } else {
            res.status(200);
            res.end();
          }
        });
      }
    });
  });

  return router;
}
