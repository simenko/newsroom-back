const passportSocketIo = require('passport.socketio');

const debug = Debug('app:sockets');
const timeout = 10000;
const activeStories = {};

const updateLocks = function (story, user) {
  Object.keys(activeStories)
    .forEach((key) => {
      if (activeStories[key].lastActivityAt < Date.now() - timeout) {
        delete activeStories[key];
      }
    });
  if (!activeStories[story]) {
    activeStories[story] = { lockedBy: user };
  }
  if (activeStories[story].lockedBy === user) {
    activeStories[story].lastActivityAt = Date.now();
  }
};

module.exports = function (io, session, mongoStore, passport, storyModel) {
  io.use((socket, next) => {
    session(socket.request, {}, next);
  });
  io.use(passportSocketIo.authorize({
    secret: process.env.SESSION_SECRET,
    store: mongoStore,
    success: (data, accept) => accept(),
    fail: (data, message, error, accept) => {
      if (error) {
        throw new Error(message);
      }
      debug('failed connection to socket.io:', message);
      if (error) {
        accept(new Error(message));
      }
    },
  }));

  io.sockets.on('connection', (socket) => {
    const user = {
      id: socket.id,
      name: socket.request.session.passport.user.name,
      role: socket.request.session.passport.user.role,
    };
    socket.removeAllListeners();

    socket.on('joinStory', (storyName) => {
      socket.story = storyName;
      socket.join(socket.story);
    });

    socket.on('editRequest', () => {
      updateLocks(socket.story, user);
      if (activeStories[socket.story].lockedBy.name !== user.name) {
        socket.emit('lockedBy', activeStories[socket.story].lockedBy.name);
        socket.broadcast.to(activeStories[socket.story].lockedBy.id).emit('editRequest', user.name);
      } else {
        socket.emit('editingGranted');
      }
    });

    socket.on('stopEditing', () => {
      delete activeStories[socket.story];
    })

    socket.on('update', (diff) => {
      updateLocks(socket.story, user);
      if (activeStories[socket.story].lockedBy.name !== user.name) {
        socket.emit('lockedBy', activeStories[socket.story].lockedBy.name);
      } else {
        storyModel.updateStory(diff._id, diff, user, (err, updatedStory) => {
          if (err) {
            socket.emit('fail', err);
            return;
          }
          socket.broadcast.to(socket.story)
            .emit('changes', updatedStory);
        });
      }
    });
  });
};
