const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUser } = require("../models/User");
require("dotenv").config();

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser(email, hashed);

  res.json(user.rows[0]);
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userRes = await findUser(email);
  const user = userRes.rows[0];

  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

module.exports = router;