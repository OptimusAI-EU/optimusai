const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/inventory',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test'
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', JSON.stringify(res.headers));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 500));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit(1);
});

req.end();
