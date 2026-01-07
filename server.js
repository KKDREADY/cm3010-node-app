const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const conn = await mysql.createConnection(process.env.MYSQL_URL);

    const [rows] = await conn.query(`
      SELECT c.name, s.total_cases, s.total_deaths
      FROM Country c
      JOIN CovidStats s ON c.country_id = s.country_id
    `);

    await conn.end();

    const table = rows.map(r =>
      `<tr><td>${r.name}</td><td>${r.total_cases}</td><td>${r.total_deaths}</td></tr>`
    ).join("");

    res.send(`
      <h1>CM3010 COVID Stats</h1>
      <table border="1">
        <tr><th>Country</th><th>Cases</th><th>Deaths</th></tr>
        ${table}
      </table>
    `);
  } catch (e) {
    res.send(`<pre>${e}</pre>`);
  }
});

app.listen(PORT, () => console.log("Server running"));
