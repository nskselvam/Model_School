import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Badge, Spinner, Form, Row, Col } from 'react-bootstrap'
import DataTable from 'react-data-table-component/dist/index.es.js'
import { useGetExaminerPasswordDetailsQuery } from '../../redux-slice/examinerApiSlice'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import navbar from '../../hooks/navbar/navbar.json'

const { VITE_Institution_Name, VITE_Institution_No } = import.meta.env;

const UserTemporaryPassword = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const institutionData = navbar.find(item => item._id === parseInt(VITE_Institution_No))
  const institutionDisplayName = institutionData ? institutionData.InstitutionName : VITE_Institution_Name

  // Query with ResetPass = N filter to get only temporary password users
  const { data: apiData, isLoading, error, refetch } = useGetExaminerPasswordDetailsQuery(
    {
      InstitutionStatus: VITE_Institution_No,
      ResetPass: 'N', // Filter for temporary password users (N = not reset)
      PasswordStatus:'2'  


    }
  )

  const userInfo = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (apiData && apiData.data) {
      // Filter for ResetPass = N (temporary password - not reset)
      const tempPasswordUsers = apiData.data.filter(user => user.ResetPass === 'N')
      setData(tempPasswordUsers)
    }
  }, [apiData])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch temporary password users')
    } finally {
      setLoading(false)
    }
  }

  const handleExportToExcel = () => {
    const now = new Date()
    const dateTime = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })

    const exportData = data.map((row, index) => ({
      'S.No': index + 1,
      'Candidate Name': row.candidateName,
      'Email ID': row.Email_Id,
      'Temporary Password': row.Temp_Password,
      'Password Status': 'Temporary (Not Reset)'
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    const headerText = `Temporary Password Details (ResetPass = N)\n${dateTime}`
    XLSX.utils.sheet_add_aoa(ws, [[headerText]], { origin: 'A1' })

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
    ]

    if (!ws['A1'].s) ws['A1'].s = {}
    ws['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: '4472C4' } }
    }

    ws['!rows'] = [{ hpt: 35 }]

    const dataWithHeader = data.map((row, index) => ({
      'S.No': index + 1,
      'Candidate Name': row.candidateName,
      'Email ID': row.Email_Id,
      'Temporary Password': row.Temp_Password,
      'Password Status': 'Temporary (Not Reset)'
    }))

    XLSX.utils.sheet_add_json(ws, dataWithHeader, { origin: 'A2' })

    ws['!cols'] = [
      { wch: 8 },   // S.No
      { wch: 25 },  // Candidate Name
      { wch: 35 },  // Email ID
      { wch: 20 },  // Temporary Password
      { wch: 25 }   // Password Status
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Temporary Password Details')

    const date = now.toISOString().split('T')[0]
    const filename = `Temporary_Password_Details_${date}.xlsx`

    XLSX.writeFile(wb, filename)
    toast.success('Excel file exported successfully!')
  }

  const filteredData = data?.filter(item =>
    item.candidateName?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.Email_Id?.toLowerCase().includes(filterText.toLowerCase())
  )

  const columns = [
    {
      name: 'S.No',
      cell: (row, index) => (currentPage - 1) * perPage + index + 1,
      sortable: false,
      width: '70px',
      style: {
        justifyContent: 'center',
      },
    },
    {
      name: 'Candidate Name',
      selector: row => row.candidateName,
      sortable: true,
      width: '250px',
      wrap: true
    },
    {
      name: 'Email ID',
      selector: row => row.Email_Id,
      sortable: true,
      width: '280px',
      wrap: true
    },
    {
      name: 'Temporary Password',
      selector: row => row.Temp_Password,
      sortable: true,
      width: '180px',
      style: {
        justifyContent: 'center',
      },
      cell: row => (
        <div className="d-flex align-items-center gap-2">
          <span style={{ 
            fontFamily: 'monospace', 
            fontWeight: '600',
            background: '#cce7ff',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #0066b3'
          }}>
            {row.Temp_Password}
          </span>
          {/* <Badge bg="warning" text="dark" style={{ fontSize: '10px' }}>
            Temp
          </Badge> */}
        </div>
      )
    }
  ]

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#0066b3',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '14px',
        borderBottom: '2px solid #004080'
      }
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #cbd5e0',
        '&:last-child': {
          borderRight: 'none'
        }
      }
    },
    rows: {
      style: {
        minHeight: '60px',
        borderBottom: '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: '#e0f2ff',
          cursor: 'pointer'
        }
      }
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #e2e8f0',
        '&:last-child': {
          borderRight: 'none'
        }
      }
    }
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ color: '#0066b3', fontWeight: '600', margin: 0 }}>
            Temporary Password Details
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            <i className="bi bi-info-circle me-1"></i>
            Users with ResetPass = N (Awaiting first-time password reset)
          </p>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            <div>
              <strong>Important:</strong> These users have temporary passwords and must reset them on first login. 
              Total users: <strong>{data.length}</strong>
            </div>
          </div>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by Name or Email..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="success"
                  onClick={handleExportToExcel}
                  disabled={loading || data.length === 0}
                >
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Export Excel
                </Button>
                <Button
                  variant="primary"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-arrow-clockwise me-2"></i>Refresh</>}
                </Button>
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading temporary password users...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '48px' }}></i>
                  <p className="mt-3">No temporary password users found. All users have reset their passwords!</p>
                </div>
              }
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default UserTemporaryPassword
