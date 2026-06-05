const express = require("express");
const { insertMetric } = require("../models/Metric");

const router = express.Router();

// SIMULATE DATA PUSH
router.post("/", async (req, res) => {
  const { name, value } = req.body;

  await insertMetric(name, value);

  res.json({ message: "Inserted" });
});

module.exports = router;