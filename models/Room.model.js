const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    driverId: {
      type: String,
      required: true,
    },
    messages: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Rooms", roomSchema);
module.exports = Room;
