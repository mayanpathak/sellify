/**
 * API Test Script
 * 
 * This script tests all the API endpoints to ensure they're working correctly.
 * Run with: node test-api.js
 * 
 * Make sure your server is running on localhost:5000 before running this script.
 */

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123'
};

const testPage = {
    title: 'Test Product Page',
    productName: 'Amazing Product',
    description: 'This is a test product',
    price: 29.99,
    currency: 'usd',
    fields: [
        { label: 'Full Name', type: 'text', required: true },
        { label: 'Email Address', type: 'email', required: true }
    ]
};

let authToken = '';
let pageId = '';
let pageSlug = '';

async function makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log(`${method} ${endpoint}: ${response.status}`);
        if (!response.ok) {
            console.log('Error:', result);
        }
        
        return { status: response.status, data: result };
    } catch (error) {
        console.error(`Error testing ${method} ${endpoint}:`, error.message);
        return { status: 500, error: error.message };
    }
}

async function testAuth() {
    console.log('\n=== Testing Authentication ===');
    
    // Test registration
    const registerResult = await makeRequest('/auth/register', 'POST', testUser);
    if (registerResult.status === 201) {
        authToken = registerResult.data.token;
        console.log('✅ Registration successful');
    } else {
        console.log('❌ Registration failed');
    }
    
    // Test login
    const loginResult = await makeRequest('/auth/login', 'POST', {
        email: testUser.email,
        password: testUser.password
    });
    if (loginResult.status === 200) {
        authToken = loginResult.data.token;
        console.log('✅ Login successful');
    } else {
        console.log('❌ Login failed');
    }
    
    // Test get current user
    const meResult = await makeRequest('/auth/me', 'GET', null, {
        'Authorization': `Bearer ${authToken}`
    });
    if (meResult.status === 200) {
        console.log('✅ Get current user successful');
    } else {
        console.log('❌ Get current user failed');
    }
}

async function testPages() {
    console.log('\n=== Testing Pages ===');
    
    if (!authToken) {
        console.log('❌ No auth token available for page tests');
        return;
    }
    
    // Test create page
    const createResult = await makeRequest('/pages', 'POST', testPage, {
        'Authorization': `Bearer ${authToken}`
    });
    if (createResult.status === 201) {
        pageId = createResult.data.data.page._id;
        pageSlug = createResult.data.data.page.slug;
        console.log('✅ Page creation successful');
    } else {
        console.log('❌ Page creation failed');
    }
    
    // Test get user pages
    const getUserPagesResult = await makeRequest('/pages', 'GET', null, {
        'Authorization': `Bearer ${authToken}`
    });
    if (getUserPagesResult.status === 200) {
        console.log('✅ Get user pages successful');
    } else {
        console.log('❌ Get user pages failed');
    }
    
    // Test get page by slug (public)
    if (pageSlug) {
        const getPageResult = await makeRequest(`/pages/${pageSlug}`, 'GET');
        if (getPageResult.status === 200) {
            console.log('✅ Get page by slug successful');
        } else {
            console.log('❌ Get page by slug failed');
        }
    }
    
    // Test update page
    if (pageId) {
        const updateResult = await makeRequest(`/pages/${pageId}`, 'PUT', {
            title: 'Updated Test Product Page',
            price: 39.99
        }, {
            'Authorization': `Bearer ${authToken}`
        });
        if (updateResult.status === 200) {
            console.log('✅ Page update successful');
        } else {
            console.log('❌ Page update failed');
        }
    }
}

async function testSubmissions() {
    console.log('\n=== Testing Submissions ===');
    
    if (!pageSlug) {
        console.log('❌ No page slug available for submission tests');
        return;
    }
    
    // Test form submission (public)
    const submissionData = {
        'Full Name': 'John Doe',
        'Email Address': 'john@example.com'
    };
    
    const submitResult = await makeRequest(`/pages/${pageSlug}/submit`, 'POST', submissionData);
    if (submitResult.status === 201) {
        console.log('✅ Form submission successful');
    } else {
        console.log('❌ Form submission failed');
    }
    
    // Test get all user submissions
    if (authToken) {
        const getUserSubmissionsResult = await makeRequest('/submissions', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });
        if (getUserSubmissionsResult.status === 200) {
            console.log('✅ Get user submissions successful');
        } else {
            console.log('❌ Get user submissions failed');
        }
    }
    
    // Test get page submissions
    if (pageId && authToken) {
        const getPageSubmissionsResult = await makeRequest(`/pages/${pageId}/submissions`, 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });
        if (getPageSubmissionsResult.status === 200) {
            console.log('✅ Get page submissions successful');
        } else {
            console.log('❌ Get page submissions failed');
        }
    }
}

async function testStripe() {
    console.log('\n=== Testing Stripe ===');
    
    if (!authToken) {
        console.log('❌ No auth token available for Stripe tests');
        return;
    }
    
    // Test Stripe account connection
    const connectResult = await makeRequest('/stripe/connect', 'POST', {}, {
        'Authorization': `Bearer ${authToken}`
    });
    if (connectResult.status === 200) {
        console.log('✅ Stripe account connection successful');
    } else {
        console.log('❌ Stripe account connection failed');
    }
    
    // Test create checkout session
    if (pageId) {
        const sessionResult = await makeRequest(`/stripe/session/${pageId}`, 'POST', {}, {
            'Authorization': `Bearer ${authToken}`
        });
        if (sessionResult.status === 200) {
            console.log('✅ Stripe checkout session creation successful');
        } else {
            console.log('❌ Stripe checkout session creation failed');
        }
    }
}

async function testValidation() {
    console.log('\n=== Testing Validation ===');
    
    // Test invalid registration
    const invalidRegisterResult = await makeRequest('/auth/register', 'POST', {
        name: '',
        email: 'invalid-email',
        password: '123'
    });
    if (invalidRegisterResult.status === 400) {
        console.log('✅ Registration validation working');
    } else {
        console.log('❌ Registration validation failed');
    }
    
    // Test invalid page creation
    if (authToken) {
        const invalidPageResult = await makeRequest('/pages', 'POST', {
            title: '',
            productName: '',
            price: -10
        }, {
            'Authorization': `Bearer ${authToken}`
        });
        if (invalidPageResult.status === 400) {
            console.log('✅ Page creation validation working');
        } else {
            console.log('❌ Page creation validation failed');
        }
    }
}

async function cleanup() {
    console.log('\n=== Cleanup ===');
    
    // Delete test page
    if (pageId && authToken) {
        const deleteResult = await makeRequest(`/pages/${pageId}`, 'DELETE', null, {
            'Authorization': `Bearer ${authToken}`
        });
        if (deleteResult.status === 204) {
            console.log('✅ Page deletion successful');
        } else {
            console.log('❌ Page deletion failed');
        }
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests...');
    console.log('Make sure your server is running on localhost:5000');
    
    try {
        await testAuth();
        await testPages();
        await testSubmissions();
        await testStripe();
        await testValidation();
        await cleanup();
        
        console.log('\n✅ All tests completed!');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ for fetch support');
    console.log('Or install node-fetch: npm install node-fetch');
    process.exit(1);
}

runTests(); 