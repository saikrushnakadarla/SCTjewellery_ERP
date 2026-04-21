import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Button, Row, Col } from 'react-bootstrap';
import '../Payments/PaymentsTable.css';
import baseURL from "../../../../Url/NodeBaseURL";

const RepairsTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // State to hold fetched data

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, 
      },
      {
        Header: 'Date',
        accessor: 'date', 
        Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN'),
      },
      {
        Header: 'Mode',
        accessor: 'mode',
      },
      {
        Header: 'Payment No',
        accessor: 'payment_no',
      },
      {
        Header: 'Account Name',
        accessor: 'account_name',
      },
      {
        Header: 'Reference Number',
        accessor: 'cheque_number',
        Cell: ({ value }) => (value ? value : 'N/A'),
      },
      {
        Header: 'Total Wt / Amt',
        accessor: row => ` ${row.total_wt} / ${row.total_amt}`
      },
      {
        Header: 'Paid Wt / Amt',
        accessor: row => ` ${row.paid_wt} / ${row.paid_amt}`
      },
      {
        Header: 'Bal Wt / Amt',
        accessor: row => ` ${row.bal_wt} / ${row.bal_amt}`
      },
      {
        Header: 'Paid By',
        accessor: 'paid_by',
      },
    ],
    [data]
  );

  // Fetch payments data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/purchase-payments`);
        const result = await response.json();
        
        // Ensure result is an array before setting it
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error('API did not return an array:', result);
          setData([]); // Set empty array as fallback
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setData([]); // Set empty array on error
      }
    };
    fetchData();
  }, []);
  
  const handleCreate = () => {
    navigate('/purchase-payment');
  };

  // Safely reverse the data array only if it's an array
  const reversedData = Array.isArray(data) ? [...data].reverse() : [];

  return (
    <div className="main-container">
      <div className="payments-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Payments</h3>
            <Button
              className="create_but"
              onClick={handleCreate}
              style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
            >
              + Create
            </Button>
          </Col>
        </Row>
        <DataTable columns={columns} data={reversedData} />
      </div>
    </div>
  );
};

export default RepairsTable;