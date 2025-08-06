// netlify/functions/saveExport.js
// Save export metadata (with file URL) to Neon DB

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  try {
    const { filename, monthYear, generatedDate, generatedTime, status, url } = JSON.parse(event.body);
    const query = `INSERT INTO exports (filename, month_year, generated_date, generated_time, status, url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [filename, monthYear, generatedDate, generatedTime, status, url];
    const result = await pool.query(query, values);
    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.rows[0].id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save export' })
    };
  }
};
