const express = require("express");
const gravatar = require("gravatar");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
//input registeration validation
const validateRegisterInput = require("../../validators/register");
//login validator
const validateLoginInput = require("../../validators/login");
const jwt = require("jsonwebtoken");
const keys = require("../../config/key");
const router = express.Router();
const User = require("../../models/User");
const bodyParser = require("body-parser");

router.get(
  "/curlog",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.send.status(400).json({ email: "Email already exist" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              res.json(user);
              console.log(user);
            })
            .catch(err => console.log(err));
        })
      });
    }
  });
});

//login //returning token
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //res.json({ msg: "success" });
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});
//return current user so will make it private
// router.get(
//   "./current",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     res.json({ msg: "success" });
//   }
// );

module.exports = router;
