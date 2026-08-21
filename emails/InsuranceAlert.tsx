import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InsuranceAlertProps {
  partnerName: string;
  vehiclePlate: string;
  expiryDate: string;
  daysRemaining: number;
}

export const InsuranceAlertEmail = ({
  partnerName = "Partner",
  vehiclePlate = "KXX 123X",
  expiryDate = "2024-12-31",
  daysRemaining = 14,
}: InsuranceAlertProps) => (
  <Html>
    <Head />
    <Preview>Alert: Insurance expiring in {daysRemaining} days for {vehiclePlate}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Insurance Expiry Alert</Heading>
        <Text style={text}>
          This is an automated administrative alert.
        </Text>
        
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Partner:</strong> {partnerName}</Text>
          <Text style={detailsText}><strong>Vehicle Plate:</strong> {vehiclePlate}</Text>
          <Text style={detailsText}><strong>Expiry Date:</strong> {expiryDate}</Text>
          <Text style={detailsText}><strong style={{ color: "#ef4444" }}>Days Remaining: {daysRemaining}</strong></Text>
        </Section>
        
        <Text style={text}>
          Please follow up with the partner to ensure they renew their comprehensive or PSV insurance before the expiry date to remain compliant.
        </Text>
        <Text style={footer}>CT Drive Admin System</Text>
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
  color: "#ef4444", // Red color for alert
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
  backgroundColor: "#fef2f2", // Light red background
  border: "1px solid #fca5a5",
  padding: "20px",
  margin: "20px",
  borderRadius: "8px",
};

const detailsText = {
  color: "#333",
  fontSize: "15px",
  margin: "0 0 10px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 20px",
  marginTop: "48px",
};

export default InsuranceAlertEmail;
