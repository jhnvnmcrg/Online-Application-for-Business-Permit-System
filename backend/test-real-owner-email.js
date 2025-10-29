// Test sending email to a real owner from your database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sendRequestStatusEmail } = require('./utils/emailService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testRealOwnerEmail() {
  console.log('🧪 Testing Email to Real Owner from Database\n');

  try {
    // Step 1: Get a real request with owner details
    console.log('Step 1: Fetching real request from database...');

    const { data: request, error } = await supabase
      .from('Requests')
      .select(`
        request_id,
        tracking_code,
        status,
        owner_id,
        Owners!inner(email, fullname),
        Document Categories!inner(category_name)
      `)
      .limit(1)
      .single();

    if (error || !request) {
      console.log('\n❌ No requests found in database.');
      console.log('\nTo test:');
      console.log('1. Create a test owner first (or use existing)');
      console.log('2. Create a test request for that owner');
      console.log('3. Run this script again\n');
      return;
    }

    // Step 2: Display what we found
    console.log('✅ Found request in database:\n');
    console.log('Request Details:');
    console.log('├─ Request ID:', request.request_id);
    console.log('├─ Tracking Code:', request.tracking_code);
    console.log('├─ Category:', request['Document Categories'].category_name);
    console.log('├─ Current Status:', request.status);
    console.log('├─ Owner Name:', request.Owners.fullname);
    console.log('└─ Owner Email:', request.Owners.email);
    console.log('');

    // Step 3: Confirm before sending
    console.log('⚠️  ATTENTION:');
    console.log(`An email will be sent to: ${request.Owners.email}`);
    console.log('This is a REAL email address from your database!');
    console.log('');

    // Step 4: Send the email
    console.log('Step 2: Sending request status email...\n');

    const oldStatus = request.status;
    const newStatus = request.status === 'Pending' ? 'Under Review' : 'Approved';
    const remarks = 'This is a test email notification from your OABP system.';

    await sendRequestStatusEmail(
      request.Owners.email,
      request.Owners.fullname,
      request.tracking_code,
      request['Document Categories'].category_name,
      oldStatus,
      newStatus,
      remarks
    );

    // Step 5: Success!
    console.log('✅ SUCCESS! Email sent to real owner!\n');
    console.log('Email Details:');
    console.log('├─ From: ' + process.env.EMAIL_USER);
    console.log('├─ To: ' + request.Owners.email);
    console.log('├─ Subject: Request ' + request.tracking_code + ' Status Update');
    console.log('└─ Content: Status changed from "' + oldStatus + '" to "' + newStatus + '"');
    console.log('');
    console.log('🎉 The owner should receive the email shortly!');
    console.log('If the owner is YOU, check your inbox.');
    console.log('If the owner is someone else, ask them to check their email.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testRealOwnerEmail();
