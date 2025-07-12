/**
 * Check Gemini API quota and usage
 */
const axios = require('axios');

async function checkAPIQuota(apiKey) {
  console.log('🔍 Checking Gemini API Status...\n');
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    console.log('Usage: node check-api-quota.js YOUR_API_KEY');
    return;
  }

  // Test 1: Simple API call to check if it's working
  console.log('📡 Test 1: Basic API connectivity...');
  try {
    const startTime = Date.now();
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        contents: [{ 
          parts: [{ text: 'Hello' }] 
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ API is working! Response time: ${responseTime}ms\n`);
    
  } catch (error) {
    console.log('❌ API Test Failed:');
    
    if (error.response?.status === 503) {
      console.log('   🚫 Status 503: Service Temporarily Unavailable');
      console.log('   📝 Meaning: Google\'s servers are overloaded');
      console.log('   🕒 Solution: Wait 1-5 minutes and try again');
      console.log('   ⏰ Peak hours: 9AM-5PM PST are typically busiest\n');
    } else if (error.response?.status === 429) {
      console.log('   🚫 Status 429: Rate Limit Exceeded');
      console.log('   📝 Meaning: You\'ve hit the request limit');
      console.log('   🕒 Solution: Wait 1 minute for rate limit reset');
      console.log('   📊 Free tier: 15 requests/minute, 1500/day\n');
    } else if (error.response?.status === 403) {
      console.log('   🚫 Status 403: Quota Exceeded or Invalid Key');
      console.log('   📝 Meaning: Daily quota exceeded or API key issue');
      console.log('   🕒 Solution: Check your API key or wait until tomorrow\n');
    } else {
      console.log(`   🚫 Status ${error.response?.status}: ${error.message}\n`);
    }
    return;
  }

  // Test 2: Multiple rapid requests to test rate limiting
  console.log('🔄 Test 2: Rate limit testing (5 rapid requests)...');
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < 5; i++) {
    try {
      await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: `Test ${i + 1}` }] }],
          generationConfig: { maxOutputTokens: 5 }
        },
        { timeout: 5000 }
      );
      successCount++;
      process.stdout.write('✅ ');
    } catch (error) {
      failCount++;
      if (error.response?.status === 503) {
        process.stdout.write('🔄 ');
      } else if (error.response?.status === 429) {
        process.stdout.write('⏳ ');
      } else {
        process.stdout.write('❌ ');
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed\n`);
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('==================');
  
  if (failCount === 0) {
    console.log('✅ Your API key is working perfectly!');
    console.log('✅ No rate limiting or quota issues detected');
  } else if (failCount <= 2) {
    console.log('⚠️  Occasional failures detected');
    console.log('   - Try spacing out requests more');
    console.log('   - Consider implementing retry logic');
  } else {
    console.log('🚫 High failure rate detected');
    console.log('   - Check if you\'ve exceeded daily quota');
    console.log('   - Try again during off-peak hours');
    console.log('   - Consider upgrading to paid tier if needed');
  }
  
  console.log('\n🕒 BEST PRACTICES:');
  console.log('==================');
  console.log('• Wait 4-5 seconds between requests');
  console.log('• Avoid peak hours (9AM-5PM PST)');
  console.log('• Keep requests under 100KB input size');
  console.log('• Monitor your daily usage');
}

// Get API key from command line
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('Usage: node check-api-quota.js YOUR_API_KEY');
  console.log('Example: node check-api-quota.js AIzaSyC8UYZpvA2eknrILOX...');
  process.exit(1);
}

checkAPIQuota(apiKey); 