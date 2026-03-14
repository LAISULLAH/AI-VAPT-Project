import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import './App.css';

export default function App() {
  const [page, setPage] = useState('legal');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tSIEM');

  // ═════════════════════════════════════════════════════════════
  // LEGAL & LOGIN PAGES
  // ═════════════════════════════════════════════════════════════

  if (page === 'legal') {
    return (
      <div className="app-wrapper">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-title">⚠️ Security Warning</div>
              <div className="auth-subtitle">Enterprise Security Operations</div>
            </div>

            <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              <h3 style={{ color: '#41b3a3', marginBottom: '1rem', fontSize: '1rem' }}>
                Authorized Access Only
              </h3>
              <p style={{ color: '#7a8fa3', lineHeight: '1.6', marginBottom: '1rem', fontSize: '0.9rem' }}>
                This system is for authorized use only. All activity is monitored and logged. 
                By accessing this system, you acknowledge that you have read, understood, and 
                agree to comply with all security policies and legal requirements.
              </p>

              <h4 style={{ color: '#ffb703', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                Key Policies:
              </h4>
              <ul style={{ color: '#7a8fa3', paddingLeft: '1.5rem', fontSize: '0.85rem', lineHeight: '1.8' }}>
                <li>All data access is monitored and logged</li>
                <li>Unauthorized access is strictly prohibited</li>
                <li>You must maintain confidentiality of all information</li>
                <li>Violation of this policy will result in immediate action</li>
                <li>Your account will be audited for compliance</li>
              </ul>

              <p style={{ color: '#ff4444', marginTop: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                ⚠️ ALL ACTIVITY IS LOGGED AND MONITORED
              </p>
            </div>

            <button
              onClick={() => setPage('login')}
              className="auth-button"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div className="app-wrapper">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-title">🔐 CyberSIO</div>
              <div className="auth-subtitle">Enterprise SOC Platform</div>
            </div>

            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>

              <button
                onClick={() => {
                  setPage('dashboard');
                  loadDashboardData();
                }}
                className="auth-button"
              >
                Sign In
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#7a8fa3', fontSize: '0.85rem' }}>
              Protected by enterprise security policies
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═════════════════════════════════════════════════════════════

  const loadDashboardData = () => {
    setLoading(true);
    setTimeout(() => {
      setDashboardData({
        vulnerabilityTrend: {
          series: [
            {
              name: 'Critical',
              data: [12, 15, 14, 18, 20, 19, 22]
            },
            {
              name: 'High',
              data: [8, 10, 9, 12, 14, 13, 15]
            },
            {
              name: 'Medium',
              data: [15, 18, 20, 22, 25, 23, 26]
            }
          ],
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        owaspMapping: {
          series: [112, 89, 76, 65, 54, 43],
          categories: ['Injection', 'Auth', 'Sensitive Data', 'XXE', 'Broken Access', 'XSS']
        },
        networkVulnerabilities: {
          series: [35, 28, 22],
          labels: ['Critical', 'High', 'Medium']
        },
        hostsScanned: {
          series: [156, 89, 45, 12],
          labels: ['Healthy', 'At Risk', 'Vulnerable', 'Critical']
        },
        webVulnerabilities: {
          series: [78, 52, 31],
          labels: ['Informational', 'Warning', 'Error']
        }
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (page === 'dashboard') {
      loadDashboardData();
    }
  }, [page]);

  if (page === 'dashboard') {
    if (loading) {
      return (
        <div className="app-wrapper">
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Loading Dashboard...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="app-wrapper">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <div className="nav-logo">
              <span>🛡️</span>
              <span>CyberSIO</span>
            </div>
            <div className="nav-tabs">
              {['tSIEM', 'tSOAR', 'tUEBA', 'tIAM', 'tPAM', 'tNAC'].map((tab) => (
                <button
                  key={tab}
                  className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-icons">
              <div className="nav-icon" title="Notifications">
                🔔
              </div>
              <div className="nav-icon" title="Settings">
                ⚙️
              </div>
              <div className="user-avatar" title="User Profile">
                AB
              </div>
            </div>
          </div>
        </nav>

        {/* Main Dashboard */}
        <div className="dashboard-container">
          <div className="dashboard-grid">
            {/* Row 1: Two Large Charts */}
            <div className="dashboard-row two-columns">
              {/* Vulnerabilities Trend */}
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">📊 Vulnerability Trend</div>
                  <div className="card-controls">
                    <select className="card-dropdown">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  {dashboardData && (
                    <Chart
                      type="area"
                      series={dashboardData.vulnerabilityTrend.series}
                      options={{
                        chart: {
                          type: 'area',
                          sparkline: { enabled: false },
                          toolbar: { show: false },
                          background: 'transparent'
                        },
                        colors: ['#ff4444', '#ffb703', '#2563eb'],
                        xaxis: {
                          categories: dashboardData.vulnerabilityTrend.categories,
                          labels: { style: { colors: '#7a8fa3' } }
                        },
                        yaxis: {
                          labels: { style: { colors: '#7a8fa3' } }
                        },
                        grid: {
                          borderColor: 'rgba(65, 179, 163, 0.1)'
                        },
                        stroke: { curve: 'smooth', width: 2 },
                        fill: {
                          type: 'gradient',
                          gradient: {
                            opacityFrom: 0.3,
                            opacityTo: 0
                          }
                        },
                        legend: { labels: { colors: '#7a8fa3' } }
                      }}
                      height={300}
                    />
                  )}
                </div>
              </div>

              {/* OWASP Top 10 Mapping */}
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">🎯 OWASP Top 10 Mapping</div>
                  <div className="card-controls">
                    <select className="card-dropdown">
                      <option>All Vulnerabilities</option>
                      <option>Critical Only</option>
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  {dashboardData && (
                    <Chart
                      type="bar"
                      series={[{ name: 'Count', data: dashboardData.owaspMapping.series }]}
                      options={{
                        chart: { 
                          type: 'bar',
                          toolbar: { show: false },
                          background: 'transparent'
                        },
                        colors: ['#41b3a3'],
                        xaxis: {
                          categories: dashboardData.owaspMapping.categories,
                          labels: { style: { colors: '#7a8fa3' } }
                        },
                        yaxis: {
                          labels: { style: { colors: '#7a8fa3' } }
                        },
                        grid: {
                          borderColor: 'rgba(65, 179, 163, 0.1)'
                        },
                        tooltip: {
                          theme: 'dark'
                        }
                      }}
                      height={300}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Three Donut Cards */}
            <div className="dashboard-row three-columns">
              {/* Network Vulnerabilities */}
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">🌐 Network Vulns</div>
                </div>
                <div className="card-body">
                  {dashboardData && (
                    <div className="donut-container">
                      <Chart
                        type="donut"
                        series={dashboardData.networkVulnerabilities.series}
                        options={{
                          colors: ['#ff4444', '#ffb703', '#2563eb'],
                          labels: dashboardData.networkVulnerabilities.labels,
                          chart: { toolbar: { show: false } },
                          legend: { show: false }
                        }}
                        height={220}
                      />
                      <div className="donut-legend">
                        {['Critical', 'High', 'Medium'].map((label, i) => (
                          <div key={label} className="legend-item">
                            <div className="legend-color" style={{
                              backgroundColor: ['#ff4444', '#ffb703', '#2563eb'][i]
                            }}></div>
                            <div className="legend-label">{label}</div>
                            <div className="legend-value">{dashboardData.networkVulnerabilities.series[i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hosts Scanned */}
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">🖥️ Hosts Scanned</div>
                </div>
                <div className="card-body">
                  {dashboardData && (
                    <div className="donut-container">
                      <Chart
                        type="donut"
                        series={dashboardData.hostsScanned.series}
                        options={{
                          colors: ['#10b981', '#ffb703', '#ff4444', '#8b0000'],
                          labels: dashboardData.hostsScanned.labels,
                          chart: { toolbar: { show: false } },
                          legend: { show: false }
                        }}
                        height={220}
                      />
                      <div className="donut-legend">
                        {['Healthy', 'At Risk', 'Vulnerable', 'Critical'].map((label, i) => (
                          <div key={label} className="legend-item">
                            <div className="legend-color" style={{
                              backgroundColor: ['#10b981', '#ffb703', '#ff4444', '#8b0000'][i]
                            }}></div>
                            <div className="legend-label">{label}</div>
                            <div className="legend-value">{dashboardData.hostsScanned.series[i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Web Vulnerabilities */}
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">🌍 Web Vulns</div>
                </div>
                <div className="card-body">
                  {dashboardData && (
                    <div className="donut-container">
                      <Chart
                        type="donut"
                        series={dashboardData.webVulnerabilities.series}
                        options={{
                          colors: ['#2563eb', '#ffb703', '#ff4444'],
                          labels: dashboardData.webVulnerabilities.labels,
                          chart: { toolbar: { show: false } },
                          legend: { show: false }
                        }}
                        height={220}
                      />
                      <div className="donut-legend">
                        {['Informational', 'Warning', 'Error'].map((label, i) => (
                          <div key={label} className="legend-item">
                            <div className="legend-color" style={{
                              backgroundColor: ['#2563eb', '#ffb703', '#ff4444'][i]
                            }}></div>
                            <div className="legend-label">{label}</div>
                            <div className="legend-value">{dashboardData.webVulnerabilities.series[i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
