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

interface BookingReceiptProps {
  clientName: string;
  bookingRef: string;
  amountPaid: number;
  paymentMethod: string;
  receiptUrl: string;
}

export const BookingReceiptEmail = ({
  clientName = "Client",
  bookingRef = "BK-XXXXXX",
  amountPaid = 0,
  paymentMethod = "M-PESA",
  receiptUrl = "https://www.ctdrive.co.ke/track/xxx/receipt",
}: BookingReceiptProps) => (
  <Html>
    <Head />
    <Preview>Payment Receipt for Booking {bookingRef}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Payment Received</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          We have successfully received your payment for booking <strong>{bookingRef}</strong>.
        </Text>
        
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Amount Paid:</strong> KES {amountPaid.toLocaleString()}</Text>
          <Text style={detailsText}><strong>Payment Method:</strong> {paymentMethod}</Text>
          <Text style={detailsText}><strong>Status:</strong> Confirmed</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={receiptUrl} style={button}>
            Download Full Receipt (PDF)
          </Link>
        </Section>
        
        <Text style={text}>
          Thank you for choosing CT Logistics. We look forward to serving you.
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
  backgroundColor: "#3b82f6", // Blue color for receipt
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

export default BookingReceiptEmail;
