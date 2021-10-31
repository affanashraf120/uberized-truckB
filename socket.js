var socketIO = require("socket.io");
var io = null;

module.exports = {
  connect: function (server) {
    io = socketIO(server, {
      serveClient: false,
      // below are engine.IO options
      origins: "*:*",
      transports: ["polling"],
      cookie: false,
    });
  },
  emit: function (event, values) {
    if (io) {
      io.emit(event, values);
    }
  },
  on: function (event, callBack) {
    if (io) {
      io.on(event, (socket) => {
        callBack(socket);
        // socket.join('')
        // console.log('data soc', data)
      });
    }
  },
};
