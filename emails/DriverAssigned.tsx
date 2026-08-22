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

interface DriverAssignedProps {
  clientName: string;
  bookingRef: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  trackingLink: string;
}

export const DriverAssignedEmail = ({
  clientName = "Client",
  bookingRef = "BK-XXXXXX",
  driverName = "John Doe",
  driverPhone = "+254700000000",
  vehicleModel = "Toyota Prado",
  vehiclePlate = "KXX 123X",
  trackingLink = "https://www.ctdrive.co.ke/track/xxx",
}: DriverAssignedProps) => (
  <Html>
    <Head />
    <Preview>Your driver details for booking {bookingRef}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Driver Assigned</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          A driver has been assigned to your booking <strong>{bookingRef}</strong>. Here are the details:
        </Text>
        
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Driver Name:</strong> {driverName}</Text>
          <Text style={detailsText}><strong>Driver Phone:</strong> {driverPhone}</Text>
          <Text style={detailsText}><strong>Vehicle:</strong> {vehicleModel}</Text>
          <Text style={detailsText}><strong>Plate Number:</strong> {vehiclePlate}</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link href={trackingLink} style={button}>
            View Live Status
          </Link>
        </Section>
        
        <Text style={text}>
          Please have your ID and booking reference ready for the driver upon collection.
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

export default DriverAssignedEmail;
