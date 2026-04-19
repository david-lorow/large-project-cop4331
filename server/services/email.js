const sgMail = require('@sendgrid/mail');

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const FROM_ADDRESS = process.env.EMAIL_FROM;
const APP_URL = (process.env.APP_URL || 'http://localhost:6767/').replace(/\/$/, '');

if (EMAIL_ENABLED) {
  if (!process.env.GRID_KEY) {
    throw new Error('GRID_KEY must be set when EMAIL_ENABLED=true');
  }
  sgMail.setApiKey(process.env.GRID_KEY);
}

/**
 * Send an email verification link to a newly registered user.
 * @param {{ email: string, firstName: string, token: string }} params
 */
async function sendVerificationEmail({ email, firstName, token }) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!EMAIL_ENABLED) {
    console.log(`[email] EMAIL_ENABLED=false — skipping send to ${email}`);
    console.log(`[email] Verification URL (dev): ${verifyUrl}`);
    return;
  }

  const msg = {
    to: email,
    from: FROM_ADDRESS,
    subject: 'Verify your email address',
    text: `Hi ${firstName},\n\nPlease verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, you can safely ignore this email.`,
    html: `
      <p>Hi ${firstName},</p>
      <p>Thanks for registering! Please verify your email address by clicking the button below.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}"
           style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p style="color:#6B7280;font-size:13px;">If you did not create an account, you can safely ignore this email.</p>
    `,
  };

  await sgMail.send(msg);
}

/**
 * Send a password reset link to a user.
 * @param {{ email: string, firstName: string, token: string }} params
 */
async function sendPasswordResetEmail({ email, firstName, token }) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!EMAIL_ENABLED) {
    console.log(`[email] EMAIL_ENABLED=false — skipping send to ${email}`);
    console.log(`[email] Password reset URL (dev): ${resetUrl}`);
    return;
  }

  const msg = {
    to: email,
    from: FROM_ADDRESS,
    subject: 'Reset your password',
    text: `Hi ${firstName},\n\nYou requested a password reset. Visit the link below to choose a new password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.`,
    html: `
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to choose a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}"
           style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p style="color:#6B7280;font-size:13px;">If you did not request a password reset, you can safely ignore this email.</p>
    `,
  };

  await sgMail.send(msg);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };