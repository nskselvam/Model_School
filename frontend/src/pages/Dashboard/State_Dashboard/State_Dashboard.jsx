import React from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetDashboardStatisticsQuery } from '../../../redux-slice/masterApiSlice';
import { 
  FaUserGraduate, 
  FaUserCheck, 
  FaUserTimes, 
  FaWheelchair, 
  FaSchool
} from 'react-icons/fa';
import '../../../style/dashboard/statistics.css';

const State_Dashboard = () => {
  // Get district code from Redux state
  const { regulationInfo } = useSelector((state) => state.auth);
  const districtCode = regulationInfo?.district || '01';
  const districtName = regulationInfo?.districtName || 'All Districts';

  // Fetch dashboard statistics
  const { data: statsData, isLoading, error } = useGetDashboardStatisticsQuery(districtCode);
  const stats = statsData?.data || {};

  // Calculate percentages
  const presentPercentage = stats.totalCandidates > 0 
    ? ((stats.presentCount / stats.totalCandidates) * 100).toFixed(1) 
    : 0;
  
  const absentPercentage = stats.totalCandidates > 0 
    ? ((stats.absentCount / stats.totalCandidates) * 100).toFixed(1) 
    : 0;

  const disabledPercentage = stats.totalCandidates > 0 
    ? ((stats.disabledCount / stats.totalCandidates) * 100).toFixed(1) 
    : 0;

  // Calculate school type percentages
  const modelSchoolPercentage = stats.totalCandidates > 0 
    ? ((stats.modelSchoolCount / stats.totalCandidates) * 100).toFixed(1) 
    : 0;

  const govtSchoolPercentage = stats.totalCandidates > 0 
    ? ((stats.govtSchoolCount / stats.totalCandidates) * 100).toFixed(1) 
    : 0;

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <span className="text-muted">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Card className="dashboard-error">
          <Card.Body>
            <h5 className="text-danger">Error loading dashboard</h5>
            <p>{error?.data?.message || error.message}</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="statistics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Model School Dashboard</h2>
        <p className="dashboard-subtitle">
          District: <strong>{districtName}</strong> | Total Eligible Candidates: <strong>{stats.totalCandidates?.toLocaleString() || 0}</strong>
        </p>
      </div>

      {/* Top Stats Cards - 6 Cards in 2 rows */}
      <Row className="g-4 mb-4">
        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-primary">
            <Card.Body>
              <div className="stat-icon">
                <FaUserGraduate size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Eligible Students</p>
                <h3 className="stat-value">{stats.totalCandidates?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  Eligible Candidates
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-success">
            <Card.Body>
              <div className="stat-icon">
                <FaUserCheck size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Present Students</p>
                <h3 className="stat-value">{stats.presentCount?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  ✓ {presentPercentage}% Attendance
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-danger">
            <Card.Body>
              <div className="stat-icon">
                <FaUserTimes size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Absent Students</p>
                <h3 className="stat-value">{stats.absentCount?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  ⚠ {absentPercentage}% Absent
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Second Row - School Types and Differently Abled */}
      <Row className="g-4 mb-4">
        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-model">
            <Card.Body>
              <div className="stat-icon">
                <FaSchool size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Model School Students</p>
                <h3 className="stat-value">{stats.modelSchoolCount?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  🎓 {modelSchoolPercentage}% of total
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-warning">
            <Card.Body>
              <div className="stat-icon">
                <FaSchool size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Government School</p>
                <h3 className="stat-value">{stats.govtSchoolCount?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  🏫 {govtSchoolPercentage}% of total
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card stat-card-info">
            <Card.Body>
              <div className="stat-icon">
                <FaWheelchair size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Differently Abled</p>
                <h3 className="stat-value">{stats.disabledCount?.toLocaleString() || 0}</h3>
                <small className="stat-badge">
                  ♿ {disabledPercentage}% Special Care
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* District-wise Present Count */}
      <Row className="g-4">
        <Col lg={12}>
          <Card className="chart-card">
            <Card.Header className="chart-header">
              <FaUserCheck className="me-2" />
              District-wise Present Count
            </Card.Header>
            <Card.Body>
              <div className="status-list">
                {stats.districtWisePresentCount && stats.districtWisePresentCount.length > 0 ? (
                  stats.districtWisePresentCount.map((item, index) => (
                    <div key={index} className="status-item">
                      <span className="status-name">
                        {item.districtName}
                      </span>
                      <span className="status-count">{item.count?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    <p>No district data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default State_Dashboard;
