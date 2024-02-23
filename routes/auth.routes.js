const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // we use "jsonwebtoken" to create a jwt (sign jwt)
const { errorHandler } = require("../middleware/error-handling");
const User = require("../models/User.model");
require("dotenv").config();
const express = require('express')
const { isAuthenticated } = require("../middleware/authentication");
const app = express();
const saltRounds = 10;

router.post("/signup", (req, res, next) => {
  const { email, password, name } = req.body;
  if (email === "" || password === "" || name === "") {
    res
      .status(400)
      .json({ message: "Please provide the required information." });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Please provide valid email" });
    return;
  }
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: "Please provide valid password" });
    return;
  }
  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);
      return User.create({ email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      const { email, name, _id } = createdUser;
      const user = { email, name, _id };
      res.status(201).json({ user: user });
    })
    .catch((err) => {
      next({ ...err, message: "Error creating User" });
    });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res
      .status(400)
      .json({ message: "Please provide the required information." });
    return;
  }
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      const correctPassword = bcrypt.compareSync(password, foundUser.password);
      if (correctPassword) {
        const { _id, email, name } = foundUser;
        const payload = { _id, email, name };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "7h",
        });
        res.status(200).json({ authToken: authToken });
      } else {
    res.status(401).json({message: "Unable to authenticate user."})
    }
    })
    .catch((err) => {
        next({...err, message: "Error authenticating User"})
    });
});

router.get('/verify', isAuthenticated, (req, res, next) => {
    res.status(200).json(req.payload);
})

app.use(errorHandler);

module.exports = router;