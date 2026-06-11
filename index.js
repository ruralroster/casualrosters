/**
 * Rural Rosters Backend - Node.js with Email
 * Connects directly to Google Sheets API + sends emails via Gmail
 */

const http = require('http');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const nodemailer = require('nodemailer');

// Service account credentials (Sheets API)
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "rural-rosters",
  private_key_id: "3f30d8812c36bf4d32ab0492eee60ae27f27d829",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDsvjaq0OtGrXFL\nXq0122BUAjKwq3Z9zlD9K6n6EVyoH9gojRnpoodqHSJY3EIq3xdRzXKiK8nly9Qi\ndTyRVmS/YR5t4TNFfIi01vOek23tj2wmU2iqPO2VSmyLOgVCEu/qjTVrd/D6X3OQ\n2h7ueXgtbOJWuTf3WPZ/LJ2XG6SIv2cRODOlQ0dMjsJOAlVAPU3XGlXGJvBfqt13\n2UA/jwbNr7oDa2q3l7aP8O1FJIRgzrKEkJ78kFse/V0lBN0CyDbXtIL3jx5cJpom\npd1pJCgDgciXzPem0H2btMlHjFcRjuFk8D8gcNDxEj0iBqsFD+EFhQjZIHGGz1JA\nnTxl0u6HAgMBAAECggEAVPZu6B7SUSst3b68qvdwOrYPOxhODhhdOH7TIcvZVP0Y\ntnTtN8v8jTinevyRQpGN7O2ulkTg0He2SieI9R/sSEKyiPypSebHqR77j42ZhghS\n5+5HQdFb8pgjHFRWTsA9GhBTe54v/asD7phZQXyWhLbvA/C1BTAIRtvcMr7Y7boS\nrpYgb1OQpEXUkcAmu6Elf0UvrgcqYmB4t17m2ky1/kNqyIxtGIWviWHr1zHtfabn\nrlMjixNEJzXVS0ju15d69aIPj44+C2NQkJN8qotgOTv+aU+Eg4FzUqV4YF5JR09Q\npYvqFwO1S2WaenmUU4DhEB4UVXis85rR13h/3ycvAQKBgQD3TXcqDNLV7BL3G4BD\n0ujd5750gaIkVJeqgWGGHNDCz+TaVfOPu8FwG4nxbRlgYHyvlWFzWCk9zpoj9BYw\nhkTV/z0MzGIUGIpXE1O8u8aGM/k9Xbq6gyc0VPaCWRbYQ2YdSlLWKaqNsJxrGHJY\nvKVquLaHIMvE4xnf4F6ttYGOCwKBgQD1Ea1ehWnTVnyReKOWLM8GvnsQbV6RE6oQ\n6xCmW02WazrterZQTocfoSSTbdYl6+Wh4EOGkVirIcfrghr4whqvxEw3SHT9ckSI\n3fymchE8wPIrYwTaXRDUucKvW5QKaZTTjOT9Tr53VRC/7Mzu4AsnDRPFE8q4skC1\nDONlria69QKBgDoISKVqevNOQakRIAlKbfDc1/mZDgZ+f1S4pb0F+AsvI+IEd3JM\nOflnzPgFhQXzvm6pnEOn9Y2WdN9pAOgEKhUZnybosz9J/vSuCWFpow2NFrjKzO3F\npyaFpY8y/sRjFIxdC5FMF8TGI/6RrwuZwSuJCvQswwSB0mmRykXzKOK/AoGAQLEN\n5umo6dTmxS/nXvktHUajDc8RK5LZTeX/Wyq27IIZ6B6Aiepw2PScxx4zbYc78uNU\nb+1mTqZ4M78Ah7IVgVh8FgvWdiD33nla/EUYL8VvJ+zXlx0CGGWA8vFlvunoE4AZ\n4pQqyy11YnSMFHKn/wMAuQFkfiTv19szG+BA8RECgYEApNOwO4Hq7IXsHJeERoB/\n0HdtJtFpfo09xUD/grjipzCzKF/fJgapHCFq7a5l56igwbVehQKTMHiV8BHs4GeI\nmQ85Bd9w14NdlK1YfufpcPylP701JsGvzDPtUaGyZ/3cPxjQlCPJIoLp/YQeXNa0\nieXG73xh8R9zF2AECz1Tk6E=\n-----END PRIVATE KEY-----\n",
  client_email: "rural-rosters-backend@rural-rosters.iam.gserviceaccount.com",
  client_id: "110632316482172106567",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/rural-rosters-backend%40rural-rosters.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Gmail credentials - CHANGE THESE WHEN RuralRoster@gmail.com IS BACK
