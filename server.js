const express = require("express");
const cors = require("cors");
// const io = require("./socket");

const http = require("http");
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://talal:Revengeg2@deliever-it.fqvgy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).catch(
  ex => {
    console.log(ex)
  }
)

const app = express();
const port = process.env.PORT || 5000;
let clients = [];

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongoose Connection established");
});

app.use(cors());
app.use(express.json());
const userRouter = require("./routes/User");
const vehicleRouter = require("./routes/Vehicle");
const adminRouter = require("./routes/Admin");
const rideRouter = require("./routes/Rides");
const roomRouter = require("./routes/Room");

app.use("/api/vehicle", vehicleRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ride", rideRouter);
app.use("/api/room", roomRouter);
const server = http.createServer(app);
const io = require("./socket.js");
io.connect(server);
let count = [];
let rides = [];
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("storeClientInfo", function (data) {
    var clientInfo = new Object();
    console.log("dataa", data);
    clientInfo.user = data.user;
    clientInfo.clientSocket = socket;

    let userAlreadyExists = clients.find((c, index) => {
      // console.log("index ", index);
      if (c.user._id === data?.user._id) {
        count.push(index);
        return true;
      } else {
        return false;
      }
    });
    console.log("User exists then true ", userAlreadyExists);
    if (!userAlreadyExists) {
      clients.push(clientInfo);
    } else {
      console.log("updated");
      clients[count[0]] = clientInfo;
    }
    console.log("It starts here ", clients, "THis is our cients array");
  });
  socket.on("setLocationData", function (data) {
    rides.push(data);

    // console.log("clients", clients);
    clients.map((single) => {
      // console.log("single", single);
      if (single.user.position === "driver") {
        single.clientSocket.emit("locationRequest", data);
      }
    });
  });
  socket.on("currentLocation", function (data) {
    // console.log("current location", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.client._id) {
        single.clientSocket.emit("driverCurrentLocation", data);
      }
    });
  });
  socket.on("onPickupLocation", function (data) {
    // console.log("on pickup data", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.client._id) {
        single.clientSocket.emit("driverPickupLocation", data);
      }
    });
  });
  socket.on("startRoute", function (data) {
    // console.log("startRoute", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.client._id) {
        single.clientSocket.emit("getStarted", data);
      }
    });
  });
  socket.on("reachedDestination", function (data) {
    // console.log("reachedDestination", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.client._id) {
        single.clientSocket.emit("DriverDestination", data);
      }
    });
  });
  socket.on("completeRide", function (data) {
    // console.log("completeRide", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.client._id) {
        single.clientSocket.emit("completeReq", data);
      }
    });
  });
  socket.on("clientPickupAccepted", function (data) {
    console.log("clientPickupAccepted", data);

    clients.map((single) => {
      // console.log("single", single);
      if (single.user._id === data.driver._id) {
        console.log("found driver");
        single.clientSocket.emit("startDestination", data);
      }
    });
  });
  socket.on("handleCancel", function (data) {
    console.log("cancel", data);

    clients.map((single) => {
      // console.log("single", single);
      if (
        single.user._id === data.driver._id ||
        single.user._id === data.client._id
      ) {
        // console.log("found driver");
        single.clientSocket.emit("isCancelled", data);
      }
    });
    rides = [];
  });
  socket.on("acceptRequest", function (data) {
    let check = false;
    // console.log("id is ", data);
    rides.map((single, index) => {
      // console.log("single", single);
      if (single.id === data.details.id && !single.accepted) {
        rides[index].accepted = true;
        for (let i = 0; i < clients.length; i++) {
          if (
            clients[i]?.user._id === data?.details?.driver?._id ||
            clients[i]?.user._id === data?.details?.client?._id
          ) {
            // console.log("details here", clients[i]?.user);
            clients[i].clientSocket.emit("startRide", { start: true, data });
            // console.log("after");
          } else {
            single.clientSocket.emit("startRide", { start: false });
          }
        }
        check = true;
      }
    });
    // if (!check) {
    //   single.clientSocket.emit("startRide", { start: false });
    // }
  });
  socket.on("confirmPickup", function (data) {
    // console.log("lo1cationData", data);
    clients.map((single) => {
      // console.log("single", single);
      if (single.user.position === "driver") {
        // console.log("sent");
        single.clientSocket.emit("locationRequest", data);
      }
    });
  });
  socket.on("sendMessage", (data) => {
    const { recieverId, message } = data;
    clients.map((single) => {
      if (single.user._id === recieverId) {
        single.clientSocket.emit("messageRecieved", data);
      }
    });
  });
  socket.on("disconnect", function (data) {
    for (var i = 0, len = clients.length; i < len; ++i) {
      var c = clients[i];

      if (c.clientSocket.id == socket.id) {
        clients.splice(i, 1);
        break;
      }
    }
    console.log("client disconnected", data, clients);
  });
});

