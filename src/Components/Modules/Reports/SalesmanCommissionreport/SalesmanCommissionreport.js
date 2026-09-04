import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './ExpandedTable';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Button, Row, Col, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';
import './SalesmanCommissionreport.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";

const SalesmanCommissionReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to safely parse number
  const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to format number
  const formatNumber = (value) => {
    return safeNumber(value).toFixed(2);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${date.getFullYear()}`;
    } catch (e) {
      return '';
    }
  };

  // Group data by salesman
  const groupBySalesman = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = item.salesman_id || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          salesman_id: key,
          salesman_name: item.salesman_name || 'Unknown',
          invoices: []
        };
      }
      acc[key].invoices.push(item);
      return acc;
    }, {});

    return grouped;
  };

  // Columns for main table
  const columns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'expander',
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        ),
      },
      {
        Header: 'Salesman Name',
        accessor: 'salesman_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Total Invoices',
        accessor: 'invoices',
        Cell: ({ value }) => value ? value.length : 0,
      },
      {
        Header: 'Total Sales Amount',
        accessor: 'total_amount',
        Cell: ({ row }) => {
          const total = row.original.invoices.reduce((sum, invoice) =>
            sum + safeNumber(invoice.net_amount), 0);
          return `₹ ${total.toFixed(2)}`;
        },
      },
      {
        Header: 'Total Commission',
        accessor: 'total_commission',
        Cell: ({ row }) => {
          const total = row.original.invoices.reduce((sum, invoice) =>
            sum + safeNumber(invoice.salesman_commission_amount), 0);
          return `₹ ${total.toFixed(2)}`;
        },
      },
    ],
    []
  );

  // Columns for expanded invoice details
  const invoiceColumns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }) => formatDate(value) || 'N/A',
      },
      {
        Header: 'Invoice No.',
        accessor: 'invoice_number',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Customer Name',
        accessor: 'customer_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Invoice Amount',
        accessor: 'net_amount',
        Cell: ({ value }) => `₹ ${formatNumber(value)}`,
      },
      {
        Header: 'Commission %',
        accessor: 'salesman_commission',
        Cell: ({ value }) => `${formatNumber(value)}%`,
      },
      {
        Header: 'Commission Amount',
        accessor: 'salesman_commission_amount',
        Cell: ({ value }) => `₹ ${formatNumber(value)}`,
      },
    ],
    []
  );

  // Fetch salesman commission report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-salesman-commission-report`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching salesman commission report:', error);
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Group data
  const groupedData = React.useMemo(() => {
    const grouped = groupBySalesman(data);
    return Object.values(grouped).sort((a, b) => {
      const totalA = a.invoices.reduce((sum, invoice) => sum + safeNumber(invoice.salesman_commission_amount), 0);
      const totalB = b.invoices.reduce((sum, invoice) => sum + safeNumber(invoice.salesman_commission_amount), 0);
      return totalB - totalA;
    });
  }, [data]);

  // Calculate totals for summary
  const totalSalesmen = groupedData.length;
  const totalInvoices = data.length;
  const totalCommission = data.reduce((sum, item) => sum + safeNumber(item.salesman_commission_amount), 0);
  const totalSalesAmount = data.reduce((sum, item) => sum + safeNumber(item.net_amount), 0);

  // Download Excel
  const handleDownloadExcel = () => {
    if (!data.length) return;

    const excelData = [];

    groupedData.forEach((salesman) => {
      salesman.invoices.forEach((invoice) => {
        excelData.push({
          "Salesman Name": salesman.salesman_name,
          "Date": formatDate(invoice.date),
          "Invoice No": invoice.invoice_number || '',
          "Customer Name": invoice.customer_name || '',
          "Mobile": invoice.mobile || '',
          "Invoice Amount": formatNumber(invoice.net_amount),
          "Commission %": formatNumber(invoice.salesman_commission) + '%',
          "Commission Amount": formatNumber(invoice.salesman_commission_amount),
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salesman Commission Report");

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

    saveAs(blob, `Salesman_Commission_Report_${yyyy}-${mm}-${dd}.xlsx`);
  };

  const handleBack = () => {
    navigate('/reports');
  };

  return (
    <div className="main-container">
      <div className="salesman-commission-report-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h3>Salesman Commission Report</h3>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={handleDownloadExcel}
                className="d-flex align-items-center gap-2"
              >
                <FaFileExcel />
                Download Excel
              </Button>
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <div className="summary-card">
              <h6>Total Salesmen</h6>
              <h2>{totalSalesmen}</h2>
            </div>
          </Col>
          <Col md={3}>
            <div className="summary-card">
              <h6>Total Invoices</h6>
              <h2>{totalInvoices}</h2>
            </div>
          </Col>
          <Col md={3}>
            <div className="summary-card">
              <h6>Total Commission</h6>
              <h2>₹ {totalCommission.toFixed(2)}</h2>
            </div>
          </Col>
          <Col md={3}>
            <div className="summary-card">
              <h6>Total Sales Amount</h6>
              <h2>₹ {totalSalesAmount.toFixed(2)}</h2>
            </div>
          </Col>
        </Row>

        {/* Main Table with Expandable Rows */}
        <Row>
          <Col>
            <div className="detail-table-container">
              <h5>Salesman Wise Commission Details</h5>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <DataTable
                  columns={columns}
                  data={groupedData}
                  renderRowSubComponent={({ row }) => (
                    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
                      <Table striped bordered responsive>
                        <thead>
                          <tr>
                            {invoiceColumns.map((column, i) => (
                              <th key={i}>{column.Header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {row.original.invoices.map((invoice, i) => (
                            <tr key={i}>
                              {invoiceColumns.map((column, j) => {
                                if (column.accessor) {
                                  return (
                                    <td key={j}>
                                      {column.Cell ?
                                        column.Cell({
                                          value: invoice[column.accessor],
                                          row: { original: invoice }
                                        }) :
                                        invoice[column.accessor]
                                      }
                                    </td>
                                  );
                                }
                                if (column.id) {
                                  return (
                                    <td key={j}>
                                      {column.Cell({ row: { original: invoice } })}
                                    </td>
                                  );
                                }
                                return null;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                />
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SalesmanCommissionReport;