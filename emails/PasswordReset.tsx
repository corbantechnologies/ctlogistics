import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetProps {
  userType: "Admin" | "Partner";
  resetLink: string;
}

export const PasswordResetEmail = ({
  userType = "Admin",
  resetLink = "https://www.ctdrive.co.ke",
}: PasswordResetProps) => (
  <Html>
    <Head />
    <Preview>Reset your CT Drive {userType} password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Password Reset Request</Heading>
        <Text style={text}>
          We received a request to reset your password for your CT Drive <strong>{userType}</strong> account.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={resetLink} style={button}>
            Reset Password
          </Link>
        </Section>
        
        <Text style={text}>
          If you didn't request this, you can safely ignore this email. Your password will not change until you click the link above and create a new one.
        </Text>
        
        <Text style={footer}>Corban Technologies LTD, Mombasa, Kenya</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  fontWeight: "bold",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 20px",
  marginTop: "48px",
};

export default PasswordResetEmail;
