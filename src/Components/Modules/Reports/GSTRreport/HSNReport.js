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
import './HSNReport.css';
import baseURL from '../../../../Url/NodeBaseURL';

function HSNReport() {
  const [salesData, setSalesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedHSN, setSelectedHSN] = useState('');
  const [uniqueHSN, setUniqueHSN] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both APIs
      const [salesResponse, productsResponse] = await Promise.all([
        axios.get(`${baseURL}/get-unique-repair-details`),
        axios.get(`${baseURL}/get/products`)
      ]);

      // Filter sales data
      const sales = salesResponse.data.filter(item => item.transaction_status === 'Sales');
      setSalesData(sales);

      // Set products data
      const products = productsResponse.data;
      setProductsData(products);

      // Merge data by product_id
      const mergedData = sales.map(sale => {
        const product = products.find(p => p.product_id === sale.product_id);
        return {
          ...sale,
          hsn_code: product?.hsn_code || 'N/A',
          product_category: product?.Category || sale.category || 'N/A',
          product_description: product?.product_name || sale.product_name || 'N/A',
          uqc: 'PCS-PIECES', // Default UQC
          gross_weight: parseFloat(product?.gross_weight || sale?.gross_weight || 0) // Get gross weight from product
        };
      });

      setFilteredData(mergedData);

      // Get unique HSN codes
      const hsnCodes = [...new Set(mergedData.map(item => item.hsn_code))].filter(code => code !== 'N/A');
      setUniqueHSN(hsnCodes);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...filteredData];

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
      });
    }

    if (selectedHSN) {
      filtered = filtered.filter(item => item.hsn_code === selectedHSN);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSelectedHSN('');
    setFilteredData(filteredData); // Reset to current filtered data
    // Re-fetch to get original data
    fetchData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Format weight with appropriate unit
  const formatWeight = (weightInGrams) => {
    if (!weightInGrams || weightInGrams === 0) return '0 gms';
    
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toFixed(2)} kg`;
    }
    return `${weightInGrams.toFixed(0)} gms`;
  };

  // Group data by HSN code
  const groupDataByHSN = () => {
    const grouped = {};
    
    filteredData.forEach(item => {
      const hsnCode = item.hsn_code || 'N/A';
      if (!grouped[hsnCode]) {
        grouped[hsnCode] = {
          hsnCode: hsnCode,
          description: item.product_description || 'General',
          uqc: 'PCS-PIECES',
          taxPercent: parseFloat(item.tax_percent || 0),
          qty: 0,
          totalGrossWeight: 0, // Total gross weight for this HSN group
          totalValue: 0,
          taxableValue: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          atax: 0,
          items: []
        };
      }
      
      const taxAmt = parseFloat(item.tax_amount || 0);
      const qty = parseFloat(item.qty || 1);
      const grossWeightPerUnit = parseFloat(item.gross_weight || 0);
      
      grouped[hsnCode].qty += qty;
      grouped[hsnCode].totalGrossWeight += (grossWeightPerUnit * qty); // Total weight = weight per unit * quantity
      grouped[hsnCode].totalValue += parseFloat(item.net_amount || 0);
      grouped[hsnCode].taxableValue += parseFloat(item.taxable_amount || 0);
      grouped[hsnCode].cgst += taxAmt / 2;
      grouped[hsnCode].sgst += taxAmt / 2;
      grouped[hsnCode].items.push(item);
    });

    return Object.values(grouped);
  };

  const groupedData = groupDataByHSN();

  // Calculate totals
  const calculateTotals = () => {
    let totalQty = 0;
    let totalGrossWeight = 0;
    let totalValue = 0;
    let totalTaxableValue = 0;
    let totalIGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalATax = 0;
    
    groupedData.forEach(item => {
      totalQty += item.qty;
      totalGrossWeight += item.totalGrossWeight;
      totalValue += item.totalValue;
      totalTaxableValue += item.taxableValue;
      totalIGST += item.igst;
      totalCGST += item.cgst;
      totalSGST += item.sgst;
      totalATax += item.atax;
    });
    
    return {
      totalQty: totalQty,
      totalGrossWeight: totalGrossWeight,
      totalValue: totalValue.toFixed(2),
      totalTaxableValue: totalTaxableValue.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalATax: totalATax.toFixed(2),
      totalRecords: groupedData.length
    };
  };

  const totals = calculateTotals();

  // Columns for DataTable
  const columns = React.useMemo(
    () => [
      {
        Header: 'HSN Code',
        accessor: 'hsnCode',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Tax %',
        accessor: 'taxPercent',
        Cell: ({ value }) => `${value}%`,
      },
      {
        Header: 'Qty',
        accessor: 'qty',
      },
      {
        Header: 'Weight',
        accessor: 'totalGrossWeight',
        Cell: ({ value }) => formatWeight(value),
      },
      {
        Header: 'Total Val.',
        accessor: 'totalValue',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: 'Taxable Val.',
        accessor: 'taxableValue',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: 'IGST',
        accessor: 'igst',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: 'CGST',
        accessor: 'cgst',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: 'SGST',
        accessor: 'sgst',
        Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
      },
    ],
    []
  );

  // Export to Excel
  const handleDownloadExcel = () => {
    if (!groupedData.length) {
      alert('No data to export');
      return;
    }

    try {
      const formattedData = groupedData.map((item, index) => ({
        "HSN Code": item.hsnCode,
        "Description": item.description,
        "Tax %": `${item.taxPercent}%`,
        "Qty": item.qty,
        "UOM": formatWeight(item.totalGrossWeight),
        "Total Val.": parseFloat(item.totalValue).toFixed(2),
        "Taxable Val.": parseFloat(item.taxableValue).toFixed(2),
        "IGST": parseFloat(item.igst).toFixed(2),
        "CGST": parseFloat(item.cgst).toFixed(2),
        "SGST": parseFloat(item.sgst).toFixed(2),
        "A.Tax": parseFloat(item.atax).toFixed(2),
      }));

      // Add total row
      formattedData.push({
        "HSN Code": "",
        "Description": "TOTAL",
        "Tax %": "",
        "Qty": totals.totalQty,
        "UOM": formatWeight(totals.totalGrossWeight),
        "Total Val.": totals.totalValue,
        "Taxable Val.": totals.totalTaxableValue,
        "IGST": totals.totalIGST,
        "CGST": totals.totalCGST,
        "SGST": totals.totalSGST,
        "A.Tax": totals.totalATax,
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "HSN Report");

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

      saveAs(blob, `HSN_Report_${yyyy}-${mm}-${dd}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel. Please try again.');
    }
  };

  // Export to PDF
  const handleDownloadPDF = () => {
    if (!groupedData.length) {
      alert('No data to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title
      doc.setFontSize(18);
      doc.text('HSN Code Wise Report', pageWidth / 2, 15, { align: 'center' });

      // Add date range if selected
      if (fromDate && toDate) {
        doc.setFontSize(11);
        doc.text(`From: ${formatDate(fromDate)} To: ${formatDate(toDate)}`, pageWidth / 2, 22, { align: 'center' });
      }

      // Prepare table data
      const tableData = groupedData.map((item) => [
        item.hsnCode,
        item.description,
        `${item.taxPercent}%`,
        item.qty,
        formatWeight(item.totalGrossWeight),
        parseFloat(item.totalValue).toFixed(2),
        parseFloat(item.taxableValue).toFixed(2),
        parseFloat(item.igst).toFixed(2),
        parseFloat(item.cgst).toFixed(2),
        parseFloat(item.sgst).toFixed(2),
        parseFloat(item.atax).toFixed(2),
      ]);

      // Add total row
      tableData.push([
        '',
        'TOTAL',
        '',
        totals.totalQty,
        formatWeight(totals.totalGrossWeight),
        totals.totalValue,
        totals.totalTaxableValue,
        totals.totalIGST,
        totals.totalCGST,
        totals.totalSGST,
        totals.totalATax,
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        head: [[
          'HSN Code', 'Description', 'Tax %', 'Qty', 'UOM',
          'Total Val.', 'Taxable Val.', 'IGST', 'CGST', 'SGST', 'A.Tax'
        ]],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          overflow: 'linebreak',
          halign: 'center'
        },
        headStyles: {
          fillColor: [163, 110, 41],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
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
      
      doc.save(`HSN_Report_${yyyy}-${mm}-${dd}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
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
      <div className="hsn-container">
        <div className="hsn-header">
          <h2>HSN Code Wise Report</h2>
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
              <label>HSN Code:</label>
              <select 
                value={selectedHSN} 
                onChange={(e) => setSelectedHSN(e.target.value)}
                className="filter-select"
              >
                <option value="">All HSN Codes</option>
                {uniqueHSN.map((hsn, index) => (
                  <option key={index} value={hsn}>{hsn}</option>
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
            <div className="hsn-summary">
              <div className="summary-card">
                <h4>Total HSN Codes</h4>
                <p>{totals.totalRecords}</p>
              </div>
              <div className="summary-card">
                <h4>Total Quantity</h4>
                <p>{totals.totalQty}</p>
              </div>
              <div className="summary-card">
                <h4>Total Weight</h4>
                <p>{formatWeight(totals.totalGrossWeight)}</p>
              </div>
              <div className="summary-card">
                <h4>Total Value</h4>
                <p>₹ {totals.totalValue}</p>
              </div>
              <div className="summary-card">
                <h4>Total Taxable Value</h4>
                <p>₹ {totals.totalTaxableValue}</p>
              </div>
              <div className="summary-card">
                <h4>Total CGST</h4>
                <p>₹ {totals.totalCGST}</p>
              </div>
              <div className="summary-card">
                <h4>Total SGST</h4>
                <p>₹ {totals.totalSGST}</p>
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

        <div className="hsn-table-container">
          <DataTable columns={columns} data={groupedData} />
        </div>
      </div>
    </div>
  );
}

export default HSNReport;