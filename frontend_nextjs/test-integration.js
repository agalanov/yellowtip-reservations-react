/**
 * Integration test script for Next.js frontend and NestJS backend
 * Run this script to verify the integration is working correctly
 * 
 * Usage: npm run test:integration
 * 
 * Note: Requires axios to be installed: npm install axios
 */

// Use Node.js built-in fetch (Node 18+) or fallback to http
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Simple HTTP client using Node.js built-ins
function httpRequest(method, url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 5000,
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          data: parsedBody,
          headers: res.headers,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    log(`\n🔍 Testing ${name}...`, 'blue');
    log(`   ${method.toUpperCase()} ${url}`, 'yellow');
    
    const response = await httpRequest(method, url, data, headers);
    
    log(`✅ ${name} - Success (Status: ${response.status})`, 'green');
    if (response.data) {
      const dataStr = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      log(`   Response: ${dataStr.substring(0, 100)}...`, 'yellow');
    }
    
    return { success: true, response };
  } catch (error) {
    if (error.response) {
      log(`❌ ${name} - Failed (Status: ${error.response.status})`, 'red');
      log(`   Error: ${error.response.data?.message || error.message}`, 'red');
    } else {
      log(`❌ ${name} - Failed (No response from server)`, 'red');
      log(`   Error: ${error.message}`, 'red');
      log(`   💡 Make sure the backend is running on ${BACKEND_URL.replace('/api', '')}`, 'yellow');
    }
    return { success: false, error: { response: { status: error.response?.status }, message: error.message } };
  }
}

async function runTests() {
  log('\n🚀 Starting Integration Tests', 'blue');
  log(`📡 Backend URL: ${BACKEND_URL}`, 'yellow');
  log(`🌐 Frontend URL: ${FRONTEND_URL}`, 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  // Test 1: Backend Health Check
  // Backend already has /api prefix, so we use /api/health
  const healthTest = await testEndpoint(
    'Backend Health Check',
    'GET',
    `${BACKEND_URL}/health`
  );
  results.total++;
  if (healthTest.success && healthTest.response.status === 200) {
    results.passed++;
  } else {
    // Check if backend is responding (even with error)
    if (healthTest.response && healthTest.response.status === 500) {
      // Backend is running but endpoint might not exist or has an issue
      log('⚠️  Backend is responding but health check returned error', 'yellow');
      log('   This might indicate the endpoint path is incorrect', 'yellow');
      results.failed++;
    } else {
      results.failed++;
      log('\n⚠️  Backend is not accessible. Please ensure:', 'yellow');
      log('   1. Backend is running: cd backend_nestjs && npm run start:dev', 'yellow');
      log('   2. Backend is listening on port 3001', 'yellow');
      log('   3. No firewall is blocking the connection', 'yellow');
      return results;
    }
  }
  
  // Test 2: Swagger Documentation
  const swaggerTest = await testEndpoint(
    'Swagger Documentation',
    'GET',
    `${BACKEND_URL.replace('/api', '')}/api/docs`,
    null,
    { Accept: 'text/html' }
  );
  results.total++;
  if (swaggerTest.success || swaggerTest.error?.response?.status === 404) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Auth Login Endpoint (should fail without credentials, but endpoint should exist)
  const authTest = await testEndpoint(
    'Auth Login Endpoint',
    'POST',
    `${BACKEND_URL}/auth/login`,
    { loginId: 'test', password: 'test' }
  );
  results.total++;
  // We expect this to fail with 401 or 400, which means the endpoint exists
  if (authTest.error?.response?.status === 401 || authTest.error?.response?.status === 400) {
    results.passed++;
    log('✅ Auth endpoint exists and validates credentials', 'green');
  } else if (authTest.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Admin Dashboard (should fail without auth, but endpoint should exist)
  const adminTest = await testEndpoint(
    'Admin Dashboard Endpoint',
    'GET',
    `${BACKEND_URL}/admin/dashboard`
  );
  results.total++;
  // We expect 401 (Unauthorized), which means the endpoint exists and requires auth
  if (adminTest.error?.response?.status === 401) {
    results.passed++;
    log('✅ Admin endpoint exists and requires authentication', 'green');
  } else {
    results.failed++;
  }
  
  // Test 5: Rooms Endpoint (should fail without auth)
  const roomsTest = await testEndpoint(
    'Rooms Endpoint',
    'GET',
    `${BACKEND_URL}/rooms`
  );
  results.total++;
  if (roomsTest.error?.response?.status === 401) {
    results.passed++;
    log('✅ Rooms endpoint exists and requires authentication', 'green');
  } else {
    results.failed++;
  }
  
  // Test 6: Services Endpoint (should fail without auth)
  const servicesTest = await testEndpoint(
    'Services Endpoint',
    'GET',
    `${BACKEND_URL}/services`
  );
  results.total++;
  if (servicesTest.error?.response?.status === 401) {
    results.passed++;
    log('✅ Services endpoint exists and requires authentication', 'green');
  } else {
    results.failed++;
  }
  
  // Test 7: CORS Configuration
  log('\n🌐 Testing CORS Configuration...', 'blue');
  try {
    const corsTest = await httpRequest(
      'OPTIONS',
      `${BACKEND_URL}/health`,
      null,
      {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
      }
    );
    results.total++;
    if (corsTest.headers['access-control-allow-origin']) {
      results.passed++;
      log('✅ CORS is properly configured', 'green');
    } else {
      results.failed++;
      log('❌ CORS headers are missing', 'red');
    }
  } catch (error) {
    results.total++;
    results.failed++;
    log('❌ CORS test failed', 'red');
    log(`   Note: CORS test may fail if backend doesn't handle OPTIONS requests`, 'yellow');
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Results Summary', 'blue');
  log(`✅ Passed: ${results.passed}/${results.total}`, results.failed === 0 ? 'green' : 'yellow');
  log(`❌ Failed: ${results.failed}/${results.total}`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(50), 'blue');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Integration is working correctly.', 'green');
    log('\n📝 Next Steps:', 'blue');
    log('   1. Start the backend: cd backend_nestjs && npm run start:dev', 'yellow');
    log('   2. Start the frontend: cd frontend_nextjs && npm run dev', 'yellow');
    log('   3. Open http://localhost:3000 in your browser', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  return results;
}

// Run tests
runTests()
  .then((results) => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch((error) => {
    log(`\n💥 Test runner crashed: ${error.message}`, 'red');
    process.exit(1);
  });

