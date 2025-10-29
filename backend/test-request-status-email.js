// Test script for request status email notification
require('dotenv').config();
const { sendRequestStatusEmail } = require('./utils/emailService');

async function testRequestStatusEmail() {
  console.log('🧪 Testing Request Status Email Notification...\n');

  // Test data (simulating a real request status update)
  const testEmail = process.env.EMAIL_USER; // Send to yourself
  const ownerName = 'John Doe';
  const trackingCode = 'OABP-2025-00001';
  const categoryName = 'Business Permit';
  const oldStatus = 'Pending';
  const newStatus = 'Under Review';
  const remarks = 'Your documents are being reviewed by our team. We will notify you once completed.';

  console.log('Test Parameters:');
  console.log('├─ To:', testEmail);
  console.log('├─ Owner:', ownerName);
  console.log('├─ Tracking Code:', trackingCode);
  console.log('├─ Category:', categoryName);
  console.log('├─ Status Change:', `${oldStatus} → ${newStatus}`);
  console.log('└─ Remarks:', remarks);
  console.log('');

  try {
    console.log('Sending email...');

    await sendRequestStatusEmail(
      testEmail,
      ownerName,
      trackingCode,
      categoryName,
      oldStatus,
      newStatus,
      remarks
    );

    console.log('\n✅ SUCCESS! Request status email sent!');
    console.log('\nCheck your inbox:', testEmail);
    console.log('Subject: Request ' + trackingCode + ' Status Update - OABP System');
    console.log('\nThe email should contain:');
    console.log('✓ Tracking code:', trackingCode);
    console.log('✓ Document type:', categoryName);
    console.log('✓ Previous status:', oldStatus);
    console.log('✓ New status:', newStatus + ' (in color)');
    console.log('✓ Remarks:', remarks);
    console.log('✓ Track request button');

  } catch (error) {
    console.error('\n❌ FAILED to send request status email');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check EMAIL_* configuration in .env');
    console.error('2. Make sure email test (test-email.js) worked first');
    console.error('3. Check internet connection');
    console.error('4. Review error details above');
  }
}

// Run the test
testRequestStatusEmail();
