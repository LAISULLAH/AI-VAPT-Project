import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

// ──────────────────────────────────────────────────────────────
// Legal Page
// ──────────────────────────────────────────────────────────────
const LegalPage = ({ onAccept }) => {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Top restricted banner */}
        <div className="restricted-banner">
          <span className="restricted-text">RESTRICTED ACCESS – AUTHORIZED PERSONNEL ONLY</span>
        </div>

        {/* Main warning box */}
        <div className="warning-box">
          <h1 className="critical-heading">
            WARNING: UNAUTHORIZED ACCESS TO THIS SYSTEM IS STRICTLY PROHIBITED
            <br />
            AND IS PUNISHABLE UNDER MULTIPLE NATIONAL AND INTERNATIONAL LAWS.
          </h1>

          <div className="declaration-section">
            <h2 className="section-title">MANDATORY DECLARATION & ACCEPTANCE</h2>
            <p className="declaration-text">
              By clicking below you solemnly declare under penalty of perjury that:
            </p>
            <ul className="declaration-list">
              <li>You have <strong>explicit written permission</strong> from the target system owner.</li>
              <li>You will <strong>NEVER</strong> use this platform or any output against any system without valid authorization.</li>
              <li>All actions, IP addresses, timestamps, commands, and keystrokes are <strong>logged and fully auditable</strong>.</li>
              <li>You accept <strong>full criminal, civil, and financial liability</strong> for any misuse.</li>
              <li>You will immediately cease activity and self-report any unauthorized access.</li>
              <li>You are of <strong>legal age (18+)</strong> and legally competent.</li>
            </ul>
          </div>

          <div className="laws-section">
            <h2 className="section-title">APPLICABLE LAWS & ZERO TOLERANCE</h2>
            <ul className="laws-list">
              <li><strong>India</strong>: Information Technology Act, 2000 – Sections 43, 66, 66F, 67, 69, 70, 72, 72A, 75</li>
              <li><strong>India</strong>: Bharatiya Nyaya Sanhita 2023 – Cybercrime provisions</li>
              <li><strong>India</strong>: Indian Penal Code / BNS – Conspiracy, cheating, fraud, cyber stalking</li>
              <li><strong>United States</strong>: Computer Fraud and Abuse Act (CFAA) – 18 U.S.C. § 1030</li>
              <li><strong>EU / Global</strong>: GDPR (up to €20M or 4% turnover), NIS2 Directive, DORA</li>
              <li><strong>International</strong>: Budapest Convention on Cybercrime</li>
            </ul>
          </div>

          <p className="final-threat">
            **Misuse = immediate permanent ban + full legal action + law enforcement cooperation**
          </p>

          <button className="accept-button" onClick={onAccept}>
            I ACCEPT – I AM AUTHORIZED AND FULLY LIABLE
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Login Page
// ──────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsAuthenticating(true);

    // fake auth delay (realistic feel)
    await new Promise(res => setTimeout(res, 700));

    if (VALID_USERNAME !== 'admin' || password !== VALID_PASSWORD) {
      setIsAuthenticating(false);
      setError('❌ INVALID USERNAME OR PASSWORD');
      return;
    }

    setIsAuthenticating(false);
    onLogin();
  };

  return (
    <div className="page-container secure-gateway-page">
      <div className="scanline-overlay"></div>
      <div className="glitch-bg"></div>

      <div className="login-wrapper centered">
        <div className="glass-card login-card">
          <div className="card-header">
            <h1 className="glitch-text login-heading">
              SECURE ACCESS GATEWAY
            </h1>
          </div>

          {/* 🔴 ERROR POPUP */}
          {error && (
            <div className="login-error-popup">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="terminal-input-group">
              <div className="terminal-line">
                <span className="prompt cyan-glow">&gt; username:</span>
                <span className="fixed-value">admin</span>
                <span className="cursor-blink">_</span>
              </div>

              <div className="terminal-line">
                <span className="prompt cyan-glow">&gt; password:</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  className="password-input neon-input"
                  placeholder="••••••••"
                  disabled={isAuthenticating}
                />
                <span className="cursor-blink">_</span>
              </div>
            </div>

            <button
              type="submit"
              className="authenticate-btn pulse-glow"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <span className="neon-spinner small"></span>
                  AUTHENTICATING...
                </>
              ) : (
                'AUTHENTICATE'
              )}
            </button>
          </form>

          <div className="security-status">
            <div className="status-line">
              <span className="status-indicator active"></span>
              <span className="status-text">All sessions logged</span>
              <span className="status-divider">|</span>
              <span className="status-indicator active pulse-red"></span>
              <span className="status-text red-glow">
                Intrusion detection active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== CVE Display Component ==========
const CVEDisplay = ({ service }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!service.cves || service.cves.length === 0) {
    return (
      <div className="cve-empty">
        <span className="cve-badge none">No CVEs</span>
      </div>
    );
  }

  return (
    <div className="cve-container">
      <div className="cve-header" onClick={() => setExpanded(!expanded)}>
        <span className="cve-badge warning">{service.cves.length} CVEs Found</span>
        <span className="cve-exploit-weight">
          Exploit Probability: {(service.exploit_weight * 100).toFixed(0)}%
        </span>
        <span className="cve-expand">{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div className="cve-list">
          {service.cves.map((cve, idx) => (
            <div key={idx} className="cve-item">
              <div className="cve-id">
                <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noopener noreferrer">
                  {cve.id}
                </a>
                <span className={`cve-cvss ${cve.cvss >= 7.0 ? 'high' : cve.cvss >= 4.0 ? 'medium' : 'low'}`}>
                  CVSS: {cve.cvss}
                </span>
              </div>
              <div className="cve-description">{cve.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== Fingerprinted Services Component ==========
const FingerprintedServices = ({ services }) => {
  if (!services || services.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Service Fingerprinting</div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          No fingerprinted services available
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <div className="card-title">Service Fingerprinting & CVE Correlation</div>
        <div className="card-subtitle">
          {services[0]?.cves?.length > 0 ? '✓ NVD API Connected' : '⏳ Waiting for version data'}
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <div className="findings-table">
          <div className="table-header">
            <div>Port</div>
            <div>Service</div>
            <div>Version</div>
            <div>Banner</div>
            <div>CVEs & Exploit Probability</div>
          </div>
          
          {services.map((svc, idx) => (
            <div key={idx} className="table-row service-row">
              <div><strong>{svc.port}</strong></div>
              <div>{svc.service_name || svc.service}</div>
              <div>
                {svc.version ? (
                  <span className="version-badge">{svc.version}</span>
                ) : (
                  <span className="version-unknown">Unknown</span>
                )}
              </div>
              <div className="banner-cell">
                {svc.banner ? (
                  <span className="banner-text">{svc.banner.substring(0, 50)}...</span>
                ) : (
                  <span className="no-banner">No banner</span>
                )}
              </div>
              <div className="cve-cell">
                <CVEDisplay service={svc} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const hasData = (arr) => arr && arr.some(v => v > 0);

const OsintOverview = ({ osint }) => {
  if (!osint || osint.status !== 'completed') {
    return (
      <div style={{ color: '#94a3b8', padding: '1rem' }}>
        OSINT data unavailable
      </div>
    );
  }

  const score = osint.osint_score ?? 0;
  const trust = osint.trust_level ?? 'UNKNOWN';

  const headers = osint.http?.security_headers || {};
  const enabledHeaders = Object.values(headers).filter(Boolean).length;
  const missingHeaders = Object.values(headers).filter(v => v === false).length;

  const dns = osint.dns || {};
  const dnsCounts = {
    A: dns.A?.length || 0,
    MX: dns.MX?.length || 0,
    NS: dns.NS?.length || 0,
    TXT: dns.TXT?.length || 0
  };

  return (
    <div className="osint-overview-grid">

      {/* OSINT SCORE */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">OSINT Score</div>
        </div>
        <Chart
          type="radialBar"
          series={[score || 1]}
          options={{
            chart: { background: 'transparent' },
            plotOptions: {
              radialBar: {
                hollow: { size: '65%' },
                dataLabels: {
                  value: { fontSize: '22px', color: '#e5e7eb' }
                }
              }
            },
            colors: [
              score >= 80 ? '#4ade80'
              : score >= 50 ? '#ea580c'
              : '#ef4444'
            ]
          }}
          height={200}
        />
      </div>

      {/* SECURITY HEADERS */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Security Headers</div>
        </div>
        <Chart
          type="donut"
          series={[
            enabledHeaders || 1,
            missingHeaders || 0
          ]}
          options={{
            labels: ['Enabled', 'Missing'],
            colors: ['#4ade80', '#ef4444'],
            legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
            chart: { background: 'transparent' }
          }}
          height={200}
        />
      </div>

      {/* TRUST LEVEL */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">Trust Level</div>
        </div>
        <div
          style={{
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 'bold',
            color:
              trust === 'HIGH'
                ? '#4ade80'
                : trust === 'MEDIUM'
                ? '#ea580c'
                : '#ef4444'
          }}
        >
          {trust}
        </div>
      </div>

      {/* DNS DISTRIBUTION */}
      <div className="dashboard-card dns-wide">
        <div className="card-header">
          <div className="card-title">DNS Record Distribution</div>
        </div>
        <Chart
          type="bar"
          series={[{ name: 'Records', data: Object.values(dnsCounts) }]}
          options={{
            chart: { toolbar: { show: false }, background: 'transparent' },
            colors: ['#60a5fa'],
            xaxis: {
              categories: Object.keys(dnsCounts),
              labels: { style: { colors: '#94a3b8' } }
            },
            yaxis: { labels: { style: { colors: '#94a3b8' } } },
            grid: { borderColor: 'rgba(96,165,250,0.15)' },
            dataLabels: { enabled: true }
          }}
          height={240}
        />
      </div>

    </div>
  );
};

const OsintDetails = ({ osint }) => {
  if (!osint || osint.status !== 'completed') {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">OSINT Intelligence</div>
        </div>
        <div style={{ color: '#94a3b8', padding: '1rem' }}>
          No OSINT data available
        </div>
      </div>
    );
  }

  const whois = osint.whois || {};
  const dns = osint.dns || {};
  const ssl = osint.ssl || {};
  const headers = osint.http?.security_headers || {};

  return (
    <div className="dashboard-card">

      {/* HEADER */}
      <div className="card-header">
        <div className="card-title">
          OSINT Intelligence ({osint.domain})
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>

        {/* ================= SUMMARY ================= */}
        <div className="findings-table">
          <div className="table-header">
            <div colSpan={2}>Summary</div>
          </div>
          <div className="table-row">
            <div>Generated At</div>
            <div>{new Date(osint.generated_at).toLocaleString()}</div>
          </div>
          <div className="table-row">
            <div>OSINT Score</div>
            <div><strong>{osint.osint_score}</strong></div>
          </div>
          <div className="table-row">
            <div>Trust Level</div>
            <div>
              <span className={`badge severity-${osint.trust_level.toLowerCase()}`}>
                {osint.trust_level}
              </span>
            </div>
          </div>
        </div>

        {/* ================= WHOIS ================= */}
        <div className="findings-table" style={{ marginTop: '1.5rem' }}>
          <div className="table-header">
            <div colSpan={2}>WHOIS Information</div>
          </div>
          {[
            ['Registrar', whois.registrar],
            ['Organization', whois.organization || 'N/A'],
            ['Country', whois.country],
            ['Created', whois.creation_date],
            ['Expires', whois.expiration_date]
          ].map(([k, v], i) => (
            <div key={i} className="table-row">
              <div>{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>

        {/* ================= DNS ================= */}
        <div className="findings-table" style={{ marginTop: '1.5rem' }}>
          <div className="table-header">
            <div>Type</div>
            <div>Records</div>
          </div>
          {['A', 'MX', 'NS', 'TXT'].map(type => (
            <div key={type} className="table-row">
              <div><strong>{type}</strong></div>
              <div style={{ color: '#94a3b8' }}>
                {(dns[type] || []).length
                  ? dns[type].join(', ')
                  : 'None'}
              </div>
            </div>
          ))}
        </div>

        {/* ================= SSL ================= */}
        <div className="findings-table" style={{ marginTop: '1.5rem' }}>
          <div className="table-header">
            <div colSpan={2}>SSL Certificate</div>
          </div>
          <div className="table-row">
            <div>Issuer</div>
            <div>{ssl.issuer?.organizationName}</div>
          </div>
          <div className="table-row">
            <div>Common Name</div>
            <div>{ssl.subject?.commonName}</div>
          </div>
          <div className="table-row">
            <div>Valid From</div>
            <div>{ssl.not_before}</div>
          </div>
          <div className="table-row">
            <div>Valid Until</div>
            <div>{ssl.not_after}</div>
          </div>
        </div>

        {/* ================= HEADERS ================= */}
        <div className="findings-table" style={{ marginTop: '1.5rem' }}>
          <div className="table-header">
            <div>Security Header</div>
            <div>Status</div>
          </div>
          {Object.entries(headers).map(([key, value]) => (
            <div key={key} className="table-row">
              <div>{key}</div>
              <div>
                <span className={`badge ${value ? 'severity-low' : 'severity-critical'}`}>
                  {value ? 'ENABLED' : 'MISSING'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= CRT.SH ================= */}
        <div className="findings-table" style={{ marginTop: '1.5rem' }}>
          <div className="table-header">
            <div>Certificate Transparency (crt.sh)</div>
          </div>
          {osint.crtsh?.map((entry, i) => (
            <div key={i} className="table-row">
              <div style={{ whiteSpace: 'pre-wrap', color: '#94a3b8' }}>
                {entry}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// ========== IMPROVED: Complete Report Module with Better Formatting ==========
const CompleteReport = ({ scanResult, fingerprintedServices, vulns, ports, subdomains, osint, onExportPDF }) => {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  const handleExport = async () => {
    setIsExporting(true);
    await onExportPDF();
    setIsExporting(false);
  };

  // Count vulnerabilities by severity
  const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
  const highCount = vulns.filter(v => v.severity === 'HIGH').length;
  const mediumCount = vulns.filter(v => v.severity === 'MEDIUM').length;
  const lowCount = vulns.filter(v => v.severity === 'LOW').length;
  const openPortsCount = ports.filter(p => p.state === 'open').length;

  return (
    <div className="complete-report-container" ref={reportRef}>
      {/* Report Header with Export Button */}
      <div className="report-header-section" style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2a 100%)',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #00ffff',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: '36px',
            color: '#00ffff',
            textTransform: 'uppercase',
            margin: '0 0 20px 0',
            textShadow: '0 0 10px rgba(0,255,255,0.5)'
          }}>
            COMPLETE SECURITY ASSESSMENT REPORT
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{ background: '#1a1a24', padding: '15px', borderRadius: '8px', border: '1px solid #2d2d3a' }}>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Target</div>
              <div style={{ color: '#00ffff', fontSize: '20px', fontWeight: 'bold' }}>{scanResult?.target}</div>
            </div>
            <div style={{ background: '#1a1a24', padding: '15px', borderRadius: '8px', border: '1px solid #2d2d3a' }}>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Scan ID</div>
              <div style={{ color: '#e5e7eb', fontSize: '14px', wordBreak: 'break-all' }}>{scanResult?.scan_id}</div>
            </div>
            <div style={{ background: '#1a1a24', padding: '15px', borderRadius: '8px', border: '1px solid #2d2d3a' }}>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Generated</div>
              <div style={{ color: '#e5e7eb', fontSize: '16px' }}>{new Date().toLocaleString()}</div>
            </div>
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #0066ff 100%)',
              color: '#0a0a0f',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 20px rgba(0,255,255,0.3)'
            }}
          >
            {isExporting ? (
              <>
                <span className="neon-spinner small"></span>
                GENERATING PDF...
              </>
            ) : (
              <>
                <span style={{ fontSize: '24px' }}>📄</span>
                EXPORT FULL REPORT AS PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODULE 01: OVERVIEW */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>01</span>
          OVERVIEW
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>Total Vulnerabilities</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{vulns.length}</div>
          </div>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>Critical</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{criticalCount}</div>
          </div>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>High</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ea580c' }}>{highCount}</div>
          </div>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>Medium</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#60a5fa' }}>{mediumCount}</div>
          </div>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>Open Ports</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4ade80' }}>{openPortsCount}</div>
          </div>
          <div style={{
            background: '#1a1a24',
            padding: '25px',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>Subdomains</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#a78bfa' }}>{subdomains.length}</div>
          </div>
        </div>
      </div>

      {/* MODULE 02: VULNERABILITIES DETECTED */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>02</span>
          VULNERABILITIES DETECTED
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#1a1a24',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: '#2d2d3a' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Severity</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Port</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {vulns.map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d3a' }}>
                  <td style={{ padding: '15px', color: '#e5e7eb' }}>{v.type}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        v.severity === 'CRITICAL' ? '#ef444420' :
                        v.severity === 'HIGH' ? '#ea580c20' :
                        v.severity === 'MEDIUM' ? '#60a5fa20' : '#4ade8020',
                      color:
                        v.severity === 'CRITICAL' ? '#ef4444' :
                        v.severity === 'HIGH' ? '#ea580c' :
                        v.severity === 'MEDIUM' ? '#60a5fa' : '#4ade80'
                    }}>
                      {v.severity}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#e5e7eb' }}>{v.port || '-'}</td>
                  <td style={{ padding: '15px', color: '#94a3b8' }}>{v.recommendation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 03: FINGERPRINTED SERVICES & CVEs */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>03</span>
          FINGERPRINTED SERVICES & CVEs
        </h2>
        
        {fingerprintedServices.map((svc, idx) => (
          <div key={idx} style={{
            background: '#1a1a24',
            borderRadius: '10px',
            border: '1px solid #2d2d3a',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#2d2d3a',
              padding: '15px 20px',
              borderBottom: '2px solid #00ffff'
            }}>
              <h3 style={{ margin: 0, color: '#00ffff', fontSize: '20px' }}>
                Port {svc.port} - {svc.service_name || svc.service} {svc.version || ''}
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#94a3b8' }}>Banner:</strong>{' '}
                <span style={{ color: '#e5e7eb' }}>{svc.banner || 'No banner'}</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#94a3b8' }}>Exploit Probability:</strong>{' '}
                <span style={{
                  color: svc.exploit_weight >= 0.7 ? '#ef4444' : svc.exploit_weight >= 0.4 ? '#ea580c' : '#4ade80',
                  fontWeight: 'bold'
                }}>
                  {svc.exploit_weight ? (svc.exploit_weight * 100).toFixed(0) : 0}%
                </span>
              </div>
              
              {svc.cves && svc.cves.length > 0 && (
                <div>
                  <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                    CVEs Found ({svc.cves.length}):
                  </strong>
                  {svc.cves.map((cve, i) => (
                    <div key={i} style={{
                      background: '#2d2d3a',
                      padding: '15px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      border: '1px solid #3d3d4a'
                    }}>
                      <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{cve.id}</span>
                        <span style={{
                          marginLeft: '15px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: 
                            cve.cvss >= 7.0 ? '#ef444420' :
                            cve.cvss >= 4.0 ? '#ea580c20' : '#4ade8020',
                          color:
                            cve.cvss >= 7.0 ? '#ef4444' :
                            cve.cvss >= 4.0 ? '#ea580c' : '#4ade80'
                        }}>
                          CVSS: {cve.cvss}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '14px' }}>{cve.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODULE 04: PORT SCAN RESULTS */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>04</span>
          PORT SCAN RESULTS
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#1a1a24',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: '#2d2d3a' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Port</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Service</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>State</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Exposure</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Attack Surface</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d3a' }}>
                  <td style={{ padding: '15px', color: '#e5e7eb', fontWeight: 'bold' }}>{p.port}</td>
                  <td style={{ padding: '15px', color: '#e5e7eb' }}>{p.service}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: p.state === 'open' ? '#ef444420' : '#4ade8020',
                      color: p.state === 'open' ? '#ef4444' : '#4ade80'
                    }}>
                      {p.state.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: p.exposure_level === 'HIGH' ? '#ef444420' : '#ea580c20',
                      color: p.exposure_level === 'HIGH' ? '#ef4444' : '#ea580c'
                    }}>
                      {p.exposure_level}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#94a3b8' }}>{p.attack_surface || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 05: SUBDOMAIN ENUMERATION */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>05</span>
          SUBDOMAIN ENUMERATION
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#1a1a24',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: '#2d2d3a' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Subdomain</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00ffff', borderBottom: '2px solid #00ffff' }}>IP Addresses</th>
              </tr>
            </thead>
            <tbody>
              {subdomains.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d3a' }}>
                  <td style={{ padding: '15px', color: '#00ffff' }}>{s.subdomain}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: s.alive ? '#4ade8020' : '#ef444420',
                      color: s.alive ? '#4ade80' : '#ef4444'
                    }}>
                      {s.status} {s.alive ? '(Live)' : '(Down)'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#94a3b8' }}>{s.dns_ips?.join(', ') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 06: OSINT INTELLIGENCE */}
      <div className="report-module" style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          color: '#00ffff',
          borderLeft: '6px solid #00ffff',
          paddingLeft: '20px',
          marginBottom: '25px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#4ade80', marginRight: '15px' }}>06</span>
          OSINT INTELLIGENCE
        </h2>
        
        <div style={{ display: 'grid', gap: '25px' }}>
          {/* WHOIS */}
          <div style={{ background: '#1a1a24', borderRadius: '10px', border: '1px solid #2d2d3a', overflow: 'hidden' }}>
            <div style={{ background: '#2d2d3a', padding: '12px 20px' }}>
              <h3 style={{ margin: 0, color: '#00ffff' }}>WHOIS Information</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8', width: '120px' }}>Registrar:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.whois?.registrar || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Organization:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.whois?.organization || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Country:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.whois?.country || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Created:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.whois?.creation_date || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Expires:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.whois?.expiration_date || 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DNS Records */}
          <div style={{ background: '#1a1a24', borderRadius: '10px', border: '1px solid #2d2d3a', overflow: 'hidden' }}>
            <div style={{ background: '#2d2d3a', padding: '12px 20px' }}>
              <h3 style={{ margin: 0, color: '#00ffff' }}>DNS Records</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {['A', 'MX', 'NS', 'TXT'].map(type => (
                    <tr key={type}>
                      <td style={{ padding: '8px 0', color: '#94a3b8', width: '120px' }}><strong>{type}:</strong></td>
                      <td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.dns?.[type]?.join(', ') || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SSL Certificate */}
          <div style={{ background: '#1a1a24', borderRadius: '10px', border: '1px solid #2d2d3a', overflow: 'hidden' }}>
            <div style={{ background: '#2d2d3a', padding: '12px 20px' }}>
              <h3 style={{ margin: 0, color: '#00ffff' }}>SSL Certificate</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8', width: '120px' }}>Issuer:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.ssl?.issuer?.organizationName || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Common Name:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.ssl?.subject?.commonName || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Valid From:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.ssl?.not_before || 'N/A'}</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Valid Until:</td><td style={{ padding: '8px 0', color: '#e5e7eb' }}>{osint?.ssl?.not_after || 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Headers */}
          <div style={{ background: '#1a1a24', borderRadius: '10px', border: '1px solid #2d2d3a', overflow: 'hidden' }}>
            <div style={{ background: '#2d2d3a', padding: '12px 20px' }}>
              <h3 style={{ margin: 0, color: '#00ffff' }}>Security Headers</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(osint?.http?.security_headers || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td style={{ padding: '8px 0', color: '#94a3b8', width: '120px' }}>{key}:</td>
                      <td style={{ padding: '8px 0', color: value ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
                        {value ? 'ENABLED' : 'MISSING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== IMPROVED: PDF Export Function with Better Formatting ==========
const exportToPDF = async (scanResult, fingerprintedServices, vulns, ports, subdomains, osint) => {
  try {
    // Create PDF container with better styling
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '1200px';
    pdfContainer.style.padding = '50px';
    pdfContainer.style.backgroundColor = '#0a0a0f';
    pdfContainer.style.color = '#e5e7eb';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    document.body.appendChild(pdfContainer);

    // Count vulnerabilities by severity
    const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulns.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulns.filter(v => v.severity === 'MEDIUM').length;
    const lowCount = vulns.filter(v => v.severity === 'LOW').length;
    const openPortsCount = ports.filter(p => p.state === 'open').length;

    // Build PDF content with improved styling
    pdfContainer.innerHTML = `
      <style>
        body {
          background: #0a0a0f;
          color: #e5e7eb;
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
        }
        .pdf-header {
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2a 100%);
          padding: 40px;
          border-radius: 15px;
          border: 2px solid #00ffff;
          margin-bottom: 40px;
          box-shadow: 0 0 30px rgba(0,255,255,0.2);
        }
        .pdf-title {
          font-size: 42px;
          color: #00ffff;
          text-transform: uppercase;
          margin: 0 0 30px 0;
          text-shadow: 0 0 15px rgba(0,255,255,0.5);
          text-align: center;
        }
        .pdf-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .pdf-info-card {
          background: #1a1a24;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #2d2d3a;
        }
        .pdf-info-label {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .pdf-info-value {
          color: #00ffff;
          font-size: 18px;
          font-weight: bold;
        }
        .pdf-module {
          margin-bottom: 50px;
        }
        .pdf-module-title {
          font-size: 32px;
          color: #00ffff;
          border-left: 6px solid #00ffff;
          padding-left: 20px;
          margin-bottom: 30px;
          text-transform: uppercase;
        }
        .pdf-module-number {
          color: #4ade80;
          margin-right: 15px;
        }
        .pdf-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 15px;
        }
        .pdf-stat-card {
          background: #1a1a24;
          padding: 25px 15px;
          border-radius: 10px;
          border: 1px solid #2d2d3a;
          text-align: center;
        }
        .pdf-stat-label {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .pdf-stat-value {
          font-size: 32px;
          font-weight: bold;
        }
        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          background: #1a1a24;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 25px;
        }
        .pdf-table th {
          background: #2d2d3a;
          color: #00ffff;
          padding: 15px;
          text-align: left;
          border-bottom: 2px solid #00ffff;
        }
        .pdf-table td {
          padding: 15px;
          border-bottom: 1px solid #2d2d3a;
          color: #e5e7eb;
        }
        .severity-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .critical { background: #ef444420; color: #ef4444; }
        .high { background: #ea580c20; color: #ea580c; }
        .medium { background: #60a5fa20; color: #60a5fa; }
        .low { background: #4ade8020; color: #4ade80; }
        .cve-block {
          background: #2d2d3a;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border: 1px solid #3d3d4a;
        }
        .cve-id {
          color: #00ffff;
          font-weight: bold;
          font-size: 16px;
        }
        .cvss-badge {
          display: inline-block;
          margin-left: 15px;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        .service-block {
          background: #1a1a24;
          border: 1px solid #2d2d3a;
          border-radius: 10px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .service-header {
          background: #2d2d3a;
          padding: 15px 20px;
          border-bottom: 2px solid #00ffff;
        }
        .service-title {
          margin: 0;
          color: #00ffff;
          font-size: 20px;
        }
        .service-content {
          padding: 20px;
        }
      </style>

      <!-- PDF Header -->
      <div class="pdf-header">
        <h1 class="pdf-title">WHITENX COMPLETE SECURITY ASSESSMENT REPORT</h1>
        <div class="pdf-info-grid">
          <div class="pdf-info-card">
            <div class="pdf-info-label">Target</div>
            <div class="pdf-info-value">${scanResult?.target || 'N/A'}</div>
          </div>
          <div class="pdf-info-card">
            <div class="pdf-info-label">Scan ID</div>
            <div class="pdf-info-value" style="font-size: 14px;">${scanResult?.scan_id || 'N/A'}</div>
          </div>
          <div class="pdf-info-card">
            <div class="pdf-info-label">Generated</div>
            <div class="pdf-info-value">${new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Module 01: Overview -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">01</span>
          OVERVIEW
        </h2>
        <div class="pdf-stats-grid">
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">Total Vulnerabilities</div>
            <div class="pdf-stat-value" style="color: #ef4444;">${vulns.length}</div>
          </div>
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">Critical</div>
            <div class="pdf-stat-value" style="color: #ef4444;">${criticalCount}</div>
          </div>
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">High</div>
            <div class="pdf-stat-value" style="color: #ea580c;">${highCount}</div>
          </div>
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">Medium</div>
            <div class="pdf-stat-value" style="color: #60a5fa;">${mediumCount}</div>
          </div>
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">Open Ports</div>
            <div class="pdf-stat-value" style="color: #4ade80;">${openPortsCount}</div>
          </div>
          <div class="pdf-stat-card">
            <div class="pdf-stat-label">Subdomains</div>
            <div class="pdf-stat-value" style="color: #a78bfa;">${subdomains.length}</div>
          </div>
        </div>
      </div>

      <!-- Module 02: Vulnerabilities -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">02</span>
          VULNERABILITIES DETECTED
        </h2>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Port</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${vulns.map(v => `
              <tr>
                <td>${v.type}</td>
                <td><span class="severity-badge ${v.severity?.toLowerCase()}">${v.severity}</span></td>
                <td>${v.port || '-'}</td>
                <td>${v.recommendation || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Module 03: Fingerprinted Services -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">03</span>
          FINGERPRINTED SERVICES & CVEs
        </h2>
        ${fingerprintedServices.map(svc => `
          <div class="service-block">
            <div class="service-header">
              <h3 class="service-title">Port ${svc.port} - ${svc.service_name || svc.service} ${svc.version || ''}</h3>
            </div>
            <div class="service-content">
              <div style="margin-bottom: 15px;">
                <strong style="color: #94a3b8;">Banner:</strong> 
                <span style="color: #e5e7eb;">${svc.banner || 'No banner'}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #94a3b8;">Exploit Probability:</strong> 
                <span style="color: ${svc.exploit_weight >= 0.7 ? '#ef4444' : svc.exploit_weight >= 0.4 ? '#ea580c' : '#4ade80'}; font-weight: bold;">
                  ${svc.exploit_weight ? (svc.exploit_weight * 100).toFixed(0) : 0}%
                </span>
              </div>
              ${svc.cves && svc.cves.length > 0 ? `
                <div>
                  <strong style="color: #94a3b8; display: block; margin-bottom: 10px;">CVEs Found (${svc.cves.length}):</strong>
                  ${svc.cves.map(cve => `
                    <div class="cve-block">
                      <div style="margin-bottom: 5px;">
                        <span class="cve-id">${cve.id}</span>
                        <span class="cvss-badge" style="background: ${cve.cvss >= 7.0 ? '#ef444420' : cve.cvss >= 4.0 ? '#ea580c20' : '#4ade8020'}; color: ${cve.cvss >= 7.0 ? '#ef4444' : cve.cvss >= 4.0 ? '#ea580c' : '#4ade80'};">
                          CVSS: ${cve.cvss}
                        </span>
                      </div>
                      <div style="color: #94a3b8; font-size: 13px;">${cve.description}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Module 04: Port Scan Results -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">04</span>
          PORT SCAN RESULTS
        </h2>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Service</th>
              <th>State</th>
              <th>Exposure</th>
              <th>Attack Surface</th>
            </tr>
          </thead>
          <tbody>
            ${ports.map(p => `
              <tr>
                <td><strong>${p.port}</strong></td>
                <td>${p.service}</td>
                <td><span class="severity-badge ${p.state === 'open' ? 'critical' : 'low'}">${p.state.toUpperCase()}</span></td>
                <td><span class="severity-badge ${p.exposure_level === 'HIGH' ? 'critical' : 'medium'}">${p.exposure_level}</span></td>
                <td>${p.attack_surface || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Module 05: Subdomains -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">05</span>
          SUBDOMAIN ENUMERATION
        </h2>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Subdomain</th>
              <th>Status</th>
              <th>IP Addresses</th>
            </tr>
          </thead>
          <tbody>
            ${subdomains.map(s => `
              <tr>
                <td style="color: #00ffff;">${s.subdomain}</td>
                <td><span class="severity-badge ${s.alive ? 'low' : 'critical'}">${s.status} ${s.alive ? '(Live)' : '(Down)'}</span></td>
                <td>${s.dns_ips?.join(', ') || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Module 06: OSINT -->
      <div class="pdf-module">
        <h2 class="pdf-module-title">
          <span class="pdf-module-number">06</span>
          OSINT INTELLIGENCE
        </h2>
        
        <!-- WHOIS -->
        <div class="service-block" style="margin-bottom: 20px;">
          <div class="service-header">
            <h3 class="service-title">WHOIS Information</h3>
          </div>
          <div class="service-content">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #94a3b8; width: 120px;">Registrar:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.whois?.registrar || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Organization:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.whois?.organization || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Country:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.whois?.country || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Created:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.whois?.creation_date || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Expires:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.whois?.expiration_date || 'N/A'}</td></tr>
            </table>
          </div>
        </div>

        <!-- DNS -->
        <div class="service-block" style="margin-bottom: 20px;">
          <div class="service-header">
            <h3 class="service-title">DNS Records</h3>
          </div>
          <div class="service-content">
            <table style="width: 100%; border-collapse: collapse;">
              ${['A', 'MX', 'NS', 'TXT'].map(type => `
                <tr><td style="padding: 8px 0; color: #94a3b8; width: 120px;"><strong>${type}:</strong></td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.dns?.[type]?.join(', ') || 'None'}</td></tr>
              `).join('')}
            </table>
          </div>
        </div>

        <!-- SSL -->
        <div class="service-block" style="margin-bottom: 20px;">
          <div class="service-header">
            <h3 class="service-title">SSL Certificate</h3>
          </div>
          <div class="service-content">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #94a3b8; width: 120px;">Issuer:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.ssl?.issuer?.organizationName || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Common Name:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.ssl?.subject?.commonName || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Valid From:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.ssl?.not_before || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Valid Until:</td><td style="padding: 8px 0; color: #e5e7eb;">${osint?.ssl?.not_after || 'N/A'}</td></tr>
            </table>
          </div>
        </div>

        <!-- Security Headers -->
        <div class="service-block">
          <div class="service-header">
            <h3 class="service-title">Security Headers</h3>
          </div>
          <div class="service-content">
            <table style="width: 100%; border-collapse: collapse;">
              ${Object.entries(osint?.http?.security_headers || {}).map(([key, value]) => `
                <tr><td style="padding: 8px 0; color: #94a3b8; width: 120px;">${key}:</td><td style="padding: 8px 0; color: ${value ? '#4ade80' : '#ef4444'}; font-weight: bold;">${value ? 'ENABLED' : 'MISSING'}</td></tr>
              `).join('')}
            </table>
          </div>
        </div>
      </div>
    `;

    // Generate PDF with better quality
    const canvas = await html2canvas(pdfContainer, {
      scale: 2.5,
      backgroundColor: '#0a0a0f',
      logging: false,
      allowTaint: true,
      useCORS: true,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #0a0a0f; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions to maintain aspect ratio
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm'
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Add more pages if content exceeds one page
    let heightLeft = imgHeight - pageHeight;
    let position = -pageHeight;
    
    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`whitenx-report-${scanResult?.target}-${new Date().toISOString().split('T')[0]}.pdf`);

    document.body.removeChild(pdfContainer);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('PDF generation failed. Check console for details.');
  }
};

// ──────────────────────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [domain, setDomain] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [jsonResponse, setJsonResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

  const processScanData = (scanResponse) => {
    if (!scanResponse) return null;

    const vulns = scanResponse.vulnerabilities || [];
    const ports = scanResponse.port_scan?.services || [];

    const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
    const highCount    = vulns.filter(v => v.severity === 'HIGH').length;
    const mediumCount  = vulns.filter(v => v.severity === 'MEDIUM').length;

    const openPorts     = ports.filter(p => p.state === 'open').length;
    const closedPorts   = ports.filter(p => p.state === 'closed').length;
    const filteredPorts = ports.filter(p => p.state === 'filtered').length;

    const publicSubdomains    = scanResponse.subdomain_enum?.summary?.public || 0;
    const restrictedSubdomains = scanResponse.subdomain_enum?.summary?.restricted || 0;
    const dnsOnlySubdomains   = scanResponse.subdomain_enum?.summary?.dns_only || 0;

    const trend = [
      Math.max(0, criticalCount - 2),
      Math.max(0, criticalCount - 1),
      criticalCount,
      Math.max(0, criticalCount - 1),
      criticalCount,
      Math.max(0, criticalCount + 1),
      criticalCount
    ];

    return {
      vulnerabilityTrend: {
        series: [
          { name: 'Critical', data: trend },
          { name: 'High',     data: trend.map(v => v + highCount) },
          { name: 'Medium',   data: trend.map(() => mediumCount) }
        ],
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      networkVulnerabilities: {
        series: [criticalCount, highCount, mediumCount],
        labels: ['Critical', 'High', 'Medium']
      },
      hostsScanned: {
        series: [publicSubdomains, restrictedSubdomains, dnsOnlySubdomains, 0],
        labels: ['Public', 'Restricted', 'DNS Only', 'Offline']
      },
      webVulnerabilities: {
        series: [openPorts, closedPorts, filteredPorts],
        labels: ['Open', 'Closed', 'Filtered']
      }
    };
  };

  const mockScanData = {
    scan_id: "sync-52d52a3a-ced1-46d2-ae8f-06c824a733aa",
    target: "ljku.edu.in",
    risk_summary: { score: 100, severity: "CRITICAL" },
    vulnerabilities: [
      { type: "SQL Injection (Boolean Based)", severity: "HIGH", port: 80, source: "CONFIG_SCAN", recommendation: "Implement parameterized queries" },
      { type: "SSH exposed", severity: "MEDIUM", port: 22, source: "PORT_SCAN", recommendation: "Restrict SSH using IP whitelisting, disable password login, and enforce key-based authentication." },
      { type: "HTTP exposed", severity: "HIGH", port: 80, source: "PORT_SCAN", recommendation: "Redirect all HTTP traffic to HTTPS and disable port 80 if not required." },
      { type: "HTTPS exposed", severity: "MEDIUM", port: 443, source: "PORT_SCAN", recommendation: "Implement strong security headers such as CSP, HSTS, and X-Frame-Options." }
    ],
    subdomain_enum: {
      found: 2,
      summary: { public: 2, restricted: 0, dns_only: 0 },
      subdomains: [
        { subdomain: "mail.ljku.edu.in", url: "https://mail.ljku.edu.in", dns_ips: ["120.72.91.156"], status: 200, alive: true },
        { subdomain: "www.ljku.edu.in", url: "https://www.ljku.edu.in", dns_ips: ["103.180.186.234"], status: 200, alive: true }
      ]
    },
    port_scan: {
      services: [
        { port: 22, service: "ssh", state: "open", exposure_level: "HIGH", attack_surface: "NETWORK" },
        { port: 80, service: "http", state: "open", exposure_level: "HIGH", attack_surface: "WEB" },
        { port: 443, service: "https", state: "open", exposure_level: "HIGH", attack_surface: "WEB" }
      ]
    },
    osint: {
        status: "completed",
        generated_at: "2026-01-15T13:20:40.586743",
        domain: "ljku.edu.in",
        whois: {
            registrar: "ERNET India",
            organization: "None",
            country: "IN",
            creation_date: "2019-11-11",
            expiration_date: "2029-11-11"
        },
        dns: {
            A: ["103.180.186.234"],
            MX: ["aspmx.l.google.com"],
            NS: ["ns05.domaincontrol.com"],
            TXT: ["v=spf1 include:_spf.google.com ~all"]
        },
        http: {
            security_headers: {
                HSTS: true,
                CSP: false,
                XFO: false
            }
        },
        ssl: {
            issuer: { organizationName: "GoDaddy.com, Inc." },
            subject: { commonName: "*.ljku.edu.in" },
            not_before: "Mar 21 2025",
            not_after: "Apr 6 2026"
        },
        osint_score: 90,
        trust_level: "HIGH"
    },
    fingerprinted_services: [
      {
        port: 22,
        service: "ssh",
        service_name: "openssh",
        version: "9.6",
        banner: "",
        cves: [
          { id: "CVE-2007-2768", cvss: 4.3, description: "OpenSSH, when using OPIE (One-Time Passwords in Everything) for PAM, allows remote attackers to determine the existence of certain user accounts." },
          { id: "CVE-2008-3844", cvss: 9.3, description: "Certain Red Hat Enterprise Linux (RHEL) 4 and 5 packages for OpenSSH, as signed in August 2008 using a legitimate" },
          { id: "CVE-2016-10009", cvss: 7.5, description: "sshd in OpenSSH before 7.4 allows remote attackers to cause a denial of service (NULL pointer dereference)" },
          { id: "CVE-2016-10010", cvss: 7.2, description: "sshd in OpenSSH before 7.4, when privilege separation is disabled, creates forwarded Unix-domain sockets" },
          { id: "CVE-2016-10011", cvss: 4.6, description: "authfile.c in sshd in OpenSSH before 7.4 does not properly consider the effects of realloc on buffer contents" },
          { id: "CVE-2016-10012", cvss: 7.1, description: "The shared memory manager in sshd in OpenSSH before 7.4 does not ensure that a bounds check is enforced" }
        ],
        exploit_weight: 0.85
      }
    ]
  };

  const handleScan = () => {
    if (!domain.trim()) {
      const processed = processScanData(mockScanData);
      setScanResult(mockScanData);
      setChartData(processed);
      return;
    }
    handleStartScan();
  };

  const handleStartScan = async () => {
    if (!domain.trim()) {
      setError('Please enter target');
      return;
    }

    setLoading(true);
    setError('');
    setJsonResponse(null);

    try {
      const response = await fetch(`https://ai-vapt-project.onrender.com/scan/full?target=${domain}`, {
        method: 'POST',
        headers: { 'accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Scan failed: ${response.status}`);

      const data = await response.json();
      setJsonResponse(data);
      setScanResult(data);
      setChartData(processScanData(data));
    } catch (err) {
      setError(err.message || 'Backend unavailable – using demo data');
      const processed = processScanData(mockScanData);
      setScanResult(mockScanData);
      setChartData(processed);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!scanResult) return;
    await exportToPDF(
      scanResult,
      scanResult.fingerprinted_services || [],
      scanResult.vulnerabilities || [],
      scanResult.port_scan?.services || [],
      scanResult.subdomain_enum?.subdomains || [],
      scanResult.osint || {}
    );
  };

  const backToDashboard = () => setShowJsonViewer(false);

  if (loading) {
    return (
      <div className="app-wrapper centered loading-overlay">
        <div className="loading-container">
          <div className="spinner neon-spinner"></div>
          <div className="loading-text glitch-text">BREACHING TARGET...</div>
        </div>
      </div>
    );
  }

  if (showJsonViewer && jsonResponse) {
    return (
      <div className="app-wrapper json-viewer-page">
        <nav className="top-nav">
          <div className="nav-left">
            <div className="nav-logo glitch-text">
              <span>🛡️</span> WHITENX
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-back-btn" onClick={backToDashboard}>
              ← Back to Dashboard
            </button>
            <div className="user-avatar neon-avatar">AB</div>
          </div>
        </nav>

        <div className="json-viewer-container">
          <h1 className="json-title glitch-heading">RAW SCAN OUTPUT (JSON)</h1>
          <pre className="json-content">
            {JSON.stringify(jsonResponse, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="app-wrapper">
        <nav className="top-nav">
          <div className="nav-left">
            <div className="nav-logo glitch-text">
              <span>🛡️</span> WHITENX
            </div>
          </div>
          <div className="nav-right">
            <div className="user-avatar neon-avatar">AB</div>
          </div>
        </nav>

        <div className="scan-input-container">
          <div className="scan-hero">
            <h1 className="glitch-heading">VAPT SCANNER</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>
              Enter domain or IP address to begin reconnaissance
            </p>

            {error && <div className="error-box" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <div className="scan-form-row">
              <input
                type="text"
                placeholder="example.com or 192.168.1.1"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="search-filter"
              />
              <button onClick={handleScan} className="scan-btn primary">
                {loading ? 'Scanning...' : 'START SCAN'}
              </button>
              <button
                onClick={() => {
                  const processed = processScanData(mockScanData);
                  setScanResult(mockScanData);
                  setChartData(processed);
                }}
                className="scan-btn secondary"
              >
                DEMO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vulns = scanResult.vulnerabilities || [];
  const ports = scanResult.port_scan?.services || [];
  const subdomains = scanResult.subdomain_enum?.subdomains || [];
  const osint = scanResult.osint || {};
  const fingerprintedServices = scanResult.fingerprinted_services || [];

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-left">
          <div className="nav-logo glitch-text">
            <span>🛡️</span> WHITENX
          </div>
          <div className="nav-tabs">
            {['Overview', 'Vulnerabilities', 'Services', 'Ports', 'Subdomains', 'OSINT', 'Full Report'].map(tab => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <button
            className="nav-back-btn"
            onClick={() => { setDomain(""); setScanResult(null); setChartData(null); setJsonResponse(null); }}
          >
            ↩ New Scan
          </button>
          
          {jsonResponse && (
            <button
              className="json-view-btn"
              onClick={() => setShowJsonViewer(true)}
            >
              View JSON
            </button>
          )}
        </div>
      </nav>

      <div className="dashboard-wrapper">
        <div className="report-header">
          <div className="report-title glitch-text">SECURITY ASSESSMENT REPORT</div>
          <div className="report-meta">
            <div className="target">Target: {scanResult.target}</div>
            <div className="scan-time">Scan ID: {scanResult.scan_id?.substring(0,12)}...</div>
          </div>
        </div>

        {activeTab === 'overview' && chartData && (
          <div className="dashboard-grid">
            <div className="dashboard-row two-columns">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">Vulnerability Trend</div>
                </div>
                <div className="card-body">
                  <Chart
                    type="area"
                    series={chartData.vulnerabilityTrend.series}
                    options={{
                      chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
                      colors: ['#ef4444', '#ea580c', '#60a5fa'],
                      xaxis: { categories: chartData.vulnerabilityTrend.categories, labels: { style: { colors: '#94a3b8' } } },
                      yaxis: { labels: { style: { colors: '#94a3b8' } } },
                      grid: { borderColor: 'rgba(96, 165, 250, 0.1)' },
                      stroke: { curve: 'smooth', width: 2 },
                      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
                      legend: { labels: { colors: '#94a3b8' } }
                    }}
                    height={300}
                  />
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">Severity Distribution</div>
                </div>
                <div className="card-body">
                  <Chart
                    type="bar"
                    series={[{
                      name: 'Count',
                      data: [
                        vulns.filter(v => v.severity === 'CRITICAL').length,
                        vulns.filter(v => v.severity === 'HIGH').length,
                        vulns.filter(v => v.severity === 'MEDIUM').length,
                        vulns.filter(v => v.severity === 'LOW').length
                      ]
                    }]}
                    options={{
                      chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
                      colors: ['#ef4444'],
                      xaxis: {
                        categories: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
                        labels: { style: { colors: '#94a3b8' } }
                      },
                      yaxis: { labels: { style: { colors: '#94a3b8' } } },
                      grid: { borderColor: 'rgba(96, 165, 250, 0.1)' },
                      dataLabels: { enabled: true }
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-row three-columns">
              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">Network Vulnerabilities</div>
                </div>
                <div className="card-body">
                  <div className="donut-container">
                    <Chart
                      type="donut"
                      series={chartData.networkVulnerabilities.series}
                      options={{
                        colors: ['#ef4444', '#ea580c', '#60a5fa'],
                        labels: chartData.networkVulnerabilities.labels,
                        chart: { toolbar: { show: false }, background: 'transparent' },
                        legend: { show: false }
                      }}
                      height={220}
                    />
                    <div className="donut-legend">
                      {chartData.networkVulnerabilities.labels.map((label, i) => (
                        <div key={label} className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: ['#ef4444', '#ea580c', '#60a5fa'][i] }}></div>
                          <div className="legend-label">{label}</div>
                          <div className="legend-value">{chartData.networkVulnerabilities.series[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">Port Status</div>
                </div>
                <div className="card-body">
                  <div className="donut-container">
                    <Chart
                      type="donut"
                      series={chartData.webVulnerabilities.series}
                      options={{
                        colors: ['#4ade80', '#ea580c', '#ef4444'],
                        labels: chartData.webVulnerabilities.labels,
                        chart: { toolbar: { show: false }, background: 'transparent' },
                        legend: { show: false }
                      }}
                      height={220}
                    />
                    <div className="donut-legend">
                      {chartData.webVulnerabilities.labels.map((label, i) => (
                        <div key={label} className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: ['#4ade80', '#ea580c', '#ef4444'][i] }}></div>
                          <div className="legend-label">{label}</div>
                          <div className="legend-value">{chartData.webVulnerabilities.series[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">Subdomain Classification</div>
                </div>
                <div className="card-body">
                  <div className="donut-container">
                    <Chart
                      type="donut"
                      series={chartData.hostsScanned.series}
                      options={{
                        colors: ['#4ade80', '#ea580c', '#60a5fa', '#ef4444'],
                        labels: chartData.hostsScanned.labels,
                        chart: { toolbar: { show: false }, background: 'transparent' },
                        legend: { show: false }
                      }}
                      height={220}
                    />
                    <div className="donut-legend">
                      {chartData.hostsScanned.labels.map((label, i) => (
                        <div key={label} className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: ['#4ade80', '#ea580c', '#60a5fa', '#ef4444'][i] }}></div>
                          <div className="legend-label">{label}</div>
                          <div className="legend-value">{chartData.hostsScanned.series[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FingerprintedServices services={fingerprintedServices} />
            <OsintOverview osint={osint} />

            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">Top Critical Issues</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div className="findings-table">
                  <div className="table-header">
                    <div>Vulnerability</div>
                    <div>Source</div>
                    <div>Severity</div>
                    <div>Port</div>
                    <div>Recommendation</div>
                  </div>
                  {vulns.slice(0, 5).map((vuln, i) => (
                    <div key={i} className="table-row">
                      <div>{vuln.type}</div>
                      <div>{vuln.source || 'CONFIG'}</div>
                      <div>
                        <span className={`badge severity-${vuln.severity?.toLowerCase() || 'info'}`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <div>{vuln.port || '-'}</div>
                      <div>{vuln.recommendation || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">Port Risk Analysis</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div className="findings-table">
                  <div className="table-header">
                    <div>Port</div>
                    <div>Service</div>
                    <div>State</div>
                    <div>Exposure</div>
                    <div>Risk</div>
                  </div>
                  {ports.map((port, i) => {
                    const risk = port.state === 'open' ? (port.exposure_level === 'HIGH' ? 95 : 65) : 20;
                    return (
                      <div key={i} className="table-row">
                        <div><strong>{port.port}</strong></div>
                        <div>{port.service}</div>
                        <div>
                          <span className={`badge ${port.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
                            {port.state.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className={`badge ${port.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
                            {port.exposure_level}
                          </span>
                        </div>
                        <div style={{ color: risk > 80 ? '#ef4444' : risk > 60 ? '#ea580c' : '#4ade80' }}>
                          {risk}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">Subdomain Enumeration</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {subdomains.length > 0 ? subdomains.map((sub, i) => (
                  <div key={i} className="subdomain-card">
                    <div style={{ color: sub.alive ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
                      {sub.alive ? '● LIVE' : '○ DOWN'} {sub.subdomain}
                    </div>
                    <div>Status: {sub.status}</div>
                    {sub.dns_ips && <div>IPs: {sub.dns_ips.join(', ')}</div>}
                  </div>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No subdomains discovered
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Detected Vulnerabilities ({vulns.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="findings-table">
                <div className="table-header">
                  <div>Type</div>
                  <div>Source</div>
                  <div>Severity</div>
                  <div>Port</div>
                  <div>Fix</div>
                </div>
                {vulns.map((v, i) => (
                  <div key={i} className="table-row">
                    <div>{v.type}</div>
                    <div>{v.source || 'CONFIG'}</div>
                    <div>
                      <span className={`badge severity-${v.severity?.toLowerCase()}`}>{v.severity}</span>
                    </div>
                    <div>{v.port || '-'}</div>
                    <div>{v.recommendation || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <FingerprintedServices services={fingerprintedServices} />
        )}

        {activeTab === 'ports' && (
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Port Scan Results ({ports.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="findings-table">
                <div className="table-header">
                  <div>Port</div>
                  <div>Service</div>
                  <div>State</div>
                  <div>Exposure</div>
                  <div>Attack Surface</div>
                </div>
                {ports.map((p, i) => (
                  <div key={i} className="table-row">
                    <div><strong>{p.port}</strong></div>
                    <div>{p.service}</div>
                    <div>
                      <span className={`badge ${p.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
                        {p.state.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className={`badge ${p.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
                        {p.exposure_level}
                      </span>
                    </div>
                    <div>{p.attack_surface || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subdomains' && (
          <div className="dashboard-grid">
            {subdomains.map((sub, i) => (
              <div key={i} className="dashboard-card">
                <div className="card-header">
                  <div className="card-title">
                    {sub.alive ? '✅' : '❌'} {sub.subdomain}
                  </div>
                </div>
                <div className="card-body">
                  <div>Status Code: {sub.status}</div>
                  {sub.url && <div>URL: {sub.url}</div>}
                  {sub.dns_ips?.length > 0 && <div>IPs: {sub.dns_ips.join(', ')}</div>}
                </div>
              </div>
            ))}
            {subdomains.length === 0 && (
              <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                No subdomains found in this scan
              </div>
            )}
          </div>
        )}

        {activeTab === 'osint' && (
          <OsintDetails osint={osint} />
        )}

        {activeTab === 'fullreport' && (
          <CompleteReport 
            scanResult={scanResult}
            fingerprintedServices={fingerprintedServices}
            vulns={vulns}
            ports={ports}
            subdomains={subdomains}
            osint={osint}
            onExportPDF={handleExportPDF}
          />
        )}

      </div>
    </div>
  );
};

function App() {
  const [stage, setStage] = useState('legal');

  return (
    <>
      {stage === 'legal' && <LegalPage onAccept={() => setStage('login')} />}
      {stage === 'login' && <LoginPage onLogin={() => setStage('dashboard')} />}
      {stage === 'dashboard' && <Dashboard />}
    </>
  );
}

export default App;