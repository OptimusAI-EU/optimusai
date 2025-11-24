const http = require('http');
const https = require('https');
const url = require('url');

// Test 1: Login to get token
console.log('Step 1: Logging in...');

const loginData = JSON.stringify({
  email: 'optimusrobots@proton.me',
  password: 'Test1234!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Login Status: ${res.statusCode}`);
    console.log(`Login Cookies: ${res.headers['set-cookie']}`);
    
    // Extract accessToken from Set-Cookie header
    const cookies = res.headers['set-cookie'] || [];
    let accessToken = null;
    for (const cookie of cookies) {
      if (cookie.includes('accessToken=')) {
        accessToken = cookie.split('accessToken=')[1].split(';')[0];
        break;
      }
    }
    
    if (accessToken) {
      console.log(`\n✅ Got accessToken: ${accessToken.substring(0, 20)}...`);
      
      // Test 2: Call inventory endpoint with token in cookies
      setTimeout(() => {
        testInventoryWithCookie(accessToken);
      }, 500);
    } else {
      console.log('\n❌ No accessToken in response');
      process.exit(1);
    }
  });
});

loginReq.on('error', (e) => {
  console.error(`Login error: ${e.message}`);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();

function testInventoryWithCookie(accessToken) {
  console.log('\nStep 2: Testing /api/admin/inventory with cookie...');
  
  const inventoryOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/inventory',
    method: 'GET',
    headers: {
      'Cookie': `accessToken=${accessToken}`
    }
  };
  
  const inventoryReq = http.request(inventoryOptions, (res) => {
    console.log(`Inventory Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response: ${data}`);
      process.exit(0);
    });
  });
  
  inventoryReq.on('error', (e) => {
    console.error(`Inventory error: ${e.message}`);
    process.exit(1);
  });
  
  inventoryReq.end();
}
