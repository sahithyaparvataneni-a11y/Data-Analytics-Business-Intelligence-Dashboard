const express = require("express");
const { getMetrics } = require("../models/Metric");

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await getMetrics();
  res.json(data.rows);
});

module.exports = router;