/**
 * Rural Rosters Backend - Node.js
 * Connects directly to Google Sheets API 
 * Replaces Apps Script entirely
 */

const http = require('http');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Service account credentials (from JSON file)
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

const SHEET_ID = '1KKRZ9DLlMjJUC6NXioc4hCzj_LQa2p7OSKUJYmzTF7k';

// Initialize JWT client
const auth = new JWT({
  email: SERVICE_ACCOUNT.client_email,
  key: SERVICE_ACCOUNT.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

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
        case 'saveOfficerVacancies':
          result = await saveOfficerVacancies(params.email, params.vacancies);
          break;
        case 'getAvailableShifts':
          result = await getAvailableShifts(params.email, params.locations);
          break;
        case 'requestShifts':
          result = await requestShifts(params.email, params.name, params.shifts);
          break;
        case 'getJobTypesForOfficer':
          result = await getJobTypesForOfficer(params.email);
          break;
        case 'updateUserLocations':
          result = await updateUserLocations(params.email, params.locations, params.role);
          break;
        case 'updateUserAST':
          result = await updateUserAST(params.email, params.astQuals);
          break;
        case 'countPendingRequests':
          result = await countPendingRequests(params.email);
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

async function saveOfficerVacancies(email, vacancies) {
  try {
    const locations = await getOfficerLocations(email);
    
    for (let location of locations) {
      const locationVacs = vacancies.filter(v => v.location === location);
      
      if (locationVacs.length > 0) {
        const values = locationVacs.map(v => [v.date, v.jobType, v.location, '']);
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Vacancies - ${location}!A2:D${locationVacs.length + 1}`,
          valueInputOption: 'RAW',
          resource: { values }
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error('saveOfficerVacancies error:', err);
    return { error: err.toString() };
  }
}

async function getAvailableShifts(userEmail, userLocations) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Master Vacancies!A2:D'
    });

    const rows = result.data.values || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = rows
      .filter(row => {
        if (!row[0] || !row[1] || !row[2]) return false;
        
        // Filter by location
        if (!userLocations.includes(row[2])) return false;

        // Filter out past dates
        const vacDate = parseDate(row[0]);
        return vacDate >= today;
      })
      .map(row => ({
        date: formatDate(row[0]),
        jobType: String(row[1]).trim(),
        location: String(row[2]).trim()
      }));

    return filtered;
  } catch (err) {
    console.error('getAvailableShifts error:', err);
    return [];
  }
}

async function requestShifts(userEmail, userName, shifts) {
  try {
    console.log(`Shift request from ${userName} (${userEmail}) for ${shifts.length} shifts`);
    // TODO: Implement email sending
    return { success: true };
  } catch (err) {
    return { error: err.toString() };
  }
}

async function getJobTypesForOfficer(email) {
  try {
    const locations = await getOfficerLocations(email);
    const shiftTypes = await getShiftTypes();
    
    const allJobTypes = {};
    for (let location of locations) {
      allJobTypes[location] = shiftTypes
        .filter(st => st.location === location)
        .map(st => st.jobType)
        .filter((v, i, a) => a.indexOf(v) === i);
    }

    return allJobTypes;
  } catch (err) {
    return {};
  }
}

async function updateUserLocations(email, locations, role) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A2:D'
    });

    const rows = result.data.values || [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === email && rows[i][3] === role) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Users!C${i + 2}`,
          valueInputOption: 'RAW',
          resource: { values: [[locations]] }
        });
        return { success: true };
      }
    }

    return { error: 'User not found' };
  } catch (err) {
    return { error: err.toString() };
  }
}

async function updateUserAST(email, astQuals) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A2:A'
    });

    const rows = result.data.values || [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === email) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Users!G${i + 2}`,
          valueInputOption: 'RAW',
          resource: { values: [[astQuals]] }
        });
        return { success: true };
      }
    }

    return { error: 'User not found' };
  } catch (err) {
    return { error: err.toString() };
  }
}

async function countPendingRequests(officerEmail) {
  // TODO: Implement request tracking
  return 0;
}

async function getShiftTypes() {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Shift Types!A2:E'
    });

    const rows = result.data.values || [];
    return rows.map(row => ({
      jobType: row[0],
      location: row[1]
    }));
  } catch (err) {
    return [];
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

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  if (dateStr instanceof Date) {
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }
  if (String(dateStr).includes('/')) {
    const parts = String(dateStr).split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(0);
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Rural Rosters Backend listening on port ${PORT}`);
});
