const router = require("express").Router();
const User = require("../models/User.model");
let Vehicle = require("../models/Vehicles.model");
router.route("/").get((req, res) => {
  Vehicle.find()
    .then((users) => {
      return res.json({ users });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/add-vehicle").post((req, res) => {
  const { service, brand, image, model, manufacturer, number, color, userId } =
    req.body;
  console.log(
    "service",
    service,
    brand,
    model,
    manufacturer,
    number,
    color,
    userId
  );
  let isAvailable = true;
  const newVehicle = new Vehicle({
    service,
    brand,
    model,
    manufacturer,
    number,
    image,
    color,
    userId,
  });
  console.log("new vehicle", newVehicle);
  newVehicle
    .save()
    .then((vehicle) => {
      console.log("vehicle", vehicle);
      if (vehicle) {
        User.findByIdAndUpdate(userId, {
          isAvailable,
        })
          .then((user) => {
            return res.json({
              vehicle,
              message: "Vehicle added successfully",
              user,
            });
            // return res.json({ user, message: "user is verified" });
          })
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      console.log("error", error);
      res.json({ message: "Vehicle not added", error: error });
    });
});
router.route("/get-vehicles/:uid").post((req, res) => {
  const { uid } = req.params;
  Vehicle.find({ userId: uid })
    .then((vehicles) => {
      return res.json({ vehicles });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
module.exports = router;
