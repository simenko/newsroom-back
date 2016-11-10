const debug = Debug('app:sockets');

module.exports = function (io, userModel) {
  io.sockets.on('connection', (socket) => {
    socket.removeAllListeners();
    let story;
    socket.on('story', (storyName) => {
      story = storyName;
      socket.join(story);
    });
    socket.on('updateVersion', (diff) => {
      io.sockets.in(story).emit('updateVersion', diff);
    });
    socket.on('editRequest', (data) => {
      io.sockets.in(story).emit('editRequest', data);
    });
    socket.on('changes', (data) => {
      io.sockets.in(story).emit('changes', data);
    });
  });
};
