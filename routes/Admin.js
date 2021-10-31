const router = require("express").Router();
let Admin = require("../models/Admin.model");
let jwt = require("jsonwebtoken");

router.route("/add").post((req, res) => {
  const { email, password } = req.body;

  const newAdmin = new Admin({
    email,
    password,
    isVerified: true,
  });
  newAdmin
    .save()
    .then((admin) =>
      res.status(200).json({ admin, message: "Admin added successfully" })
    )
    .catch((error) => {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Admin cannot be added",
          error: "Email Already exists",
        });
      } else {
        return res
          .status(400)
          .json({ message: "Admin cannot be added", error: error });
      }
    });
});

router.route("/login").post((req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email, password })
    .then((admin) => {
      if (admin) {
        jwt.sign({ user: admin }, "secretkey", (error, token) => {
          res.json({
            token,
            admin,
          });
        });
      } else {
        res.json({
          message: "User Not Found",
        });
      }
    })
    .catch((error) => res.status(400).json("Error " + error));
});

// router.route("/withdraw-requests").get(async (req, res) => {
//   try {
//     const withdrawRequests = await WithdrawRequest.find();
//     return res.json({ withdrawRequests });
//   } catch (error) {
//     return res.json({ error });
//   }
// });

module.exports = router;
