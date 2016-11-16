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
  activeStories[story].lastActivityAt = Date.now();
};

module.exports = function (io) {
  io.sockets.on('connection', (socket) => {
    socket.removeAllListeners();

    socket.on('startEditing', (storyName) => {
      socket.story = storyName;
      updateLocks(socket.story, socket.id);
      socket.join(socket.story);
    });

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
