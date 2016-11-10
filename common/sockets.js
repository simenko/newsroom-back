debug = Debug('app:sockets');

module.exports = function (io, userModel) {
  debug(io);
  io.sockets.on('connection', (socket) => {
    socket.removeAllListeners();
    let room;
    socket.on('room', (roomName) => {
      room = roomName;
      socket.join(room);
    });
    socket.on('updateVersion', (diff) => {
      io.sockets.in(room).emit('updateVersion', diff);
    });
    socket.on('editRequest', (data) => {
      io.sockets.in(room).emit('editRequest', data);
    });
    socket.on('changes', (data) => {
      io.sockets.in(room).emit('changes', data);
    });
  });
};
