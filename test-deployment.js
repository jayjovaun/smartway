/**
 * SmartWay Deployment Diagnostic Test
 * Run this to diagnose deployment issues
 */

const https = require('https');
const axios = require('axios');

const BASE_URL = 'https://smartway-2x8k1xu14-josh-sartins-projects.vercel.app';

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 15000 });
    console.log('✅ Health Check Response:', JSON.stringify(response.data, null, 2));
    
    const health = response.data;
    if (health.services?.gemini !== 'configured') {
      console.log('❌ GEMINI_API_KEY is missing or not configured');
    }
    if (health.services?.supabase !== 'frontend-managed') {
      console.log('⚠️  Note: Supabase is managed by frontend, not backend');
    }
    
    return health;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return null;
  }
}

async function testSupabaseAccess() {
  console.log('\n🔍 Testing Supabase File Access...');
  
  // Test if we can access a typical Supabase URL structure
  const testUrl = 'https://your-project.supabase.co/storage/v1/object/public/uploads/test.txt';
  
  try {
    const response = await axios.get(testUrl, { timeout: 10000 });
    console.log('✅ Supabase access test successful');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Supabase accessible (404 expected for test URL)');
      return true;
    }
    console.log('❌ Supabase access test failed:', error.message);
    console.log('   This might indicate network or permission issues');
    return false;
  }
}

async function testGenerateEndpoint() {
  console.log('\n🔍 Testing Generate Endpoint with Text...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/generate`, {
      text: 'This is a test document for AI processing. It contains basic information about testing and diagnostics.'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    console.log('✅ Generate endpoint test successful');
    console.log('   Response keys:', Object.keys(response.data));
    return true;
  } catch (error) {
    console.error('❌ Generate endpoint test failed');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.error || error.message);
    console.error('   Request ID:', error.response?.data?.requestId);
    
    if (error.response?.data?.hint) {
      console.log('   Hint:', error.response.data.hint);
    }
    
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 SmartWay Deployment Diagnostics Starting...\n');
  
  const health = await testHealthEndpoint();
  const supabaseAccess = await testSupabaseAccess();
  const generateTest = await testGenerateEndpoint();
  
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('========================');
  console.log('Health Endpoint:', health ? '✅ Working' : '❌ Failed');
  console.log('Environment Variables:');
  console.log('  - GEMINI_API_KEY:', health?.services?.gemini === 'configured' ? '✅ Set' : '❌ Missing');
  console.log('  - Supabase Config:', health?.services?.supabase === 'frontend-managed' ? '✅ Frontend-managed' : '❌ Issue');
  console.log('Generate API:', generateTest ? '✅ Working' : '❌ Failed');
  
  if (!health || !generateTest) {
    console.log('\n🔧 RECOMMENDED FIXES:');
    
    if (!health?.services?.gemini) {
      console.log('1. Add GEMINI_API_KEY to Vercel environment variables');
    }
    
    if (health?.services?.supabase !== 'frontend-managed') {
      console.log('2. Supabase should be configured in frontend only');
      console.log('   - Backend does not need Supabase credentials');
      console.log('   - Frontend handles uploads and provides public URLs to backend');
    }
    
    if (!generateTest) {
      console.log('3. Check Vercel function logs for detailed error messages');
      console.log('4. Verify Supabase bucket permissions allow public access');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Fix environment variables in Vercel dashboard');
    console.log('2. Redeploy your application');
    console.log('3. Run this test again');
  } else {
    console.log('\n🎉 All tests passed! Your deployment should be working.');
  }
}

// Run the diagnostics
runDiagnostics().catch(console.error); 