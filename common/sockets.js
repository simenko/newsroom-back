const debug = Debug('app:sockets');
const timeout = 10000;
const activeStories = {};

const updateLocks = function (story, client) {
  Object.keys(activeStories)
    .forEach((key) => {
      if (activeStories[key].lastActivityAt < Date.now() - timeout) {
        delete activeStories[key];
      }
    });
  if (!activeStories[story]) {
    activeStories[story] = { lockedBy: client };
  }
  if (activeStories[story].lockedBy === client) {
    activeStories[story].lastActivityAt = Date.now();
  }
};

module.exports = function (io, session) {
  io.use(function(socket, next){
    // Wrap the express middleware
    session(socket.request, {}, next);
  });
  io.sockets.on('connection', (socket) => {
    const username = socket.request.session.passport.user.name;
    socket.removeAllListeners();

    socket.on('joinStory', (storyName) => {
      socket.story = storyName;
      socket.join(socket.story);
    });

    socket.on('editRequest', () => {
      updateLocks(socket.story, username);
      if(activeStories[socket.story].lockedBy !== username) {
        socket.emit('lockedBy', activeStories[socket.story].lockedBy);
        socket.broadcast.to(activeStories[socket.story].lockedBy).emit('editRequest', username);
      } else {
        socket.emit('editingGranted');
      }
    });

    socket.on('stopEditing', () => {
      delete activeStories[socket.story];
    })

    socket.on('update', (diff) => {
      updateLocks(socket.story, socket.id);
      if (activeStories[socket.story].lockedBy !== socket.id) {
        socket.emit('lockedBy', activeStories[socket.story].lockedBy);
      } else {
        socket.broadcast.to(socket.story)
          .emit('changes', diff);
      }
    });
  });
};
