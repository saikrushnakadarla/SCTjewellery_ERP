// InvoicePdf.jsx
// npm install @react-pdf/renderer number-to-words qrcode

import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { toWords } from "number-to-words";
import QRCode from "qrcode";

// Import your existing logo
import logo1 from '../../../../Navbar/MANIKANTHA JEWELLERS FINAL LOOG DESIGN (1)_page-0001.jpg';

const styles = StyleSheet.create({
  // =====================================================
  // PAGE - A5 Landscape
  // =====================================================
  srsPdfPage: {
    paddingTop: 8,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 38,
    fontSize: 7,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
    color: "#111",
  },

  // =====================================================
  // HEADER - Logo left, Company middle, Invoice right
  // =====================================================
  srsPdfHeaderMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },

  srsPdfHeaderLogo: {
    width: "20%",
    alignItems: "flex-start",
  },

  srsPdfLogoImage: {
    width: 60,
    height: 30,
    objectFit: "contain",
  },

  srsPdfHeaderMiddle: {
    width: "50%",
    alignItems: "center",
  },

  srsPdfCompanyName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1b2f70",
    textAlign: "center",
    marginBottom: 2,
  },

  srsPdfCompanyAddress: {
    fontSize: 6.5,
    textAlign: "center",
    color: "#333",
  },

  srsPdfHeaderRight: {
    width: "25%",
    alignItems: "flex-end",
  },

  srsPdfRightLine: {
    fontSize: 7,
    marginBottom: 2,
    fontWeight: "bold",
  },

  // =====================================================
  // CUSTOMER DETAILS ROW
  // =====================================================
  srsPdfCustomerRow: {
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },

  srsPdfCustomerText: {
    fontSize: 6.5,
    marginBottom: 1,
  },

  // =====================================================
  // TABLE
  // =====================================================
  srsPdfTableWrap: {
    borderWidth: 0.5,
    borderColor: "#444",
  },

  srsPdfTableHead: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderBottomWidth: 0.5,
    borderColor: "#444",
    minHeight: 16,
    alignItems: "center",
  },

  srsPdfTableRow: {
    flexDirection: "row",
    minHeight: 22,
    borderBottomWidth: 0,
  },

  srsPdfEmptyRow: {
    flexDirection: "row",
    minHeight: 30,
    borderColor: "#444",
  },

  srsPdfTableTotalRow: {
    flexDirection: "row",
    minHeight: 20,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#444",
    backgroundColor: "#f5f5f5",
  },

  srsPdfCellBase: {
    padding: 2,
    paddingHorizontal: 3,
    borderRightWidth: 0.5,
    borderRightColor: "#444",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    justifyContent: "center",
  },

  srsPdfCellSlNo: { width: "5%" },
  srsPdfCellParticulars: { width: "22%" },
  srsPdfCellHsn: { width: "7%" },
  srsPdfCellPcs: { width: "5%" },
  srsPdfCellPurity: { width: "7%" },
  srsPdfCellGrossWt: { width: "9%" },
  srsPdfCellStWt: { width: "7%" },
  srsPdfCellNetWt: { width: "9%" },
  srsPdfCellStChg: { width: "7%" },
  srsPdfCellVa: { width: "6%" },
  srsPdfCellMc: { width: "7%" },
  srsPdfCellRate: { width: "9%" },
  srsPdfCellAmount: {
    width: "10%",
    borderRightWidth: 0,
  },

  srsPdfHeadText: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "center",
  },

  srsPdfBodyText: {
    fontSize: 6,
  },

  srsPdfCenterText: {
    fontSize: 6,
    textAlign: "center",
  },

  srsPdfRightText: {
    fontSize: 6,
    textAlign: "right",
  },

  // =====================================================
  // BOTTOM SECTION
  // =====================================================
  srsPdfBottomMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },

  srsPdfAmountBlock: {
    width: "32%",
  },

  srsPdfAmountWords: {
    fontSize: 6.5,
    fontWeight: "bold",
  },

  srsPdfStampBlock: {
    width: "25%",
    alignItems: "center",
  },

  srsPdfStampCircle: {
    borderWidth: 1,
    borderColor: "#5d4bb3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  srsPdfStampText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#5d4bb3",
  },

  srsPdfDeliveredText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#5d4bb3",
    marginTop: 2,
  },

  srsPdfChargesBlock: {
    width: "38%",
  },

  srsPdfChargesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  srsPdfChargesLabel: {
    fontSize: 6.5,
  },

  srsPdfChargesValue: {
    fontSize: 6.5,
  },

  // =====================================================
  // QR CODE
  // =====================================================
  qrCode: {
    width: 40,
    height: 40,
    marginTop: 4,
  },

  // =====================================================
  // FOOTER
  // =====================================================
  srsPdfFooterBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#a98548",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  srsPdfFooterLeft: {
    fontSize: 6,
    color: "#fff",
    width: "30%",
  },

  srsPdfFooterCenter: {
    fontSize: 5.5,
    color: "#fff",
    textAlign: "center",
    width: "35%",
  },

  srsPdfFooterRight: {
    fontSize: 5.5,
    color: "#fff",
    textAlign: "right",
    width: "30%",
  },
});

