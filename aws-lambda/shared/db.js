// Shared DB connection pool for all Lambda functions
// npm install pg
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }, // RDS requires SSL
    });
  }
  return pool;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.n-ai.org',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function respond(statusCode, body) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

function preflight(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  return null;
}

// API Gateway HTTP API v2: event.queryStringParameters, event.body (string)
function getQuery(event) {
  return event.queryStringParameters || {};
}

function getBody(event) {
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
  } catch {
    return null;
  }
}

module.exports = { getPool, respond, preflight, getQuery, getBody };
