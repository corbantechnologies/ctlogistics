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

interface BookingConfirmationProps {
  clientName: string;
  bookingRef: string;
  serviceType: string;
  totalAmount: number;
  trackingLink: string;
}

export const BookingConfirmationEmail = ({
  clientName = "Client",
  bookingRef = "BK-XXXXXX",
  serviceType = "Transfer",
  totalAmount = 0,
  trackingLink = "https://www.ctdrive.co.ke/track/xxx",
}: BookingConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Your CT Logistics booking {bookingRef} is confirmed.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Received</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          We have received your booking request for a <strong>{serviceType}</strong> service.
          Your reference number is <strong>{bookingRef}</strong>.
        </Text>
        
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Total Amount:</strong> KES {totalAmount.toLocaleString()}</Text>
          <Text style={detailsText}>
            You can track the status of your booking, complete payment, and view your driver details once assigned via your magic tracking link:
          </Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={trackingLink} style={button}>
            Track My Booking
          </Link>
        </Section>
        
        <Text style={text}>
          If you have any questions, reply to this email or call our 24/7 dispatch center.
        </Text>
        <Text style={footer}>CT Logistics Ltd, Mombasa, Kenya</Text>
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
  backgroundColor: "#f59e0b",
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

export default BookingConfirmationEmail;
