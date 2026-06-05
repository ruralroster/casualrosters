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
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exechttps://script.google.com/macros/s/AKfycbwKdwehZeiedmYsmso-3rHbTWqY56Krnp1uSPqJ50AYwLtglISqrLCiT0AjFCFCi7Nf/exec';

// Create HTTP server for Cloud Run
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Collect request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const requestBody = JSON.parse(body);
      
      // Forward to Apps Script
      forwardToAppsScript(requestBody, (error, response) => {
        if (error) {
          console.error('Error forwarding to Apps Script:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.toString() }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      });
    } catch (err) {
      console.error('Error parsing request:', err);
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
});

function forwardToAppsScript(body, callback) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(body).length
    }
  };

  const req = https.request(APPS_SCRIPT_URL, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        callback(null, parsed);
      } catch (err) {
        callback(err);
      }
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  req.write(JSON.stringify(body));
  req.end();
}

// Start server on port 8080 (required by Cloud Run)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