const GMAIL_USER = 'ruralroster@gmail.com';
const GMAIL_APP_PASSWORD = 'kyij mbwe ejlq nxfh';

const SHEET_ID = '1iG4SwN4LzFnzKNht2uy8R8YV6XKIftRTbmfW7_YZwtM';

// Initialize JWT client for Sheets
const auth = new JWT({
  email: SERVICE_ACCOUNT.client_email,
  key: SERVICE_ACCOUNT.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// HTTP Server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only POST
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Parse body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { action, params } = JSON.parse(body);
      console.log('Action:', action);

      let result;
      switch (action) {
        case 'checkUserExists':
          result = await checkUserExists(params.email, params.password);
          break;
        case 'getOfficerLocations':
          result = await getOfficerLocations(params.email);
          break;
        case 'getOfficerVacancies':
          result = await getOfficerVacancies(params.email);
          break;
        case 'getStaffAvailableShifts':
          result = await getStaffAvailableShifts(params.email);
          break;
        case 'requestShifts':
          result = await requestShifts(params.email, params.name, params.shifts);
          break;
        default:
          result = { error: 'Unknown action: ' + action };
      }

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error('Error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.toString() }));
    }
  });
});

// ============================================================================
// BACKEND FUNCTIONS
// ============================================================================

async function checkUserExists(email, password) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A2:G'
    });

    const rows = result.data.values || [];
    const normalizedEmail = email.toLowerCase().trim();

    for (let row of rows) {
      if (row[0] && String(row[0]).toLowerCase().trim() === normalizedEmail && row[4] === password) {
        return {
          email: row[0],
          name: row[1],
          locations: row[2],
          role: row[3],
          astQuals: row[6] || 'Emergency'
        };
      }
    }

    return { error: 'Invalid email or password' };
  } catch (err) {
    console.error('checkUserExists error:', err);
    return { error: err.toString() };
  }
}

async function getOfficerLocations(email) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Rostering Officers!A2:C'
    });

    const rows = result.data.values || [];
    const locations = [];

    for (let row of rows) {
      if (row[2] === email) {
        const location = String(row[0]).trim();
        if (location && !locations.includes(location)) {
          locations.push(location);
        }
      }
    }

    return locations;
  } catch (err) {
    console.error('getOfficerLocations error:', err);
    return [];
  }
}

async function getStaffLocations(email) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A2:C'
    });

    const rows = result.data.values || [];
    const normalizedEmail = email.toLowerCase().trim();

    for (let row of rows) {
      if (row[0] && String(row[0]).toLowerCase().trim() === normalizedEmail) {
        const locationsStr = row[2] || '';
        return locationsStr.split(',').map(l => l.trim());
      }
    }

    return [];
  } catch (err) {
    console.error('getStaffLocations error:', err);
    return [];
  }
}

async function getOfficerVacancies(email) {
  try {
    const locations = await getOfficerLocations(email);
    
    if (locations.length === 0) {
      return [];
    }

    const allVacancies = [];
    const locationNames = ['Innisfail', 'Mareeba', 'Tully', 'Yarrabah', 'Atherton', 'Mossman', 'Babinda', 'Cairns', 'Telehealth'];

    for (let location of locations) {
      if (!locationNames.includes(location)) continue;

      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `Vacancies - ${location}!A2:D`
      });

      const rows = result.data.values || [];
      for (let row of rows) {
        if (row[0] && row[1]) {
          allVacancies.push({
            date: formatDate(row[0]),
            jobType: row[1],
            location: row[2]
          });
        }
      }
    }

    return allVacancies;
  } catch (err) {
    console.error('getOfficerVacancies error:', err);
    return [];
  }
}

