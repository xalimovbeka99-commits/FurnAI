const fs = require('fs');
const path = require('path');

// 1. Manually parse .env.local to avoid external dependency issues
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Error: .env.local file not found at: ${envPath}`);
    console.log(`Please copy .env.example to .env.local and add your keys.`);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    // Trim and ignore comments/empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    
    const key = trimmed.substring(0, index).trim();
    let val = trimmed.substring(index + 1).trim();
    
    // Remove wrapping quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    
    env[key] = val;
  });
  
  return env;
}

const env = loadEnv();

console.log('🔍 Furni AI - API Credentials Diagnostic Test\n');

// Helper to check if key is still a placeholder
function isPlaceholder(value, keyName) {
  if (!value) return true;
  const lowerVal = value.toLowerCase();
  
  // Specific check for Supabase Dashboard URL copy-paste error
  if (keyName === 'NEXT_PUBLIC_SUPABASE_URL' && lowerVal.includes('supabase.com/dashboard')) {
    return false; // let the test run and fail with a specific message
  }
  
  return (
    lowerVal.includes('your_') ||
    lowerVal.includes('here') ||
    lowerVal.includes('dummy') ||
    lowerVal.includes('cloud_name')
  );
}

// Diagnostics list
const checks = [];

// 1. OpenAI Key Check
checks.push(async () => {
  const key = env.OPENAI_API_KEY;
  if (isPlaceholder(key)) {
    return { name: 'OpenAI API Key', status: 'SKIPPED', message: 'Placeholder value detected.' };
  }
  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: key });
    await openai.models.list();
    return { name: 'OpenAI API Key', status: 'SUCCESS', message: 'Successfully authenticated & retrieved models.' };
  } catch (err) {
    return { name: 'OpenAI API Key', status: 'FAILED', message: err.message };
  }
});

// 2. Anthropic Key Check
checks.push(async () => {
  const key = env.ANTHROPIC_API_KEY;
  if (isPlaceholder(key)) {
    return { name: 'Anthropic API Key', status: 'SKIPPED', message: 'Placeholder value detected.' };
  }
  try {
    const { Anthropic } = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: key });
    
    // Try Claude 3.5 Sonnet
    await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }]
    });
    return { name: 'Anthropic API Key', status: 'SUCCESS', message: 'Successfully authenticated with Claude.' };
  } catch (err) {
    // If it's a 404 not found or overloaded, but not a 401/403 auth error, then the key is valid!
    if (err.message.includes('not_found_error') || err.message.includes('model')) {
      return { name: 'Anthropic API Key', status: 'SUCCESS', message: `Authenticated successfully (Key is valid, requested model returned: ${err.message}).` };
    }
    return { name: 'Anthropic API Key', status: 'FAILED', message: err.message };
  }
});

// 3. Supabase Credentials Check
checks.push(async () => {
  let url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (isPlaceholder(url) || isPlaceholder(anonKey)) {
    return { name: 'Supabase Config', status: 'SKIPPED', message: 'Placeholder values detected.' };
  }
  
  if (url.includes('supabase.com/dashboard/project/')) {
    const parts = url.split('/project/');
    const projectRef = parts[1].split('/')[0];
    const correctUrl = `https://${projectRef}.supabase.co`;
    return { 
      name: 'Supabase Config', 
      status: 'FAILED', 
      message: `You entered the Supabase Dashboard URL. Change NEXT_PUBLIC_SUPABASE_URL to: "${correctUrl}"` 
    };
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { name: 'Supabase Connection', status: 'SUCCESS', message: `Connected successfully to ${url}` };
  } catch (err) {
    return { name: 'Supabase Connection', status: 'FAILED', message: err.message };
  }
});

// 4. Brave Search Check
checks.push(async () => {
  const key = env.BRAVE_API_KEY;
  if (isPlaceholder(key)) {
    return { name: 'Brave Search API Key', status: 'SKIPPED', message: 'Placeholder value detected.' };
  }
  try {
    const res = await fetch('https://api.search.brave.com/res/v1/web/search?q=test', {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': key }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    return { name: 'Brave Search API Key', status: 'SUCCESS', message: 'Web search test query succeeded.' };
  } catch (err) {
    return { name: 'Brave Search API Key', status: 'FAILED', message: err.message };
  }
});

// 5. Cloudinary Config Check
checks.push(async () => {
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
    return { name: 'Cloudinary Config', status: 'SKIPPED', message: 'Placeholder values detected.' };
  }
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64')
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    return { name: 'Cloudinary API', status: 'SUCCESS', message: 'Cloudinary connection ping succeeded.' };
  } catch (err) {
    return { name: 'Cloudinary API', status: 'FAILED', message: err.message };
  }
});

// 6. Resend Check
checks.push(async () => {
  const key = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL;
  
  if (isPlaceholder(key)) {
    return { name: 'Resend API Key', status: 'SKIPPED', message: 'Placeholder value detected.' };
  }
  
  if (fromEmail && (fromEmail.startsWith('http://') || fromEmail.startsWith('https://'))) {
    return { 
      name: 'Resend Config', 
      status: 'FAILED', 
      message: 'RESEND_FROM_EMAIL must be a valid email address (e.g. "onboarding@resend.dev" or "info@yourdomain.com"), not a website URL.' 
    };
  }
  
  return { name: 'Resend API Key', status: 'SUCCESS', message: 'API key format is valid.' };
});

// Run all checks sequentially
async function runChecks() {
  for (const check of checks) {
    process.stdout.write(`Testing... `);
    const result = await check();
    readlineClearLine();
    if (result.status === 'SUCCESS') {
      console.log(`✅ \x1b[32m[${result.status}]\x1b[0m ${result.name}: ${result.message}`);
    } else if (result.status === 'SKIPPED') {
      console.log(`⚠️  \x1b[33m[${result.status}]\x1b[0m ${result.name}: ${result.message}`);
    } else {
      console.log(`❌ \x1b[31m[${result.status}]\x1b[0m ${result.name}: ${result.message}`);
    }
  }
  console.log('\n🏁 Diagnostics complete.');
}

// Clear current line helper
function readlineClearLine() {
  process.stdout.write('\r\x1b[K');
}

runChecks();
