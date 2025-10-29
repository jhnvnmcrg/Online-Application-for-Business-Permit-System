// Test the complete API flow - simulates what happens in production
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const API_URL = 'http://localhost:3000';

async function testCompleteEmailFlow() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Testing Complete Email Flow (API → Database → Email)');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Get a real request from database
    console.log('Step 1: Getting real request from database...');

    const { data: request, error } = await supabase
      .from('Requests')
      .select(`
        request_id,
        tracking_code,
        status,
        owner_id,
        Owners!inner(email, fullname)
      `)
      .limit(1)
      .single();

    if (error || !request) {
      console.log('❌ No requests found. Create a test request first.\n');
      return;
    }

    console.log('✅ Found request:');
    console.log('   Request ID:', request.request_id);
    console.log('   Tracking Code:', request.tracking_code);
    console.log('   Owner:', request.Owners.fullname);
    console.log('   Owner Email:', request.Owners.email);
    console.log('   Current Status:', request.status);
    console.log('');

    // Step 2: Get an admin ID
    const { data: admin } = await supabase
      .from('Admins')
      .select('admin_id')
      .limit(1)
      .single();

    if (!admin) {
      console.log('❌ No admin found. Create an admin first.\n');
      return;
    }

    // Step 3: Update request status via API (this triggers email)
    console.log('Step 2: Calling API to update request status...');
    console.log('   (This should trigger email notification)');
    console.log('');

    const newStatus = request.status === 'Pending' ? 'Under Review' : 'Approved';

    console.log('⚠️  IMPORTANT:');
    console.log(`   Backend server must be running on ${API_URL}`);
    console.log(`   Email will be sent to: ${request.Owners.email}`);
    console.log('');
    console.log('Updating status from "' + request.status + '" to "' + newStatus + '"...');
    console.log('');

    const response = await axios.put(
      `${API_URL}/api/request/update-status/${request.request_id}`,
      {
        status: newStatus,
        processedBy: admin.admin_id,
        remarks: 'Test email notification - request status update'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data.success) {
      console.log('✅ API call successful!');
      console.log('');
      console.log('Step 3: Email should be sent now!');
      console.log('');
      console.log('Email Details:');
      console.log('├─ From:', process.env.EMAIL_USER);
      console.log('├─ To:', request.Owners.email);
      console.log('├─ Status:', request.status, '→', newStatus);
      console.log('└─ Remarks: Test email notification');
      console.log('');
      console.log('🎉 SUCCESS! Check the email inbox:', request.Owners.email);
      console.log('');
      console.log('Also check backend console for:');
      console.log('  ✅ Request status email sent to: ' + request.Owners.email);
    } else {
      console.log('❌ API call failed:', response.data.message);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running!');
      console.log('');
      console.log('Start the backend first:');
      console.log('   cd backend');
      console.log('   npm start');
      console.log('');
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════');
}

testCompleteEmailFlow();
