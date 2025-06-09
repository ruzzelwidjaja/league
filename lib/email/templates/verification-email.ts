interface VerificationEmailProps {
  userEmail: string;
  verificationUrl: string;
  userName?: string;
}

export const createVerificationEmailHtml = ({
  userEmail,
  verificationUrl,
  userName = 'there',
}: VerificationEmailProps): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email - Ping Pong League</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f6f9fc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px 0 48px;
        }
        .logo {
          text-align: center;
          font-size: 48px;
          margin: 40px 0;
        }
        .header {
          color: #333;
          font-size: 24px;
          font-weight: bold;
          margin: 40px 32px;
          text-align: center;
        }
        .text {
          color: #333;
          font-size: 16px;
          line-height: 26px;
          margin: 16px 32px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background-color: #007ee6;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 16px;
        }
        .link {
          color: #007ee6;
          word-break: break-all;
          font-size: 14px;
        }
        .footer {
          color: #333;
          font-size: 16px;
          line-height: 26px;
          margin: 32px 32px 16px;
        }
        .footer-section {
          border-top: 1px solid #e6ebf1;
          margin-top: 32px;
          padding-top: 32px;
        }
        .footer-text {
          color: #8898aa;
          font-size: 12px;
          line-height: 16px;
          margin: 16px 32px;
          text-align: center;
        }
        .bullet-list {
          margin: 16px 32px;
          padding-left: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏓</div>
        
        <h1 class="header">Welcome to Ping Pong League!</h1>
        
        <p class="text">Hi ${userName},</p>
        
        <p class="text">
          Thanks for signing up for the Ping Pong League! Before you can start challenging your colleagues and climbing the rankings, we need to verify your email address.
        </p>
        
        <div class="button-container">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p class="text">
          If the button doesn't work, you can also click the link below or copy and paste it into your browser:
        </p>
        
        <p class="text">
          <a href="${verificationUrl}" class="link">${verificationUrl}</a>
        </p>
        
        <p class="text">
          This verification link will expire in 1 hour for security reasons.
        </p>
        
        <p class="text">
          If you didn't create this account, you can safely ignore this email.
        </p>
        
        <p class="footer">
          Best regards,<br/>
          The Ping Pong League Team
        </p>
        
        <div class="footer-section">
          <p class="footer-text">
            This email was sent to ${userEmail}. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 