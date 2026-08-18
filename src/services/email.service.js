require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `FinoEdge <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to FinoEdge"
  const text = `Hello ${name}\n\n Thank you for registering at FinoEdge`

  await sendEmail(userEmail, subject, text)
}

async function sendTransactionEmail(emailData) {

  const {
    userName,
    email,
    transactionType,
    amount,
    currency,
    accountNumber,
    dateTime,
    availableBalance,
    referenceNo
  } = emailData;

  const subject = `Alert: Transaction Successful - ${transactionType} of ${currency} ${amount} on Account ending in ${accountNumber}`;

  const text = `Dear ${userName},

We wish to inform you that a transaction has been successfully processed on your account.

Transaction Type: ${transactionType}
Amount: ${currency} ${amount}
Account Number: ${accountNumber}
Date & Time: ${dateTime}
Available Balance: ${currency} ${availableBalance}
Transaction Reference No: ${referenceNo}

Thank you for banking with us. 
Regards,
FinoEdge Security Team

Please do not reply directly to this automated email.`;

  await sendEmail(email, subject, text);
}

async function sendTransactionFailureEmail(emailData) {
  const {
    userName,
    email,
    transactionType,
    amount,
    currency,
    accountNumber
  } = emailData;

  const subject = `Alert: Transaction Failed - ${transactionType} of ${currency} ${amount} on Account ending in ${accountNumber}`;

  const text = `Dear ${userName},\n\n We wish to inform you that a recent transaction processing attempt on your account has failed. Please contact support if you have questions.`;

  await sendEmail(email, subject, text);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail }