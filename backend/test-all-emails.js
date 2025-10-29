// Comprehensive email test - Test all email notification types
require('dotenv').config();
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRequestStatusEmail,
  sendPaymentStatusEmail,
  sendNewRequestNotificationToAdmin
} = require('./utils/emailService');

const testEmail = process.env.EMAIL_USER;

console.log('═══════════════════════════════════════════════════════');
console.log('  OABP Email Notification System - Comprehensive Test');
console.log('═══════════════════════════════════════════════════════\n');
console.log('Testing all 5 email types...');
console.log('Sending to:', testEmail);
console.log('');

async function testAllEmails() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Email Verification
  console.log('1️⃣  Testing Email Verification...');
  try {
    await sendVerificationEmail(
      testEmail,
      'Test User',
      'verification-token-12345',
      'Owner'
    );
    console.log('   ✅ Email Verification - PASSED\n');
    results.passed++;
    results.tests.push({ name: 'Email Verification', status: 'PASSED' });
  } catch (error) {
    console.error('   ❌ Email Verification - FAILED:', error.message, '\n');
    results.failed++;
    results.tests.push({ name: 'Email Verification', status: 'FAILED' });
  }

  // Test 2: Password Reset
  console.log('2️⃣  Testing Password Reset Email...');
  try {
    await sendPasswordResetEmail(
      testEmail,
      'Test User',
      'reset-token-12345',
      'Owner'
    );
    console.log('   ✅ Password Reset - PASSED\n');
    results.passed++;
    results.tests.push({ name: 'Password Reset', status: 'PASSED' });
  } catch (error) {
    console.error('   ❌ Password Reset - FAILED:', error.message, '\n');
    results.failed++;
    results.tests.push({ name: 'Password Reset', status: 'FAILED' });
  }

  // Test 3: Request Status Update
  console.log('3️⃣  Testing Request Status Update Email...');
  try {
    await sendRequestStatusEmail(
      testEmail,
      'Test Owner',
      'OABP-2025-00001',
      'Business Permit',
      'Pending',
      'Under Review',
      'Your documents are being reviewed.'
    );
    console.log('   ✅ Request Status Update - PASSED\n');
    results.passed++;
    results.tests.push({ name: 'Request Status Update', status: 'PASSED' });
  } catch (error) {
    console.error('   ❌ Request Status Update - FAILED:', error.message, '\n');
    results.failed++;
    results.tests.push({ name: 'Request Status Update', status: 'FAILED' });
  }

  // Test 4: Payment Verification
  console.log('4️⃣  Testing Payment Verification Email...');
  try {
    await sendPaymentStatusEmail(
      testEmail,
      'Test Owner',
      'OABP-2025-00001',
      'REF-2025-001',
      'Verified',
      'Payment has been verified successfully.'
    );
    console.log('   ✅ Payment Verification - PASSED\n');
    results.passed++;
    results.tests.push({ name: 'Payment Verification', status: 'PASSED' });
  } catch (error) {
    console.error('   ❌ Payment Verification - FAILED:', error.message, '\n');
    results.failed++;
    results.tests.push({ name: 'Payment Verification', status: 'FAILED' });
  }

  // Test 5: New Request Notification (to Admin)
  console.log('5️⃣  Testing New Request Admin Notification...');
  try {
    await sendNewRequestNotificationToAdmin(
      testEmail,
      'Test Admin',
      'OABP-2025-00001',
      'Business Permit',
      'John Doe'
    );
    console.log('   ✅ New Request Admin Notification - PASSED\n');
    results.passed++;
    results.tests.push({ name: 'New Request Admin Notification', status: 'PASSED' });
  } catch (error) {
    console.error('   ❌ New Request Admin Notification - FAILED:', error.message, '\n');
    results.failed++;
    results.tests.push({ name: 'New Request Admin Notification', status: 'FAILED' });
  }

  // Print Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.name}`);
  });
  console.log('');
  console.log('Total Tests:', results.passed + results.failed);
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Check your inbox:', testEmail);
    console.log('You should have received 5 emails.');
  } else {
    console.log('⚠️  Some tests failed. Check configuration and try again.');
  }
  console.log('═══════════════════════════════════════════════════════');
}

testAllEmails();
