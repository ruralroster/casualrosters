/**
 * Google Cloud Run - CORS Proxy for Rural Rosters
 * 
 * Deployed as a Cloud Run service via Cloud Build
 * Accepts POST requests from GitHub Pages
 * Forwards to Apps Script backend with full CORS support
 */

const https = require('https');
const http = require('http');

// UPDATE THIS with your Apps Script deployment URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';

// Create HTTP server for Cloud Run
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Set CORS headers FIRST, before anything else
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS (preflight) request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    res.writeHead(204);
    res.end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    console.log(`Rejecting ${req.method} request`);
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Collect request body
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Request error: ' + err.toString() }));
  });

  req.on('end', () => {
    console.log('Request body:', body);
    
    try {
      const requestBody = JSON.parse(body);
      
      // Forward to Apps Script
      forwardToAppsScript(requestBody, (error, response) => {
        if (error) {
          console.error('Error forwarding to Apps Script:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Proxy error: ' + error.toString() }));
          return;
        }
        
        console.log('Sending response:', response);
        res.writeHead(200);
        res.end(JSON.stringify(response));
      });
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON: ' + err.toString() }));
    }
  });
});

function forwardToAppsScript(body, callback) {
  console.log('Forwarding to Apps Script:', APPS_SCRIPT_URL);
  
  const payload = JSON.stringify(body);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(APPS_SCRIPT_URL, options, (res) => {
    console.log('Apps Script response status:', res.statusCode);
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('Apps Script responded:', parsed);
        callback(null, parsed);
      } catch (err) {
        console.error('Error parsing Apps Script response:', err);
        callback(err);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Apps Script request error:', err);
    callback(err);
  });

  req.write(payload);
  req.end();
}

// Start server on port 8080 (required by Cloud Run)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
