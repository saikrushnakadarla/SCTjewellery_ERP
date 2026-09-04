import React, { useState, useEffect } from 'react';
import Navbar from '../../../../Navbar/Navbar';
import axios from 'axios';
import DataTable from '../../../Pages/InputField/DataTable';
import { Button, Row, Col } from 'react-bootstrap';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './GSTR1report.css';
import baseURL from '../../../../Url/NodeBaseURL';

function GSTR1report() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [uniqueInvoices, setUniqueInvoices] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-unique-repair-details`);
      const sales = response.data.filter(item => item.transaction_status === 'Sales');
      setSalesData(sales);
      setFilteredData(sales);
      
      const invoices = [...new Set(sales.map(item => item.invoice_number))];
      setUniqueInvoices(invoices);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...salesData];

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
      });
    }

    if (selectedInvoice) {
      filtered = filtered.filter(item => item.invoice_number === selectedInvoice);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSelectedInvoice('');
    setFilteredData(salesData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Columns for DataTable
  const columns = React.useMemo(
    () => [
      {
        Header: 'S.No',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Invoice No',
        accessor: 'invoice_number',
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Customer Name',
        accessor: 'account_name',
      },
      {
        Header: 'Customer GST',
        accessor: 'gst_in',
      },
      // {
      //   Header: 'Product Name',
      //   accessor: 'product_name',
      // },
      // {
      //   Header: 'Category',
      //   accessor: 'category',
      // },
      {
        Header: 'Taxable Amount',
        accessor: 'taxable_amount',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: 'Tax %',
        accessor: 'tax_percent',
        Cell: ({ value }) => `${value || 0}%`,
      },
      {
        Header: 'SGST',
        accessor: 'sgst_amt',
        Cell: ({ row }) => {
          const taxAmt = parseFloat(row.original.tax_amount || 0);
          const sgst = taxAmt / 2;
          return `₹ ${sgst.toFixed(2)}`;
        },
      },
      {
        Header: 'CGST',
        accessor: 'cgst_amt',
        Cell: ({ row }) => {
          const taxAmt = parseFloat(row.original.tax_amount || 0);
          const cgst = taxAmt / 2;
          return `₹ ${cgst.toFixed(2)}`;
        },
      },
      {
        Header: 'Tax Amount',
        accessor: 'tax_amt',
        Cell: ({ row }) => {
          const taxAmt = parseFloat(row.original.tax_amount || 0);
          return `₹ ${taxAmt.toFixed(2)}`;
        },
      },
      {
        Header: 'Net Amount',
        accessor: 'net_amount',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
    ],
    []
  );

  // Calculate totals
  const calculateTotals = () => {
    const totalTaxableAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.taxable_amount || 0), 0);
    const totalTaxAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.tax_amount || 0), 0);
    const totalNetAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.net_amount || 0), 0);
    const totalSGST = totalTaxAmount / 2;
    const totalCGST = totalTaxAmount / 2;
    
    return {
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalTaxAmount: totalTaxAmount.toFixed(2),
      totalNetAmount: totalNetAmount.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalCGST: totalCGST.toFixed(2),
      totalRecords: filteredData.length
    };
  };

  const totals = calculateTotals();

  // Export to Excel
  const handleDownloadExcel = () => {
    if (!filteredData.length) {
      alert('No data to export');
      return;
    }

    try {
      const formattedData = filteredData.map((item, index) => {
        const taxAmt = parseFloat(item.tax_amount || 0);
        return {
          "S.No": index + 1,
          "Invoice No": item.invoice_number,
          "Date": formatDate(item.date),
          "Customer Name": item.account_name,
          "Product Name": item.product_name,
          "Category": item.category,
          "Taxable Amount": parseFloat(item.taxable_amount || 0).toFixed(2),
          "Tax %": `${item.tax_percent || 0}%`,
          "SGST": (taxAmt / 2).toFixed(2),
          "CGST": (taxAmt / 2).toFixed(2),
          "Tax Amount": parseFloat(item.tax_amount || 0).toFixed(2),
          "Net Amount": parseFloat(item.net_amount || 0).toFixed(2),
        };
      });

      // Add total row
      formattedData.push({
        "S.No": "",
        "Invoice No": "",
        "Date": "",
        "Customer Name": "",
        "Product Name": "",
        "Category": "TOTAL",
        "Taxable Amount": totals.totalTaxableAmount,
        "Tax %": "",
        "SGST": totals.totalSGST,
        "CGST": totals.totalCGST,
        "Tax Amount": totals.totalTaxAmount,
        "Net Amount": totals.totalNetAmount,
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "GSTR1 Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      saveAs(blob, `GSTR1_Report_${yyyy}-${mm}-${dd}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel. Please try again.');
    }
  };

  // Export to PDF - Fixed version using imported autoTable
  const handleDownloadPDF = () => {
    if (!filteredData.length) {
      alert('No data to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title
      doc.setFontSize(18);
      doc.text('GSTR-1 Report', pageWidth / 2, 15, { align: 'center' });

      // Add date range if selected
      if (fromDate && toDate) {
        doc.setFontSize(11);
        doc.text(`From: ${formatDate(fromDate)} To: ${formatDate(toDate)}`, pageWidth / 2, 22, { align: 'center' });
      }

      // Prepare table data
      const tableData = filteredData.map((item, index) => {
        const taxAmt = parseFloat(item.tax_amount || 0);
        return [
          index + 1,
          item.invoice_number || '',
          formatDate(item.date),
          item.account_name || '',
          item.product_name || '',
          item.category || '',
          parseFloat(item.taxable_amount || 0).toFixed(2),
          `${item.tax_percent || 0}%`,
          (taxAmt / 2).toFixed(2),
          (taxAmt / 2).toFixed(2),
          parseFloat(item.tax_amount || 0).toFixed(2),
          parseFloat(item.net_amount || 0).toFixed(2),
        ];
      });

      // Add total row
      tableData.push([
        '',
        '',
        '',
        '',
        '',
        'TOTAL',
        totals.totalTaxableAmount,
        '',
        totals.totalSGST,
        totals.totalCGST,
        totals.totalTaxAmount,
        totals.totalNetAmount,
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        head: [[
          'S.No', 'Invoice No', 'Date', 'Customer', 
          'Product', 'Category', 'Taxable Amt', 'Tax %', 
          'SGST', 'CGST', 'Tax Amt', 'Net Amt'
        ]],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          overflow: 'linebreak',
          halign: 'center'
        },
        headStyles: {
          fillColor: [163, 110, 41],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 7
        },
        didParseCell: function(data) {
          if (data.row.index === tableData.length - 1 && data.column.index > 0) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
        margin: { top: 30, bottom: 10 }
      });

      // Save PDF
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      
      doc.save(`GSTR1_Report_${yyyy}-${mm}-${dd}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please make sure jspdf-autotable is properly installed.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="gstr1-container">
        <div className="gstr1-header">
          <h2>GSTR-1 Report</h2>
          <div className="filter-section">
            <div className="filter-group">
              <label>From Date:</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>To Date:</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Invoice No:</label>
              <select 
                value={selectedInvoice} 
                onChange={(e) => setSelectedInvoice(e.target.value)}
                className="filter-select"
              >
                <option value="">All Invoices</option>
                {uniqueInvoices.map((invoice, index) => (
                  <option key={index} value={invoice}>{invoice}</option>
                ))}
              </select>
            </div>
            <div className="filter-buttons">
              <button onClick={handleFilter} className="btn-filter">Apply Filter</button>
              <button onClick={handleReset} className="btn-reset">Reset</button>
            </div>
          </div>
        </div>

        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="gstr1-summary">
              <div className="summary-card">
                <h4>Total Records</h4>
                <p>{totals.totalRecords}</p>
              </div>
              <div className="summary-card">
                <h4>Total Taxable Amount</h4>
                <p>₹ {totals.totalTaxableAmount}</p>
              </div>
              <div className="summary-card">
                <h4>Total Tax Amount</h4>
                <p>₹ {totals.totalTaxAmount}</p>
              </div>
              <div className="summary-card">
                <h4>Total SGST</h4>
                <p>₹ {totals.totalSGST}</p>
              </div>
              <div className="summary-card">
                <h4>Total CGST</h4>
                <p>₹ {totals.totalCGST}</p>
              </div>
              <div className="summary-card">
                <h4>Total Net Amount</h4>
                <p>₹ {totals.totalNetAmount}</p>
              </div>
            </div>
            <div className="export-buttons">
              <Button
                variant="success"
                onClick={handleDownloadExcel}
                className="d-flex align-items-center gap-2 me-2"
              >
                <FaFileExcel />
                Excel
              </Button>
              <Button
                variant="danger"
                onClick={handleDownloadPDF}
                className="d-flex align-items-center gap-2"
              >
                <FaFilePdf />
                PDF
              </Button>
            </div>
          </Col>
        </Row>

        <div className="gstr1-table-container">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export default GSTR1report;