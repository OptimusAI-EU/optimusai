const http = require('http');

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
      console.log(`✅ Got accessToken\n`);
      
      // Test 2: Get inventory (should be empty)
      setTimeout(() => {
        getInventory(accessToken, () => {
          // Test 3: Create an inventory item
          createInventoryItem(accessToken, () => {
            // Test 4: Get inventory again (should have 1 item)
            getInventory(accessToken, () => {
              process.exit(0);
            });
          });
        });
      }, 500);
    } else {
      console.log('❌ No accessToken in response');
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

function getInventory(token, callback) {
  console.log('Step 2/4: Testing GET /api/admin/inventory...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/inventory',
    method: 'GET',
    headers: {
      'Cookie': `accessToken=${token}`
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const items = JSON.parse(data);
        console.log(`Items count: ${items.length}\n`);
        callback();
      } catch (e) {
        console.error(`Parse error: ${e.message}`);
        process.exit(1);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  });
  
  req.end();
}

function createInventoryItem(token, callback) {
  console.log('Step 3: Creating inventory item...');
  
  const itemData = JSON.stringify({
    type: 'Robot',
    productNumber: 'ROBOT-001',
    productName: 'OmniBot X1',
    quantity: 5,
    location: {
      latitude: 35.6762,
      longitude: 139.6503,
      address: 'Tokyo, Japan'
    },
    status: 'In Store',
    price: 999.99,
    description: 'Advanced multipurpose robot'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/inventory',
    method: 'POST',
    headers: {
      'Cookie': `accessToken=${token}`,
      'Content-Type': 'application/json',
      'Content-Length': itemData.length
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const item = JSON.parse(data);
        console.log(`Created: ${item.productName} (ID: ${item.id})\n`);
        callback();
      } catch (e) {
        console.error(`Parse error: ${e.message}`);
        console.error(`Response: ${data}`);
        process.exit(1);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  });
  
  req.write(itemData);
  req.end();
}
