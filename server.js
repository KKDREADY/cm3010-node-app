const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => res.send("OK"));

app.get("/", async (req, res) => {
  try {
    if (!process.env.MYSQL_URL) return res.status(500).send("Missing MYSQL_URL");

    const conn = await mysql.createConnection(process.env.MYSQL_URL);
    const [rows] = await conn.query(`
      SELECT c.name, s.total_cases, s.total_deaths
      FROM Country c
      JOIN CovidStats s ON c.country_id = s.country_id
    `);
    await conn.end();

    res.send(`<h1>CM3010 COVID Stats</h1><pre>${JSON.stringify(rows, null, 2)}</pre>`);
  } catch (e) {
    res.status(500).send(`<pre>${e.stack || e}</pre>`);
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
