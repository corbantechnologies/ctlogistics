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

interface PartnerWelcomeProps {
  partnerName: string;
  loginEmail: string;
  tempPassword?: string;
  portalLink: string;
}

export const PartnerWelcomeEmail = ({
  partnerName = "Partner",
  loginEmail = "partner@example.com",
  tempPassword = "changeme123",
  portalLink = "https://www.ctdrive.co.ke/partner/login",
}: PartnerWelcomeProps) => (
  <Html>
    <Head />
    <Preview>Welcome to CT Drive Partner Network</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to CT Drive</Heading>
        <Text style={text}>Hi {partnerName},</Text>
        <Text style={text}>
          Your partner account has been successfully created. You can now access the CT Drive Partner Portal to manage your fleet, view assigned jobs, and track your settlements.
        </Text>
        
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Portal URL:</strong> <Link href={portalLink}>{portalLink}</Link></Text>
          <Text style={detailsText}><strong>Login Email:</strong> {loginEmail}</Text>
          {tempPassword && (
            <Text style={detailsText}><strong>Temporary Password:</strong> {tempPassword}</Text>
          )}
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={portalLink} style={button}>
            Log In to Partner Portal
          </Link>
        </Section>
        
        <Text style={text}>
          Please log in and change your password immediately from the Settings page.
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

const detailsSection = {
  backgroundColor: "#f4f4f5",
  padding: "20px",
  margin: "20px",
  borderRadius: "8px",
};

const detailsText = {
  color: "#333",
  fontSize: "15px",
  margin: "0 0 10px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#10b981", // Green color for partner portal
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

export default PartnerWelcomeEmail;
