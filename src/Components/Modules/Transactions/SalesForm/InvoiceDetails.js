// import React, { useEffect } from "react";
// import { Col, Row } from "react-bootstrap";
// import InputField from "./InputfieldSales";
// import { useLocation } from "react-router-dom";

// const InvoiceDetails = ({ formData, setFormData }) => {
//   const location = useLocation();

//   // Set the default date value to the current date if it's not already set
//   useEffect(() => {
//     if (!formData.date) {
//       setFormData((prev) => ({
//         ...prev,
//         date: new Date().toISOString().split("T")[0],
//       }));
//     }
//   }, [formData, setFormData]);

//   // Update formData.invoice_number from location.state
//   useEffect(() => {
//     if (location.state?.invoice_number && formData.invoice_number !== location.state.invoice_number) {
//       console.log("Received Invoice Number from navigation:", location.state.invoice_number);
//       setFormData((prev) => ({
//         ...prev,
//         invoice_number: location.state.invoice_number,
//       }));
//     }
//   }, [location.state, formData.invoice_number, setFormData]);

//   return (
//     <Col className="sales-form-section">
//       <Row>
//         {/* <Col xs={12} md={6}>
//           <InputField
//             label="Terms"
//             type="select"
//             value={formData.terms}
//             name="terms"
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 terms: e.target.value,
//               }))
//             }
//             options={[
//               { value: "Cash", label: "Cash" },
//               { value: "Credit", label: "Credit" },
//             ]}
//           />
//         </Col> */}
//         <Col xs={12} md={12}>
//           <InputField
//             label="Date:"
//             name="date"
//             value={formData.date}
//             type="date"
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 date: e.target.value,
//               }))
//             }
//             max={new Date().toISOString().split("T")[0]}
//           />
//         </Col>
//       </Row>
//       <Row>
//         <Col xs={12}>
//           <InputField
//             label="Invoice Number"
//             name="invoice_number"
//             value={formData.invoice_number || ""}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 invoice_number: e.target.value,
//               }))
//             }
//           />
//         </Col>
//       </Row>
//     </Col>
//   );
// };

// export default InvoiceDetails;



import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import InputField from "./InputfieldSales";
import { useLocation } from "react-router-dom";

const InvoiceDetails = ({ formData, setFormData, salesmen = [], handleSalesmanChange }) => {
  const location = useLocation();

  // Set the default date value to the current date if it's not already set
  useEffect(() => {
    if (!formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [formData, setFormData]);

  // Update formData.invoice_number from location.state
  useEffect(() => {
    if (location.state?.invoice_number && formData.invoice_number !== location.state.invoice_number) {
      console.log("Received Invoice Number from navigation:", location.state.invoice_number);
      setFormData((prev) => ({
        ...prev,
        invoice_number: location.state.invoice_number,
      }));
    }
  }, [location.state, formData.invoice_number, setFormData]);

  return (
    <Col className="sales-form-section">
      {/* Row 1: Date */}
      <Row>
        <Col xs={12} md={12}>
          <InputField
            label="Date:"
            name="date"
            value={formData.date}
            type="date"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            max={new Date().toISOString().split("T")[0]}
          />
        </Col>
      </Row>

      {/* Row 2: Invoice Number */}
      <Row>
        <Col xs={12} md={12}>
          <InputField
            label="Invoice Number"
            name="invoice_number"
            value={formData.invoice_number || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                invoice_number: e.target.value,
              }))
            }
          />
        </Col>
      </Row>

      {/* Row 3: Salesman Name */}
      <Row>
        <Col xs={12} md={12}>
          <InputField
            label="Salesman Name"
            name="salesman_id"
            type="select"
            value={formData.salesman_id || ""}
            onChange={handleSalesmanChange}
            options={[
              { value: "", label: "Select Salesman" },
              ...salesmen.map((salesman) => ({
                value: String(salesman.account_id), // Convert to string for consistency
                label: salesman.account_name,
              }))
            ]}
          />
        </Col>
      </Row>
    </Col>
  );
};

export default InvoiceDetails;