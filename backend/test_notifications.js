// Test file to manually create and verify notifications
// Run this with: node test_notifications.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testNotifications() {
  console.log('🔍 Testing Notification System...\n');

  // Step 1: Check if Notifications table exists
  console.log('1️⃣ Checking Notifications table...');
  const { data: tableCheck, error: tableError } = await supabase
    .from('Notifications')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error('❌ Notifications table error:', tableError.message);
    console.log('\n💡 Solution: Create the Notifications table in Supabase SQL Editor:');
    console.log(`
CREATE TABLE IF NOT EXISTS public."Notifications" (
  notification_id SERIAL PRIMARY KEY,
  user_type VARCHAR,
  user_id INTEGER,
  type VARCHAR,
  template VARCHAR,
  subject VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'Pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  request_id INTEGER,
  payment_id INTEGER
);
    `);
    return;
  }
  console.log('✅ Notifications table exists\n');

  // Step 2: Get a test user (Owner)
  console.log('2️⃣ Finding a test user...');
  const { data: testUser, error: userError } = await supabase
    .from('Owners')
    .select('owner_id, username, email')
    .limit(1)
    .single();

  if (userError || !testUser) {
    console.error('❌ No users found in Owners table');
    console.log('💡 Create a user account first through the registration page');
    return;
  }
  console.log(`✅ Found test user: ${testUser.username} (ID: ${testUser.owner_id})\n`);

  // Step 3: Create a test notification
  console.log('3️⃣ Creating test notification...');
  const { data: notification, error: createError } = await supabase
    .from('Notifications')
    .insert([{
      user_type: 'User',
      user_id: testUser.owner_id,
      type: 'Test',
      subject: 'Test Notification',
      message: 'This is a test notification created by test_notifications.js',
      status: 'Pending'
    }])
    .select();

  if (createError) {
    console.error('❌ Failed to create notification:', createError.message);
    return;
  }
  console.log('✅ Notification created:', notification[0]);
  console.log(`   Notification ID: ${notification[0].notification_id}\n`);

  // Step 4: Fetch unread count
  console.log('4️⃣ Testing unread count...');
  const { count, error: countError } = await supabase
    .from('Notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'User')
    .eq('user_id', testUser.owner_id)
    .is('read_at', null);

  if (countError) {
    console.error('❌ Failed to get unread count:', countError.message);
  } else {
    console.log(`✅ Unread count: ${count}\n`);
  }

  // Step 5: Fetch all notifications for user
  console.log('5️⃣ Fetching notifications for user...');
  const { data: notifications, error: fetchError } = await supabase
    .from('Notifications')
    .select('*')
    .eq('user_type', 'User')
    .eq('user_id', testUser.owner_id)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Failed to fetch notifications:', fetchError.message);
  } else {
    console.log(`✅ Found ${notifications.length} notifications:`);
    notifications.forEach(n => {
      console.log(`   - [${n.status}] ${n.subject} (${n.created_at})`);
    });
    console.log('');
  }

  // Step 6: Get a test request
  console.log('6️⃣ Testing request notification creation...');
  const { data: testRequest, error: requestError } = await supabase
    .from('Requests')
    .select('request_id, owner_id, tracking_code, status')
    .eq('owner_id', testUser.owner_id)
    .limit(1)
    .single();

  if (!testRequest) {
    console.log('ℹ️  No requests found for this user. Skipping request notification test\n');
  } else {
    console.log(`✅ Found test request: ${testRequest.tracking_code}\n`);

    // Create request status notification
    const { data: reqNotif, error: reqNotifError } = await supabase
      .from('Notifications')
      .insert([{
        user_type: 'User',
        user_id: testRequest.owner_id,
        type: 'Request',
        subject: `Request ${testRequest.tracking_code} - Status Update`,
        message: `Your request has been updated to ${testRequest.status}`,
        request_id: testRequest.request_id,
        status: 'Pending'
      }])
      .select();

    if (reqNotifError) {
      console.error('❌ Failed to create request notification:', reqNotifError.message);
    } else {
      console.log('✅ Request notification created:', reqNotif[0].notification_id, '\n');
    }
  }

  // Step 7: Summary
  console.log('📊 TEST SUMMARY:');
  console.log('================');
  console.log(`User ID: ${testUser.owner_id}`);
  console.log(`User Type: User`);
  console.log(`Total Notifications: ${notifications.length}`);
  console.log(`Unread Count: ${count}`);
  console.log('\n💡 TO TEST IN BROWSER:');
  console.log(`1. Login as: ${testUser.username}`);
  console.log('2. Look for notification bell icon in navbar');
  console.log('3. Check browser console for errors (F12)');
  console.log('4. Verify localStorage has:');
  console.log('   - userType: "User"');
  console.log(`   - user.owner_id: ${testUser.owner_id}`);
  console.log('\n🔗 Test API endpoints:');
  console.log(`GET http://localhost:3000/api/notifications/User/${testUser.owner_id}/unread-count`);
  console.log(`GET http://localhost:3000/api/notifications/User/${testUser.owner_id}`);
}

// Run the test
testNotifications()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });
