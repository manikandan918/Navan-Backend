require('dotenv').config();
const express = require('express');
const { createTransport } = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10kb' }));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/contact', limiter);

const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'navan-contact-backend' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, company, service, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and message are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  const html = `
    <h2>Navan Enquiry</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Company</strong></td><td>${escapeHtml(company || '—')}</td></tr>
      <tr><td><strong>Service</strong></td><td>${escapeHtml(service || '—')}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(message)}</p>
    <hr>
    <p style="color:#666;font-size:12px;">Sent from the Navan Quantity Surveyors website contact form.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Navan Enquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `Navan enquiry from ${name}`,
      html,
    });

    res.json({ success: true, message: 'Enquiry sent successfully' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send the enquiry. Please try again later.',
    });
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.listen(PORT, () => {
  console.log(`Contact API listening on port ${PORT}`);
});