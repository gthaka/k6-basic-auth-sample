import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

// Define your API endpoint and authentication details
const URL = __ENV.URL;
const USERNAME = __ENV.USERNAME;
const PASSWORD = __ENV.PASSWORD;
const EXPECTED_KEYS = __ENV.EXPECTED_KEYS && (__ENV.EXPECTED_KEYS).split(',') || 'message';

console.log

export const options = {
  thresholds: {
    http_req_failed: __ENV.RQ_FAILED && (__ENV.RQ_FAILED).split(',')
      || ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: __ENV.RQ_DURATION && (__ENV.RQ_DURATION).split(',')
      || ['p(95)<200'], // 95% of requests should be below 600ms
  },

  scenarios: {
    simultaneous_users: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
    },
    staggered_requests: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      startTime: '30s',
    },
  },
};


export default function () {

  console.log('===============================BEGIN======================================');

  // Set up the authentication parameters
  const credentials = `${USERNAME}:${PASSWORD}`;
  const encodedCredentials = encoding.b64encode(credentials);

  // Define the headers with the Authorization header
  const params = {
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
    },
  };

  // Make the API request with authentication
  const response = http.get(`${URL}`, params);
  console.info('Response: ', response);

  // Parse JSON response
  let jsonData;
  try {
    jsonData = JSON.parse(response.body);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    fail('Response was not valid JSON');
  }

  let dataToCheck = jsonData;
  let status = undefined;
  if ('data' in jsonData) {
    dataToCheck = jsonData.data;
    status = jsonData.status;
    console.log('JSON structure: Nested data');
  } else {
    console.log('JSON structure: Flat data');
  }

  // Check if the request was successful
  check(response, {
    'status is 200': r => r.status === 200,
    'status is ok (if present)': () => status === undefined || status === 'ok',
    'response body is valid JSON': _ => dataToCheck !== undefined,
    'JSON contains expected keys': _ => {
      return EXPECTED_KEYS.every(key => key in dataToCheck);
    }
  });

  console.log('===============================END======================================');
}