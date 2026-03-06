function getCorsOrigin(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || '';
  // For browser clients, echo request origin to avoid preview/publish origin mismatch.
  // For non-browser requests (no Origin), fallback to wildcard.
  return origin || '*';
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
