const ALLOWED_ORIGINS = ['https://www.n-ai.org', 'https://n-ai.org', 'http://localhost:5173'];

function getCorsOrigin(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  // Reflect trusted origins; fallback to wildcard for preview/non-credentialed requests.
  return ALLOWED_ORIGINS.includes(origin) ? origin : '*';
}

function corsHeaders(event) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(event),
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

function respond(event, statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(event),
    body: JSON.stringify(body),
  };
}

function preflight(event) {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }
  return null;
}

function getQuery(event) {
  return event.queryStringParameters || {};
}

function getBody(event) {
  try {
    if (!event.body) return null;
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return null;
  }
}

module.exports = { respond, preflight, getQuery, getBody, corsHeaders };