const TaxINVoiceReceipt = ({
  formData,
  repairDetails,
  cash_amount,
  discountAmt,
  festivalDiscountAmt,
  card_amt,
  chq_amt,
  online_amt,
  taxableAmount,
  taxAmount,
  oldItemsAmount,
  schemeAmount,
  salesNetAmount,
  salesTaxableAmount,
  selectedAdvanceReceiptAmount,
  netAmount,
  netPayableAmount,
  product,
  company,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(formData?.invoice_number || "", {
          width: 100,
          margin: 2,
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };
    generateQRCode();
  }, [formData?.invoice_number]);

  // Calculate total values from repairDetails
  const totalValues = repairDetails.reduce(
    (totals, item) => {
      return {
        qty: totals.qty + Number(item.qty || 0),
        grossWeight: totals.grossWeight + Number(item.gross_weight || 0),
        stoneWeight: totals.stoneWeight + Number(item.stone_weight || 0),
        netWeight: totals.netWeight + Number(item.total_weight_av || 0),
        rate: totals.rate + Number(item.rate || 0),
        makingCharges: totals.makingCharges + Number(item.making_charges || 0),
        stonePrice: totals.stonePrice + Number(item.stone_price || 0),
        rateAmount: totals.rateAmount + Number(item.rate_amt || 0),
        hmCharges: totals.hmCharges + Number(item.hm_charges || 0),
      };
    },
    {
      qty: 0,
      grossWeight: 0,
      stoneWeight: 0,
      netWeight: 0,
      rate: 0,
      makingCharges: 0,
      stonePrice: 0,
      rateAmount: 0,
      hmCharges: 0,
    }
  );

  const netBillValueInWords = toWords(Math.round(netPayableAmount)).replace(
    /(^\w|\s\w)/g,
    (m) => m.toUpperCase()
  );

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return getCurrentDate();
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate filler rows (target 6 rows total including data rows)
  const itemCount = repairDetails.length;
  const fillerRowsNeeded = Math.max(0, 5 - itemCount);

  const formatNumber = (value, decimals = 2) => {
    return Number(value || 0).toFixed(decimals);
  };

  const companyGST = company?.gst_no || "29EXQPP3451K1ZN";
  const companyMobile = company?.mobile || "9901334636";
  const companyEmail = company?.email || "sales@srsjewellers.com";
  const companyName = company?.company_name || "MANIKANTHA JEWELLERS";

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.srsPdfPage}>
        {/* ===================================================== */}
        {/* HEADER - Logo Left | Company Middle | Invoice Right */}
        {/* ===================================================== */}
        <View style={styles.srsPdfHeaderMainRow}>
          {/* Left - Logo */}
          <View style={styles.srsPdfHeaderLogo}>
            <Image style={styles.srsPdfLogoImage} src={logo1} />
          </View>

          {/* Middle - Company Name and Address */}
          <View style={styles.srsPdfHeaderMiddle}>
            <Text style={styles.srsPdfCompanyName}>{companyName}</Text>
            <Text style={styles.srsPdfCompanyAddress}>
              Keshavakrupa complex, near chennakeshava swamy temple, kote, belur 573115
            </Text>
          </View>

          {/* Right - Invoice Number, Date, Time (line by line) */}
          <View style={styles.srsPdfHeaderRight}>
            <Text style={styles.srsPdfRightLine}>INV No: {formData?.invoice_number || "2023-24/CB0723-9615"}</Text>
            <Text style={styles.srsPdfRightLine}>Date: {formatDate(formData?.date)}</Text>
            <Text style={styles.srsPdfRightLine}>Time: {getCurrentTime()}</Text>
          </View>
        </View>

        {/* ===================================================== */}
        {/* CUSTOMER DETAILS - Single line */}
        {/* ===================================================== */}
        <View style={styles.srsPdfCustomerRow}>
          <Text style={styles.srsPdfCustomerText}>
            Customer: {formData?.account_name || ""} | Mobile: {formData?.mobile || ""} | 
            GSTIN: {formData?.gst_in || ""} | PAN: {formData?.pan_card || ""}
          </Text>
          <Text style={styles.srsPdfCustomerText}>
            Address: {formData?.address1 || ""} {formData?.address2 || ""} {formData?.city || ""} {formData?.state || ""} - {formData?.pincode || ""}
          </Text>
        </View>

        {/* ===================================================== */}
        {/* TABLE */}
        {/* ===================================================== */}
        <View style={styles.srsPdfTableWrap}>
          {/* TABLE HEADER */}
          <View style={styles.srsPdfTableHead}>
            {[
              ["Sl No", "srsPdfCellSlNo"],
              ["Particulars", "srsPdfCellParticulars"],
              ["HSN", "srsPdfCellHsn"],
              ["Pcs", "srsPdfCellPcs"],
              ["Purity", "srsPdfCellPurity"],
              ["Gross Wt", "srsPdfCellGrossWt"],
              ["St Wt", "srsPdfCellStWt"],
              ["Net Wt", "srsPdfCellNetWt"],
              ["St Chg", "srsPdfCellStChg"],
              ["VA", "srsPdfCellVa"],
              ["MC", "srsPdfCellMc"],
              ["Rate", "srsPdfCellRate"],
              ["Amount", "srsPdfCellAmount"],
            ].map(([label, className], index) => (
              <View
                key={index}
                style={[styles.srsPdfCellBase, styles[className]]}
              >
                <Text style={styles.srsPdfHeadText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* DATA ROWS - Dynamic from repairDetails */}
          {repairDetails.map((item, idx) => {
            const matchedProduct = product.find(
              (p) => p.product_name === item.category
            );
            const totalAmount =
              parseFloat(item.rate_amt || 0) +
              parseFloat(item.stone_price || 0) +
              parseFloat(item.making_charges || 0) +
              parseFloat(item.hm_charges || 0);
            return (
              <View key={idx} style={styles.srsPdfTableRow}>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellSlNo]}>
                  <Text style={styles.srsPdfCenterText}>{idx + 1}</Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellParticulars]}>
                  <Text style={styles.srsPdfBodyText}>
                    {item.metal_type || ""}-{item.product_name || ""}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellHsn]}>
                  <Text style={styles.srsPdfCenterText}>
                    {matchedProduct?.hsn_code || "711319"}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellPcs]}>
                  <Text style={styles.srsPdfCenterText}>{item.qty || 0}</Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellPurity]}>
                  <Text style={styles.srsPdfCenterText}>
                    {item.printing_purity || "916"}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellGrossWt]}>
                  <Text style={styles.srsPdfRightText}>
                    {formatNumber(item.gross_weight, 3)}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellStWt]}>
                  <Text style={styles.srsPdfRightText}>
                    {formatNumber(item.stone_weight, 3)}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellNetWt]}>
                  <Text style={styles.srsPdfRightText}>
                    {formatNumber(item.total_weight_av, 3)}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellStChg]}>
                  <Text style={styles.srsPdfRightText}>
                    {formatNumber(item.stone_price, 2)}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellVa]}>
                  <Text style={styles.srsPdfCenterText}>10.00%</Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellMc]}>
                  <Text style={styles.srsPdfCenterText}>
                    {item.mc_per_gram
                      ? `${formatNumber(item.mc_per_gram)}%`
                      : "0"}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellRate]}>
                  <Text style={styles.srsPdfRightText}>
                    {item.pieace_cost ? formatNumber(item.pieace_cost, 2) : formatNumber(item.rate, 2)}
                  </Text>
                </View>
                <View style={[styles.srsPdfCellBase, styles.srsPdfCellAmount]}>
                  <Text style={styles.srsPdfRightText}>
                    {formatNumber(totalAmount, 2)}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* EMPTY ROWS (Filler) */}
          {Array.from({ length: fillerRowsNeeded }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.srsPdfEmptyRow}>
              {[
                "srsPdfCellSlNo",
                "srsPdfCellParticulars",
                "srsPdfCellHsn",
                "srsPdfCellPcs",
                "srsPdfCellPurity",
                "srsPdfCellGrossWt",
                "srsPdfCellStWt",
                "srsPdfCellNetWt",
                "srsPdfCellStChg",
                "srsPdfCellVa",
                "srsPdfCellMc",
                "srsPdfCellRate",
                "srsPdfCellAmount",
              ].map((cell, cellIdx) => (
                <View
                  key={cellIdx}
                  style={[styles.srsPdfCellBase, styles[cell]]}
                >
                  <Text></Text>
                </View>
              ))}
            </View>
          ))}

          {/* TOTAL ROW - with horizontal line above */}
          <View style={styles.srsPdfTableTotalRow}>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellSlNo]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellParticulars]}>
              <Text style={styles.srsPdfHeadText}>Total</Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellHsn]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellPcs]}>
              <Text style={styles.srsPdfCenterText}>
                {Math.round(totalValues.qty)}
              </Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellPurity]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellGrossWt]}>
              <Text style={styles.srsPdfRightText}>
                {formatNumber(totalValues.grossWeight, 3)}
              </Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellStWt]}>
              <Text style={styles.srsPdfRightText}>
                {formatNumber(totalValues.stoneWeight, 3)}
              </Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellNetWt]}>
              <Text style={styles.srsPdfRightText}>
                {formatNumber(totalValues.netWeight, 3)}
              </Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellStChg]}>
              <Text style={styles.srsPdfRightText}>
                {formatNumber(totalValues.stonePrice, 2)}
              </Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellVa]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellMc]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellRate]}>
              <Text></Text>
            </View>
            <View style={[styles.srsPdfCellBase, styles.srsPdfCellAmount]}>
              <Text style={styles.srsPdfRightText}>
                {formatNumber(
                  totalValues.rateAmount +
                    totalValues.makingCharges +
                    totalValues.stonePrice +
                    totalValues.hmCharges,
                  2
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* ===================================================== */}
        {/* BOTTOM SECTION - Amount Words, Stamp, Charges */}
        {/* ===================================================== */}
        <View style={styles.srsPdfBottomMainRow}>
          <View style={styles.srsPdfAmountBlock}>
            <Text style={styles.srsPdfAmountWords}>
              (Rupees {netBillValueInWords} Only)
            </Text>
            {qrCodeUrl && <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />}
          </View>

          <View style={styles.srsPdfStampBlock}>
            {/* <View style={styles.srsPdfStampCircle}>
              <Text style={styles.srsPdfStampText}>SRS</Text>
            </View> */}
            {/* <Text style={styles.srsPdfDeliveredText}>DELIVERED</Text> */}
          </View>

          <View style={styles.srsPdfChargesBlock}>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Discount:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(discountAmt + festivalDiscountAmt)}
              </Text>
            </View>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Payable GST Value:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(taxableAmount)}
              </Text>
            </View>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Payable CGST@1.50%:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(taxAmount / 2)}
              </Text>
            </View>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Payable SGST@1.50%:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(taxAmount / 2)}
              </Text>
            </View>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Net Bill Value:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(netAmount)}
              </Text>
            </View>
           
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>(-) OLD/SCHEME:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(oldItemsAmount + schemeAmount)}
              </Text>
            </View>
            <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>(-) ADVANCE:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(selectedAdvanceReceiptAmount)}
              </Text>
            </View> 
             <View style={styles.srsPdfChargesRow}>
              <Text style={styles.srsPdfChargesLabel}>Net Amount:</Text>
              <Text style={styles.srsPdfChargesValue}>
                {formatNumber(Math.round(netPayableAmount))}
              </Text>
            </View>
          </View>
        </View>

        {/* ===================================================== */}
        {/* FOOTER - All details in A5 landscape */}
        {/* ===================================================== */}
        <View style={styles.srsPdfFooterBar}>
          <Text style={styles.srsPdfFooterLeft}>GST : {companyGST}</Text>
          {/* <Text style={styles.srsPdfFooterCenter}>
            {companyEmail}{"\n"}
            Ph : {companyMobile}
          </Text> */}
          <Text style={styles.srsPdfFooterRight}>
            BIS Certified Jewellers{"\n"}
            Govt. approved valuers for Jewellery.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TaxINVoiceReceipt;