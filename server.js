const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pool = require("./db");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================
   REAL API: GET METRICS
========================= */
app.get("/api/metrics", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM metrics ORDER BY created_at DESC LIMIT 20");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   INSERT NEW METRIC
========================= */
app.post("/api/metrics", async (req, res) => {
  const { revenue, users, orders } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO metrics (revenue, users, orders) VALUES (?, ?, ?)",
      [revenue, users, orders]
    );
    const [newRow] = await pool.query("SELECT * FROM metrics WHERE id = ?", [result.insertId]);
    res.json(newRow[0]);
    io.emit("new-metric", newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADVANCED REAL-TIME ENGINE
========================= */
setInterval(async () => {
  try {
    const [metricsSummary] = await pool.query(
      `SELECT 
        SUM(revenue) AS total_revenue, 
        SUM(users) AS total_users, 
        SUM(orders) AS total_orders,
        IFNULL(SUM(revenue) / NULLIF(SUM(orders), 0), 0) AS avg_order_value
       FROM metrics`
    );

    const [chartTimeline] = await pool.query(
      "SELECT revenue, users, orders, created_at FROM metrics ORDER BY created_at DESC LIMIT 10"
    );

    const data = metricsSummary[0];

    io.emit("metrics", {
      totals: {
        revenue: data.total_revenue || 0,
        users: data.total_users || 0,
        orders: data.total_orders || 0,
      },
      analytics: {
        avgOrderValue: parseFloat(data.avg_order_value).toFixed(2)
      },
      timeline: chartTimeline.reverse(),
      time: new Date()
    });
  } catch (err) {
    console.log("Analytics Engine Error:", err.message);
  }
}, 3000);
/* ==========================================================
   NEW ADVANCED FEATURE: DATA IMPORT FROM MULTIPLE SOURCES
========================================================== */
app.post("/api/metrics/import", async (req, res) => {
  const { source } = req.body;
  
  // Transform and normalize payloads based on varying vendor parameters
  let revenueVal = 0, userAdjustment = 0, orderAdjustment = 0;
  
  if (source === 'POS_SYSTEM') {
    // Simulating mapping flat tabular file records
    revenueVal = Math.floor(Math.random() * 8000) + 2000;
    userAdjustment = Math.floor(Math.random() * 5);
    orderAdjustment = Math.floor(Math.random() * 4) + 1;
  } else if (source === 'SHOPIFY_API') {
    // Simulating web hook event tracking values
    revenueVal = Math.floor(Math.random() * 15000) + 5000;
    userAdjustment = Math.floor(Math.random() * 12) + 2;
    orderAdjustment = Math.floor(Math.random() * 8) + 2;
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO metrics (revenue, users, orders) VALUES (?, ?, ?)",
      [revenueVal, userAdjustment, orderAdjustment]
    );
    
    const [newRow] = await pool.query("SELECT * FROM metrics WHERE id = ?", [result.insertId]);
    res.json(newRow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   NEW ADVANCED FEATURE: EXPORTABLE DATA REPORTS
========================================================== */
app.get("/api/metrics/export", async (req, res) => {
  const { format } = req.query;

  try {
    const [rows] = await pool.query("SELECT id, revenue, users, orders, created_at FROM metrics ORDER BY created_at DESC");

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=BI_Report.json");
      return res.send(JSON.stringify(rows, null, 2));
    } 
    
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=BI_Report.csv");

      // Construct a raw string matrix matching table schemas
      let csvHeader = "ID,Revenue,Users,Orders,Timestamp\n";
      let csvRows = rows.map(r => `${r.id},${r.revenue},${r.users},${r.orders},"${r.created_at}"`).join("\n");
      
      return res.send(csvHeader + csvRows);
    }

    res.status(400).json({ error: "Unsupported file extraction formatting criteria applied." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 BI System running on port", PORT);
});
