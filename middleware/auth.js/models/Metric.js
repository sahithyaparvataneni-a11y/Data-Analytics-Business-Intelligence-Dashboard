const pool = require("../db");

const insertMetric = async (name, value) => {
  return await pool.query(
    "INSERT INTO metrics (name, value) VALUES ($1, $2)",
    [name, value]
  );
};

const getMetrics = async () => {
  return await pool.query(
    "SELECT * FROM metrics ORDER BY created_at DESC LIMIT 50"
  );
};

module.exports = { insertMetric, getMetrics };