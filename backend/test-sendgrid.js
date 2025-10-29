require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSendGrid() {
  console.log('Testing SendGrid configuration...\n');

  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('API Key:', process.env.EMAIL_PASSWORD ? 'Set (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET');
  console.log('');

  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'johnivanmacaraeg01@gmail.com', // Send to yourself
      subject: 'SendGrid Test - OABP System',
      html: `
        <h2>SendGrid Email Test</h2>
        <p>This is a test email from your OABP system using SendGrid.</p>
        <p>If you received this, SendGrid is configured correctly! ✅</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\nCheck your inbox at: johnivanmacaraeg01@gmail.com');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testSendGrid();
