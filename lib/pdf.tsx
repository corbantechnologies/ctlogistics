import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    fontSize: 10,
    color: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#F59E0B",
    paddingBottom: 12,
    marginBottom: 20,
  },
  brandLogoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  brandSubText: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "right",
  },
  docSubTitle: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "right",
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metaCol: {
    width: "48%",
  },
  metaLabel: {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 6,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colDesc: { width: "60%" },
  colQty: { width: "15%", textAlign: "center" },
  colAmount: { width: "25%", textAlign: "right" },

  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalBox: {
    width: "45%",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 10,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: { fontSize: 10, color: "#92400E" },
  totalVal: { fontSize: 11, fontWeight: "bold", color: "#78350F" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
  },
});

export interface ReceiptData {
  bookingRef: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  vehicleCategory: string;
  origin: string;
  destination: string;
  scheduledDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
  datePaid: string;
}

// React PDF Document Component for Official Receipt
const ReceiptDocument: React.FC<{ data: ReceiptData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandLogoText}>CT DRIVE</Text>
          <Text style={styles.brandSubText}>Corban Technologies LTD • Kenya</Text>
        </View>
        <View>
          <Text style={styles.docTitle}>OFFICIAL RECEIPT</Text>
          <Text style={styles.docSubTitle}>#{data.bookingRef}</Text>
        </View>
      </View>

      {/* Meta Grid */}
      <View style={styles.metaGrid}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Billed To</Text>
          <Text style={styles.metaVal}>{data.clientName}</Text>
          <Text style={{ fontSize: 9, color: "#475569" }}>{data.clientEmail}</Text>
          <Text style={{ fontSize: 9, color: "#475569" }}>{data.clientPhone}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Payment Details</Text>
          <Text style={styles.metaVal}>Date: {data.datePaid}</Text>
          <Text style={{ fontSize: 9, color: "#475569" }}>Method: {data.paymentMethod}</Text>
          <Text style={{ fontSize: 9, color: "#10B981", fontWeight: "bold" }}>Status: {data.paymentStatus}</Text>
        </View>
      </View>

      {/* Line Item Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Service Description</Text>
          <Text style={styles.colQty}>Route</Text>
          <Text style={styles.colAmount}>Amount (KES)</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text style={{ fontWeight: "bold" }}>{data.serviceType} ({data.vehicleCategory})</Text>
            <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>Scheduled: {data.scheduledDate}</Text>
          </View>
          <Text style={styles.colQty}>{data.origin} ➔ {data.destination}</Text>
          <Text style={styles.colAmount}>{data.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Charge:</Text>
            <Text style={styles.totalVal}>KES {data.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 4 }]}>
            <Text style={styles.totalLabel}>Amount Paid:</Text>
            <Text style={[styles.totalVal, { color: "#047857" }]}>KES {data.amountPaid.toLocaleString()}</Text>
          </View>
          {data.totalAmount - data.amountPaid > 0 && (
            <View style={[styles.totalRow, { marginTop: 4 }]}>
              <Text style={styles.totalLabel}>Balance Due:</Text>
              <Text style={[styles.totalVal, { color: "#B91C1C" }]}>KES {(data.totalAmount - data.amountPaid).toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Corban Technologies LTD • CT Drive Transport Platform • Mombasa & Nairobi, Kenya</Text>
        <Text style={{ marginTop: 2 }}>Support: +254 768 978 865 • bookings@ctdrive.co.ke • www.ctdrive.co.ke</Text>
      </View>
    </Page>
  </Document>
);

/**
 * Generate PDF Buffer for booking receipt
 */
export async function generateBookingReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReceiptDocument data={data} />);
  return buffer;
}
