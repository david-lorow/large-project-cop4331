jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('Email service', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.EMAIL_ENABLED;
    delete process.env.GRID_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.APP_URL;
  });

  test('does not send verification email when EMAIL_ENABLED=false', async () => {
    process.env.EMAIL_ENABLED = 'false';

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const sgMail = require('@sendgrid/mail');
    const { sendVerificationEmail } = require('../services/email');

    await sendVerificationEmail({
      email: 'test@example.com',
      firstName: 'Test',
      token: 'abc123',
    });

    expect(sgMail.send).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('sends verification email when EMAIL_ENABLED=true', async () => {
    process.env.EMAIL_ENABLED = 'true';
    process.env.GRID_KEY = 'fake-key';
    process.env.EMAIL_FROM = 'noreply@test.com';
    process.env.APP_URL = 'http://localhost:6767';

    const sgMail = require('@sendgrid/mail');
    const { sendVerificationEmail } = require('../services/email');

    await sendVerificationEmail({
      email: 'test@example.com',
      firstName: 'Test',
      token: 'abc123',
    });

    expect(sgMail.send).toHaveBeenCalledTimes(1);

    const msg = sgMail.send.mock.calls[0][0];
    expect(msg.to).toBe('test@example.com');
    expect(msg.from).toBe('noreply@test.com');
    expect(msg.subject).toMatch(/Verify/i);
    expect(msg.text).toContain('abc123');
    expect(msg.html).toContain('abc123');
    expect(msg.html).toContain('/verify-email?token=abc123');
  });

  test('sends password reset email with correct link', async () => {
    process.env.EMAIL_ENABLED = 'true';
    process.env.GRID_KEY = 'fake-key';
    process.env.EMAIL_FROM = 'noreply@test.com';
    process.env.APP_URL = 'http://localhost:6767';

    const sgMail = require('@sendgrid/mail');
    const { sendPasswordResetEmail } = require('../services/email');

    await sendPasswordResetEmail({
      email: 'test@example.com',
      firstName: 'Test',
      token: 'reset123',
    });

    expect(sgMail.send).toHaveBeenCalledTimes(1);

    const msg = sgMail.send.mock.calls[0][0];
    expect(msg.to).toBe('test@example.com');
    expect(msg.from).toBe('noreply@test.com');
    expect(msg.subject).toMatch(/Reset/i);
    expect(msg.text).toContain('reset123');
    expect(msg.html).toContain('reset123');
    expect(msg.html).toContain('/reset-password?token=reset123');
  });
});