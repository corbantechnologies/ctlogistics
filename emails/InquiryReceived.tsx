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

interface InquiryReceivedProps {
  clientName: string;
  inquiryRef: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  trackingLink: string;
}

export const InquiryReceivedEmail = ({
  clientName = "Valued Client",
  inquiryRef = "INQ-XXXXXX",
  serviceType = "Car Hire / Safari Rental",
  pickupLocation = "Nairobi",
  destination = "Maasai Mara",
  pickupDate = "2026-09-10",
  trackingLink = "https://www.ctdrive.co.ke/track/xxx",
}: InquiryReceivedProps) => (
  <Html>
    <Head />
    <Preview>CT Drive — Inquiry Received #{inquiryRef}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>CT DRIVE</Text>
          <Text style={subLogoText}>Premier Kenya Transport & Safari Platform</Text>
        </Section>

        <Heading style={h1}>Inquiry Received</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          Thank you for reaching out! We have received your inquiry for <strong>{serviceType}</strong> (Ref: <strong>{inquiryRef}</strong>).
        </Text>
        <Text style={text}>
          Our team and verified fleet partners are currently reviewing vehicle availability for your requested route and dates.
        </Text>

        <Section style={detailsSection}>
          <Text style={detailsTitle}>Inquiry Summary</Text>
          <Text style={detailsText}><strong>Service:</strong> {serviceType}</Text>
          <Text style={detailsText}><strong>Pickup Point:</strong> {pickupLocation}</Text>
          <Text style={detailsText}><strong>Destination:</strong> {destination}</Text>
          <Text style={detailsText}><strong>Scheduled Date:</strong> {pickupDate}</Text>
        </Section>

        <Text style={text}>
          Once availability is locked in, you will receive a direct notification with complete trip pricing and your M-Pesa payment link to confirm the booking.
        </Text>

        <Section style={buttonContainer}>
          <Link href={trackingLink} style={button}>
            View Inquiry Status
          </Link>
        </Section>

        <Text style={footer}>
          Corban Technologies LTD • CT Drive Operations<br />
          Mombasa & Nairobi, Kenya • Support: +254 768 978 865
        </Text>
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
  padding: "24px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  maxWidth: "580px",
  border: "1px solid #e2e8f0",
};

const headerSection = {
  textAlign: "center" as const,
  padding: "16px 20px",
  borderBottom: "2px solid #f59e0b",
  marginBottom: "24px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#0f172a",
  margin: "0",
  letterSpacing: "1px",
};

const subLogoText = {
  fontSize: "11px",
  color: "#64748b",
  margin: "4px 0 0 0",
};

const h1 = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const text = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "24px",
  padding: "0 24px",
  margin: "0 0 12px 0",
};

const detailsSection = {
  backgroundColor: "#f8fafc",
  padding: "18px 24px",
  margin: "20px 24px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const detailsTitle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailsText = {
  color: "#334155",
  fontSize: "14px",
  margin: "0 0 8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button = {
  backgroundColor: "#f59e0b",
  borderRadius: "6px",
  color: "#0f172a",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
  fontWeight: "bold",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  padding: "0 24px",
  textAlign: "center" as const,
  marginTop: "36px",
};

export default InquiryReceivedEmail;
