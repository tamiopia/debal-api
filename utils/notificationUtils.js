const nodemailer = require('nodemailer');

// Email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = (to, subject, text) => {
  return transporter.sendMail({ to, subject, text });
};

// Push (simplified)
exports.sendPush = async (userId, message) => {
  const user = await User.findById(userId).select('pushSubscription');
  if (user.pushSubscription) {
    // Implement with WebPush/FCM as needed
    console.log('Push sent to:', userId, 'Message:', message);
  }
};