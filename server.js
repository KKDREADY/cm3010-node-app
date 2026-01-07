const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    if (!process.env.MYSQL_URL) {
      return res.status(500).send("Missing MYSQL_URL env var in Railway Variables.");
    }

    const conn = await mysql.createConnection(process.env.MYSQL_URL);

    const [rows] = await conn.query(`
      SELECT c.name, s.total_cases, s.total_deaths
      FROM Country c
      JOIN CovidStats s ON c.country_id = s.country_id
    `);

    await conn.end();

    const htmlRows = rows.map(r =>
      `<tr><td>${r.name}</td><td>${r.total_cases}</td><td>${r.total_deaths}</td></tr>`
    ).join("");

    res.send(`
      <html>
        <head><title>CM3010 COVID Stats</title></head>
        <body>
          <h1>CM3010 COVID Stats</h1>
          <table border="1" cellpadding="6">
            <tr><th>Country</th><th>Total Cases</th><th>Total Deaths</th></tr>
            ${htmlRows}
          </table>
        </body>
      </html>
    `);
  } catch (e) {
    res.status(500).send(`<pre>${e.stack || e}</pre>`);
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
