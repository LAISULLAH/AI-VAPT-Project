import React, { useState, useEffect } from 'react';
import './VaptDashboard.css';
import { generateVaptReport } from './ReportGenerator';

const API_BASE = 'https://ai-vapt-project.onrender.com';
const ACCESS_KEY = 'WX-E4QB-4ZJY-L5UN-WBSK';

const VaptDashboard = ({ scanId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    // Task 5: Screenshot protection (basic deterrent)
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Task 4: Single source of truth fetch
    const loadScanData = async () => {
      try {
        // Fetching from your Render backend
        const response = await fetch(`${API_BASE}/scan/full?target=${scanId}`, {
          headers: {
            'x-access-token': ACCESS_KEY
          }
        });
        if (!response.ok) throw new Error('Data missing');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("VAPT Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadScanData();
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [scanId]);

  // Task 5: Disable Right Click
  const onContextMenu = (e) => e.preventDefault();

  if (loading) return <div className="dashboard-container"><div className="vapt-card">Loading scan results...</div></div>;
  if (!data) return <div className="dashboard-container"><h1>No Data Found</h1></div>;

  // Step 3: Safe Extraction logic
  const openPorts = data.port_scan?.open_ports || [];
  const openPortsCount = openPorts.length;
  const riskLevel = data.summary?.risk_level || (openPortsCount > 5 ? 'HIGH' : 'LOW');

  // Find HTTP headers from ports 80 or 443
  const httpPort = openPorts.find(p => p.port === 80 || p.port === 443 || p.service === 'http');
  const headers = httpPort?.headers || {};

  return (
    <div id="report-content"
      className={`dashboard-container ${!isFocused ? 'window-blur' : ''}`}
      onContextMenu={onContextMenu}
      style={{ background: '#000' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0 }}>WHITENX</h1>
          <p style={{ color: '#666', margin: '4px 0' }}>TARGET: {data.target}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>RISK LEVEL: <strong>{riskLevel}</strong></div>
          <button 
            onClick={() => generateVaptReport(data)}
            style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            GENERATE REPORT
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Ports Module */}
        <section className="vapt-card" style={{ gridColumn: 'span 2' }}>
          <h3>PORT SCAN RESULTS</h3>
          <table>
            <thead>
              <tr>
                <th>PORT</th>
                <th>SERVICE</th>
                <th>VERSION</th>
                <th>PROTOCOL</th>
                <th>STATE</th>
              </tr>
            </thead>
            <tbody>
              {openPorts.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.port}</td>
                  <td>{(p.service_name || p.service || 'unknown').toUpperCase()}</td>
                  <td>{p.version || 'N/A'}</td>
                  <td>{p.protocol?.toUpperCase()}</td>
                  <td>OPEN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Services Module (Grouped) */}
        <section className="vapt-card">
          <h3>IDENTIFIED SERVICES</h3>
          <ul style={{ paddingLeft: '20px', color: '#ccc' }}>
            {[...new Set(openPorts.map(p => p.service_name || p.service || 'unknown'))].map(s => (
              <li key={s} style={{ marginBottom: '8px' }}>{s?.toUpperCase()}</li>
            ))}
          </ul>
        </section>

        {/* SSL Module */}
        <section className="vapt-card">
          <h3>SSL CERTIFICATE</h3>
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <div><span style={{ color: '#666' }}>SUBJECT:</span> {data.ssl?.subject || data.ssl_analysis?.certificates?.[0]?.subject || 'N/A'}</div>
            <div><span style={{ color: '#666' }}>ISSUER:</span> {data.ssl?.issuer || data.ssl_analysis?.certificates?.[0]?.issuer || 'N/A'}</div>
            <div><span style={{ color: '#666' }}>EXPIRY:</span> {data.ssl?.valid_until || data.ssl_analysis?.certificates?.[0]?.notAfter || 'N/A'}</div>
            <div style={{ marginTop: '10px' }}>
              <span className="status-tag">
                {data.ssl?.days_left || 0} DAYS REMAINING
              </span>
            </div>
          </div>
        </section>

        {/* Security Headers Module */}
        <section className="vapt-card" style={{ gridColumn: 'span 2' }}>
          <h3>SECURITY HEADERS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Map from either top-level headers or OSINT nested headers */}
            {['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options'].map(header => {
              const isEnabled = !!(data.headers?.[header] || data.osint?.http?.security_headers?.[header]);
              return (
                <div key={header} style={{ border: '1px solid #222', padding: '12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>{header.toUpperCase()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: isEnabled ? '#fff' : '#444' }}>
                    {isEnabled ? 'ENABLED' : 'MISSING'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VaptDashboard;