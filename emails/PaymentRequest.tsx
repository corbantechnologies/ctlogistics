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

interface PaymentRequestProps {
  clientName: string;
  bookingRef: string;
  serviceType: string;
  vehicleCategory: string;
  totalAmount: number;
  depositRequired: number;
  paymentUrl: string;
}

export const PaymentRequestEmail = ({
  clientName = "Valued Client",
  bookingRef = "BK-XXXXXX",
  serviceType = "Private Safari Charter",
  vehicleCategory = "Land Cruiser 4x4",
  totalAmount = 45000,
  depositRequired = 13500,
  paymentUrl = "https://www.ctdrive.co.ke/track/xxx",
}: PaymentRequestProps) => (
  <Html>
    <Head />
    <Preview>CT Drive — Vehicle Confirmed! Complete Payment for #{bookingRef}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>CT DRIVE</Text>
          <Text style={subLogoText}>Premier Kenya Transport & Safari Platform</Text>
        </Section>

        <Heading style={h1}>Vehicle Availability Confirmed!</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          Great news! A verified partner vehicle (<strong>{vehicleCategory}</strong>) has been confirmed for your <strong>{serviceType}</strong> service (Ref: <strong>{bookingRef}</strong>).
        </Text>

        <Section style={detailsSection}>
          <Text style={detailsTitle}>Payment Summary</Text>
          <Text style={detailsText}><strong>Total Trip Amount:</strong> KES {totalAmount.toLocaleString()}</Text>
          <Text style={detailsText}>
            <strong>Deposit Required to Lock:</strong> KES {depositRequired.toLocaleString()} ({Math.round((depositRequired / totalAmount) * 100)}%)
          </Text>
          {totalAmount - depositRequired > 0 && (
            <Text style={detailsText}>
              <strong>Balance Due on Pickup:</strong> KES {(totalAmount - depositRequired).toLocaleString()}
            </Text>
          )}
        </Section>

        <Text style={text}>
          Please click the button below to complete your secure payment via M-Pesa STK Push or Card. Once payment is received, your official PDF receipt and driver dispatch details will be issued immediately.
        </Text>

        <Section style={buttonContainer}>
          <Link href={paymentUrl} style={button}>
            Pay KES {depositRequired.toLocaleString()} via M-Pesa
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
  backgroundColor: "#10b981",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "13px 28px",
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

export default PaymentRequestEmail;
