const ALLOWED_ORIGINS = [
  'https://n-ai.org',
  'https://www.n-ai.org',
  'http://localhost:5173',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any Lovable preview/publish origin
  if (origin.endsWith('.lovableproject.com') || origin.endsWith('.lovable.app')) return true;
  return false;
}

function getCorsOrigin(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  if (isAllowedOrigin(origin)) return origin;
  // Non-browser requests (no Origin header) get wildcard; unknown origins get first allowed
  return origin ? ALLOWED_ORIGINS[0] : '*';
}

function corsHeaders(event) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(event),
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-requested-with',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
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
