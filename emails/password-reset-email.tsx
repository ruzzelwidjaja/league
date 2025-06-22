import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  // Img, // TODO: Re-enable when fixing image paths
  Heading,
  Text,
  Button,
  Hr,
  Preview,
} from '@react-email/components';
import { render } from '@react-email/render';

interface PasswordResetEmailProps {
  userEmail: string;
  resetUrl: string;
  userName?: string;
}

// TODO: Re-enable when fixing image paths
// Use different URLs for development vs production as recommended by React Email docs
// const baseUrl = process.env.NODE_ENV === "production"
//   ? (process.env.NEXT_PUBLIC_APP_URL)
//   : "";

function PasswordResetEmail({
  userEmail,
  resetUrl,
  userName = "there",
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Reset your password to regain access to your account.</Preview>
        <Container style={container}>
          {/* TODO: Fix image paths - images not loading properly */}
          {/* <Img
            src={`${baseUrl}/static/PingPongIcon.png`}
            width={48}
            height={48}
            alt="Ping Pong League"
            style={logo}
          /> */}
          <Heading style={heading}>🔐 Reset Your Password</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              Hi {userName},
            </Text>
            <Text style={paragraph}>
              We received a request to reset your password for your Ping Pong League account.
              Click the button below to create a new password:
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Your Password
              </Button>
            </Section>
            <Text style={paragraph}>
              <strong>This link will expire in 1 hour</strong> for security reasons.
            </Text>
            <Text style={paragraph}>
              If you didn&apos;t request this password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </Text>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />- The Ping Pong League Team
          </Text>
          <Hr style={hr} />
          {/* TODO: Fix image paths - bottom logo not loading properly */}
          {/* <Img
            src={`${baseUrl}/static/PingPongIcon.png`}
            width={32}
            height={32}
            style={{
              WebkitFilter: 'grayscale(100%)',
              filter: 'grayscale(100%)',
              margin: '20px 0',
            }}
          /> */}
          <Text style={footer}>Ping Pong League @WeWork</Text>
          <Text style={footer}>
            This email was sent to {userEmail}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (matching verification email for consistency)
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 25px 48px',
  // TODO: Fix background image path
  // backgroundImage: `url("${baseUrl}/static/EmailBackground.png")`,
  // backgroundPosition: 'bottom',
  // backgroundRepeat: 'no-repeat, no-repeat',
};

// TODO: Re-enable when fixing image paths
// const logo = {
//   margin: '30px 0 35px 0',
// };

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
};

const body = {
  margin: '24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#c0a891',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  display: 'inline-block',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const hr = {
  borderColor: '#dddddd',
  marginTop: '48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginLeft: '4px',
};

export async function createPasswordResetEmailHtml({
  userEmail,
  resetUrl,
  userName = "there",
}: PasswordResetEmailProps): Promise<string> {
  return await render(
    PasswordResetEmail({
      userEmail,
      resetUrl,
      userName,
    })
  );
}

// For React Email preview
PasswordResetEmail.PreviewProps = {
  userEmail: 'test@example.com',
  resetUrl: 'https://example.com/reset-password?token=abc123',
  userName: 'John',
} as PasswordResetEmailProps;

export default PasswordResetEmail; 