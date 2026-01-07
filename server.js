const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// Quick test route (no DB) — use this to verify public URL works
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async (req, res) => {
  try {
    if (!process.env.MYSQL_URL) {
      return res.status(500).send("Missing MYSQL_URL env var in Railway Variables.");
    }

    // Add a timeout so the request doesn't hang forever
    const connectPromise = mysql.createConnection(process.env.MYSQL_URL);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB connection timed out")), 5000)
    );

    const conn = await Promise.race([connectPromise, timeoutPromise]);

    const [rows] = await conn.query(`
      SELECT c.name, s.total_cases, s.total_deaths
      FROM Country c
      JOIN CovidStats s ON c.country_id = s.country_id
    `);

    await conn.end();

    const htmlRows = rows
      .map(
        (r) =>
          `<tr><td>${r.name}</td><td>${r.total_cases}</td><td>${r.total_deaths}</td></tr>`
      )
      .join("");

    res.send(`
      <html>
        <head><title>CM3010 COVID Stats</title></head>
        <body>
          <h1>CM3010 COVID Stats</h1>
          <p><a href="/health">Health check</a></p>
          <table border="1" cellpadding="6">
            <tr><th>Country</th><th>Total Cases</th><th>Total Deaths</th></tr>
            ${htmlRows}
          </table>
        </body>
      </html>
    `);
  } catch (e) {
    res.status(500).send(`<h1>Error</h1><pre>${e.stack || e}</pre>`);
  }
});

// IMPORTANT: bind to 0.0.0.0 and use Railway's PORT
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
