const router = require("express").Router();
const User = require("../models/User.model");
let Room = require("../models/Room.model");

router.route("/").get((req, res) => {
  Room.find()
    .then((room) => {
      return res.json({ room });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/create").post(async (req, res) => {
  try {
    // console.log("\n\n\n body in create => ", req.body);

    const { driverId, clientId } = req.body;
    if (!driverId)
      return res.status(505).json({ message: "driver id is required" });
    if (!clientId)
      return res.status(505).json({ message: "client id is required" });
    const roomExist = await Room.findOne({
      driverId: driverId,
      clientId: clientId,
    });
    if (roomExist)
      return res.status(200).json({ message: "room exist", room: roomExist });

    const room = await Room.create({ driverId, clientId });
    if (room)
      return res
        .status(200)
        .json({ message: "Room created successfully", room });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
});

router.route("/message").post(async (req, res) => {
  try {
    console.log("\n\n\n body in message => ", req.body);

    const { roomId, message, recieverId } = req.body;
    if (!roomId)
      return res.status(400).json({ message: "room id is required" });
    if (!message)
      return res.status(400).json({ message: "message is required" });
    if (!recieverId)
      return res.status(400).json({ message: "reciever id is required" });

    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $push: { messages: { text: message, recieverId } },
      },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    // await room.messages.push({ text: message, recieverId });
    return res.status(200).json([room]);
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
});
module.exports = router;