async function getStaffAvailableShifts(email) {
  try {
    const locations = await getStaffLocations(email);
    
    if (locations.length === 0) {
      console.log('No locations found for staff member:', email);
      return [];
    }

    console.log('Staff locations:', locations);

    const allShifts = [];
    const locationNames = ['Innisfail', 'Mareeba', 'Tully', 'Yarrabah', 'Atherton', 'Mossman', 'Babinda', 'Cairns', 'Telehealth'];

    for (let location of locations) {
      if (!locationNames.includes(location)) {
        console.log('Skipping invalid location:', location);
        continue;
      }

      try {
        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `Vacancies - ${location}!A2:D`
        });

        const rows = result.data.values || [];
        console.log(`Found ${rows.length} shifts in ${location}`);

        for (let row of rows) {
          if (row[0] && row[1]) {
            allShifts.push({
              date: formatDate(row[0]),
              jobType: row[1],
              location: row[2]
            });
          }
        }
      } catch (locErr) {
        console.log(`Error reading ${location} vacancies:`, locErr.message);
      }
    }

    console.log('Total shifts found:', allShifts.length);
    return allShifts;
  } catch (err) {
    console.error('getStaffAvailableShifts error:', err);
    return [];
  }
}

async function requestShifts(officerEmail, officerName, shifts) {
  try {
    const timestamp = new Date().toLocaleString();
    
    console.log(`Shift request from ${officerName} (${officerEmail}) for ${shifts.length} shifts`);
    
    // Find rostering officers for each location
    const officerResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Rostering Officers!A2:C'
    });

    const officerRows = officerResult.data.values || [];
    const officersByLocation = {};

    for (let row of officerRows) {
      const location = String(row[0]).trim();
      const rostName = String(row[1]).trim();
      const rostEmail = String(row[2]).trim();
      
      if (!officersByLocation[location]) {
        officersByLocation[location] = [];
      }
      officersByLocation[location].push({ name: rostName, email: rostEmail });
    }

    // Log each request to Requests sheet
    const requestsToAdd = [];
    for (let shift of shifts) {
      requestsToAdd.push([
        timestamp,
        officerEmail,
        officerName,
        shift.date,
        shift.jobType,
        shift.location,
        'Pending',
        '',
        ''
      ]);
    }

    // Append to Requests sheet
    if (requestsToAdd.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Requests!A2:I',
        valueInputOption: 'RAW',
        resource: { values: requestsToAdd }
      });
      console.log(`Logged ${requestsToAdd.length} requests to Requests sheet`);
    }

    // Group shifts by location
    const shiftsByLocation = {};
    for (let shift of shifts) {
      if (!shiftsByLocation[shift.location]) {
        shiftsByLocation[shift.location] = [];
      }
      shiftsByLocation[shift.location].push(shift);
    }

    // Send emails to rostering officers
    for (let location in shiftsByLocation) {
      const locationShifts = shiftsByLocation[location];
      const officers = officersByLocation[location] || [];
      
      const shiftList = locationShifts
        .map(s => `• ${s.date} — ${s.jobType}`)
        .join('\n');

      const emailBody = `Shift Request from ${officerName} (${officerEmail})\n\nLocation: ${location}\nShifts Requested:\n${shiftList}\n\nStatus: Pending Approval\n\nPlease review at: https://ruralroster.github.io/casualrosters/\n\n---\nRural Rosters System`;

      // Send to each rostering officer for that location
      for (let officer of officers) {
        try {
          await transporter.sendMail({
            from: GMAIL_USER,
            to: officer.email,
            cc: 'ruralroster@gmail.com',
            subject: `[Rural Rosters] New Shift Request - ${location}`,
            text: emailBody
          });
          console.log(`Email sent to ${officer.email}`);
        } catch (err) {
          console.error(`Failed to email ${officer.email}:`, err);
        }
      }
    }

    return { success: true, message: 'Request submitted and emails sent' };
  } catch (err) {
    console.error('requestShifts error:', err);
    return { error: err.toString() };
  }
}

function formatDate(dateVal) {
  if (!dateVal) return '';
  
  if (dateVal instanceof Date) {
    const d = dateVal.getDate();
    const m = dateVal.getMonth() + 1;
    const y = dateVal.getFullYear();
    return (d < 10 ? '0' + d : d) + '/' + (m < 10 ? '0' + m : m) + '/' + y;
  }
  
  return String(dateVal);
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Rural Rosters Backend listening on port ${PORT}`);
});
