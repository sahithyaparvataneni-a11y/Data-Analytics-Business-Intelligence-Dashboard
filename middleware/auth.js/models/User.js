const pool = require("../db");

const createUser = async (email, password) => {
  return await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, password]
  );
};

const findUser = async (email) => {
  return await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
};

module.exports = { createUser, findUser };