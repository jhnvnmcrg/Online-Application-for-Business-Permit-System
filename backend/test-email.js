// Quick email test script
require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Sending to:', process.env.EMAIL_USER);

  try {
    await sendVerificationEmail(
      process.env.EMAIL_USER, // Send to yourself
      'Test User',
      'test-token-12345',
      'Owner'
    );
    console.log('✅ Email sent successfully! Check your inbox.');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check EMAIL_USER and EMAIL_PASSWORD in .env');
    console.error('2. Make sure you\'re using Gmail App Password, not regular password');
    console.error('3. Enable 2-Factor Authentication in your Google Account');
    console.error('4. Check your internet connection');
  }
}

testEmail();
