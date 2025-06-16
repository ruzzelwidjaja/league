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

interface VerificationEmailProps {
  userEmail: string;
  verificationUrl: string;
  userName?: string;
}

// TODO: Re-enable when fixing image paths
// Use different URLs for development vs production as recommended by React Email docs
// const baseUrl = process.env.NODE_ENV === "production"
//   ? (process.env.NEXT_PUBLIC_APP_URL)
//   : "";

function VerificationEmail({
  userEmail,
  verificationUrl,
  userName = "there",
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Verify your email to complete registration.</Preview>
        <Container style={container}>
          {/* TODO: Fix image paths - images not loading properly */}
          {/* <Img
            src={`${baseUrl}/static/PingPongIcon.png`}
            width={48}
            height={48}
            alt="Ping Pong League"
            style={logo}
          /> */}
          <Heading style={heading}>🏓 Verify Your Email</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              Hi {userName},
            </Text>
            <Text style={paragraph}>
              Welcome to the Ping Pong League! Please verify your email address to complete your registration.
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>
            <Text style={paragraph}>
              If you didn&apos;t create this account, please ignore this email.
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

// Styles
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

export async function createVerificationEmailHtml({
  userEmail,
  verificationUrl,
  userName = "there",
}: VerificationEmailProps): Promise<string> {
  return await render(
    VerificationEmail({
      userEmail,
      verificationUrl,
      userName,
    })
  );
}

// For React Email preview
VerificationEmail.PreviewProps = {
  userEmail: 'test@example.com',
  verificationUrl: 'https://example.com/verify',
  userName: 'John',
} as VerificationEmailProps;

export default VerificationEmail; 