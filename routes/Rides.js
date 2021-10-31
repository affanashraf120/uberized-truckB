const router = require("express").Router();
let Rides = require("../models/Rides.model");
router.route("/").get((req, res) => {
  Rides.find()
    .then((rides) => {
      return res.json({ rides });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/single/:uid").get((req, res) => {
  const uid = req.params.uid;
  Rides.find()
    .or([{ "client._id": uid }, { "driver._id": uid }])
    .then((rides) => {
      // console.log("order", order, sellerId);
      if (rides) {
        return res.json({ rides, message: "Rides found" });
      } else {
        return res.json({ message: "No Rides found" });
      }
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/remove/:rid").delete((req, res) => {
  const { rid } = req.params;
  Rides.findByIdAndDelete(rid)
    .then((ride) => {
      if (ride) return res.json({ ride, message: "Ride deleted successfully" });
      else return res.json({ message: "Ride not found by this id" });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/changestatus/:rid").post((req, res) => {
  const { rid } = req.params;
  const { status } = req.body;
  console.log("status", status, rid);
  Rides.findByIdAndUpdate(
    rid,
    {
      status,
    },
    { new: true }
  )
    .then((ride) => {
      return res.json({ ride, message: "ride updated succussfully" });
    })
    .catch((error) => res.json({ error }));
});
router.route("/addreview/:rid").post((req, res) => {
  const { rid } = req.params;
  const { review } = req.body;
  console.log("review", review, rid);
  Rides.findByIdAndUpdate(
    rid,
    {
      review,
    },
    { new: true }
  )
    .then((ride) => {
      return res.json({ ride, message: "ride updated succussfully" });
    })
    .catch((error) => res.json({ error }));
});
router.route("/addRide").post((req, res) => {
  const { uid } = req.params;
  const { pickup, destination, distance, amount, driver, client } = req.body;
  var status = "Enroute pickup";
  const newRide = new Rides({
    pickup,
    destination,
    distance,
    amount,
    driver,
    client,
    status,
  });
  newRide
    .save()
    .then((ride) => {
      if (ride) {
        console.log("rides", ride);
        return res.json({ ride, message: "ride added successfully" });
      } else {
        return res.json({ message: "ride not added" });
      }
    })
    .catch((error) => {
      return res.json({ error });
    });
  // console.log("data", uid, data, req.body.udata);
});

module.exports = router;