try {
  //   io.connect(server);
  //   io.on("connect", (socket) => {
  //     console.log("New Socket connected ", socket.id, clients);
  //     socket.on("storeClientInfo", function (data) {
  //       var clientInfo = new Object();
  //       clientInfo.userId = data.userId;
  //       clientInfo.clientId = socket.id;
  //       let userAlreadyExists = clients.find((c) => {
  //         if (c.userId === data.userId) {
  //           return true;
  //         } else {
  //           return false;
  //         }
  //       });
  //       console.log("User exists then true ", userAlreadyExists);
  //       if (!userAlreadyExists) {
  //         clients.push(clientInfo);
  //       }
  //       console.log("It starts here ", clients, "THis is our cients array");
  //     });
  //     socket.emit("test", { data: "hello from server " });
  //     socket.on("follow-user-notification", (data) => {
  //       const { userId, followingId } = data;
  //       const socketIdOfUserBeingFollowed = clients.find(
  //         (client) => client.userId === followingId
  //       );
  //       if (!socketIdOfUserBeingFollowed) {
  //         console.log(
  //           "User not currently connected ",
  //           socketIdOfUserBeingFollowed
  //         );
  //         return;
  //       }
  //       socket
  //         .to(socketIdOfUserBeingFollowed.clientId)
  //         .emit("someone-followed-you", userId);
  //     });
  //     socket.on("message-notification", (data) => {
  //       console.log("message", data.room.messages);
  //       const { senderId, recieverId, room } = data;
  //       const socketIdOfReciever = clients.find(
  //         (client) => client.userId === recieverId
  //       );
  //       if (!socketIdOfReciever) {
  //         const emailNeedToBeSent = emailReceiverClients.find(
  //           (client) => client === recieverId
  //         );
  //         if (!emailNeedToBeSent) {
  //           sendEmail(
  //             recieverId,
  //             senderId,
  //             data.room.messages[data.room.messages.length - 1].body.value
  //           );
  //           emailReceiverClients.push(recieverId);
  //         }
  //         console.log("email receiver", emailReceiverClients);
  //         console.log("User not currently connected ", socketIdOfReciever);
  //         return;
  //       } else {
  //         console.log("Socket event trigred");
  //         socket
  //           .to(socketIdOfReciever.clientId)
  //           .emit("someone-sent-a-message", { senderId, room });
  //       }
  //     });
  //     socket.on("disconnect", function (data) {
  //       for (var i = 0, len = clients.length; i < len; ++i) {
  //         var c = clients[i];
  //         if (c.clientId == socket.id) {
  //           clients.splice(i, 1);
  //           break;
  //         }
  //       }
  //       console.log("client disconnected", data, clients);
  //     });
  //   });
  //   console.log("bahtreen");
} catch (error) {
  // console.log("Socekt error ", error);
}

server.listen(port, () => {
  console.log("Socket listening on port : ", port);
});
