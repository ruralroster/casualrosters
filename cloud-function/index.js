/**
 * Google Cloud Function - CORS Proxy for Rural Rosters
 * 
 * Deployed as an HTTP Cloud Function
 * Accepts POST requests from GitHub Pages
 * Forwards to Apps Script backend with full CORS support
 */

const https = require('https');
const url = require('url');

// UPDATE THIS with your Apps Script deployment URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exechttps://script.google.com/macros/s/AKfycbwKdwehZeiedmYsmso-3rHbTWqY56Krnp1uSPqJ50AYwLtglISqrLCiT0AjFCFCi7Nf/exec';

exports.ruralRostersProxy = (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
  res.set('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get the request body
  const requestBody = req.body;

  // Forward to Apps Script
  forwardToAppsScript(requestBody, (error, response) => {
    if (error) {
      console.error('Error forwarding to Apps Script:', error);
      res.status(500).json({ error: error.toString() });
      return;
    }

    // Return the response from Apps Script
    res.status(200).json(response);
  });
};

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
