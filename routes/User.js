const router = require("express").Router();
let User = require("../models/User.model");
var nodemailer = require("nodemailer");
// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: "dqxbemx5c",
//   api_key: "788451982548334",
//   api_secret: "zP1s17Kmi-iY8XEeFRfBPwoTGu8",
// });

router.route("/").get((req, res) => {
  User.find()
    .then((users) => {
      return res.json({ users });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/single/:uid").get((req, res) => {
  const { uid } = req.params;
  User.findById(uid)
    .then((user) => {
      return res.json({ user });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/check-email/:email").post((req, res) => {
  const { email } = req.params;
  var random = Math.floor(Math.random() * (9999 - 1000) + 1000);
  console.log("check email");
  User.findOne({ email })
    .then((users) => {
      if (users) {
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "email",
            pass: "password",
          },
        });
        var mailOptions = {
          from: "email",
          to: email,
          subject: "Uberized Truck pin",
          text: "Pin is: " + random,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.json({
          message: "User exists",
          users,
          pin: random,
          found: true,
        });
      } else {
        return res.json({ message: "User doesnot exist", found: false });
      }
    })
    .catch((error) => {
      return res.json({ message: "User doesnot exist", error, found: false });
    });
});
router.route("/remove/:uid").delete((req, res) => {
  const { uid } = req.params;
  User.findByIdAndDelete(uid)
    .then((user) => {
      if (user) return res.json({ user, message: "User deleted successfully" });
      else return res.json({ message: "User not found by this id" });
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/update-user/:uid").post((req, res) => {
  const { uid } = req.params;
  const {
    email,
    firstname,
    lastname,
    address,
    country,
    mobile,
    position,
    isVerified,
  } = req.body;

  // console.log("data", uid, data, req.body.udata);
  User.findByIdAndUpdate(
    uid,
    {
      email,
      firstname,
      lastname,
      address,
      isVerified,
      country,
      mobile,
      position,
    },
    { new: true }
  )
    .then((user) => {
      if (user) {
        return res.json({
          user,
          message: "user updated successfully",
        });
      } else {
        return res.json({
          message: "user not updated",
        });
      }
    })
    .catch((error) => {
      return res.json({ error });
    });
});
router.route("/createaccount").post((req, res) => {
  console.log("data", req.body);
  const { email, firstname, lastname, address, country, mobile, position } =
    req.body;
  const isVerified = false;
  var random = Math.floor(Math.random() * (9999 - 1000) + 1000);

  const newUser = new User({
    firstname,
    lastname,
    email,
    isVerified,
    address,
    country,
    mobile,
    position,
  });
  newUser
    .save()
    .then((user) => {
      if (user) {
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "email",
            pass: "password",
          },
        });
        var mailOptions = {
          from: "email",
          to: email,
          subject: "Uberized Truck pin",
          text: "Pin is: " + random,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.json({
          user,
          message: "User added successfully",
          PinCode: random,
        });
      }
    })
    .catch((error) => {
      console.log("Error ===>", error);
      if (error.code === 11000) {
        res.status(409).json({ message: "Email already exists", error: error });
      } else {
        res.status(400).json({ message: "User cannot be added!", error });
      }
    });
});

router.route("/confirmemail/:uid").get((req, res) => {
  console.log("hell o");
  const { uid } = req.params;
  const isVerified = true;
  User.findByIdAndUpdate(uid, {
    isVerified,
  })
    .then((user) => {
      return res.json({ user, message: "user is verified", isVerified: true });
    })
    .catch((error) => res.status(400).json({ error }));
});
// router.route("/login").post((req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   User.findOne({ email, password })
//     .then((user) => {
//       if (user) {
//         console.log(user);
//         const {
//           _id,
//           username,
//           email,
//           image,
//           isSeller,
//           description,
//           isVerified,
//           chatId,
//         } = user;
//         console.log("id", _id);
//         const foundUser = {
//           _id,
//           username,
//           email,
//           image,
//           isSeller,
//           description,
//           isVerified,
//           chatId,
//         };

//         jwt.sign({ user }, "secretkey", (error, token) => {
//           res.json({
//             token,
//             user: foundUser,
//           });
//         });
//       } else {
//         res.status(404).json({ message: "User not found" });
//       }
//     })
//     .catch((error) => {
//       res.status(400).json({ error });
//     });
// });

router.route("/update-profile-image/:uid").post((req, res) => {
  const { uid } = req.params;
  const { data } = req.body;
  // console.log("data", uid, data, req.body.udata);
  User.findByIdAndUpdate(
    uid,
    {
      image: data,
    },
    { new: true }
  )
    .then((user) => {
      if (user) {
        return res.json({
          user,
          message: "image updated successfully",
        });
      } else {
        return res.json({
          udata,
          message: "image not updated",
        });
      }
    })
    .catch((error) => {
      return res.json({ error });
    });
});
module.exports = router;
