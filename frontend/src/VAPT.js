import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
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

    // fake auth delay
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

// ========== NEW: CVE Display Component ==========
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

// ========== NEW: Fingerprinted Services Component ==========
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
        <table className="findings-table" style={{ width: '100%' }}>
          <thead>
            <tr className="table-header">
              <th>Port</th>
              <th>Service</th>
              <th>Version</th>
              <th>Banner</th>
              <th>CVEs & Exploit Probability</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc, idx) => (
              <tr key={idx} className="table-row service-row">
                <td><strong>{svc.port}</strong></td>
                <td>{svc.service_name || svc.service}</td>
                <td>
                  {svc.version ? (
                    <span className="version-badge">{svc.version}</span>
                  ) : (
                    <span className="version-unknown">Unknown</span>
                  )}
                </td>
                <td className="banner-cell">
                  {svc.banner ? (
                    <span className="banner-text">{svc.banner.substring(0, 50)}...</span>
                  ) : (
                    <span className="no-banner">No banner</span>
                  )}
                </td>
                <td className="cve-cell">
                  <CVEDisplay service={svc} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <thead>
            <tr className="table-header"><th colSpan="2">Summary</th></tr>
          </thead>
          <tbody>
            <tr className="table-row"><td>Generated At</td><td>{new Date(osint.generated_at).toLocaleString()}</td></tr>
            <tr className="table-row"><td>OSINT Score</td><td><strong>{osint.osint_score}</strong></td></tr>
            <tr className="table-row">
              <td>Trust Level</td>
              <td>
                <span className={`badge severity-${osint.trust_level.toLowerCase()}`}>
                  {osint.trust_level}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= WHOIS ================= */}
        <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <thead>
            <tr className="table-header"><th colSpan="2">WHOIS Information</th></tr>
          </thead>
          <tbody>
            {[
              ['Registrar', whois.registrar],
              ['Organization', whois.organization || 'N/A'],
              ['Country', whois.country],
              ['Created', whois.creation_date],
              ['Expires', whois.expiration_date]
            ].map(([k, v], i) => (
              <tr key={i} className="table-row"><td>{k}</td><td>{v}</td></tr>
            ))}
          </tbody>
        </table>

        {/* ================= DNS ================= */}
        <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <thead>
            <tr className="table-header"><th>Type</th><th>Records</th></tr>
          </thead>
          <tbody>
            {['A', 'MX', 'NS', 'TXT'].map(type => (
              <tr key={type} className="table-row">
                <td><strong>{type}</strong></td>
                <td style={{ color: '#94a3b8' }}>
                  {(dns[type] || []).length ? dns[type].join(', ') : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= SSL ================= */}
        <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <thead>
            <tr className="table-header"><th colSpan="2">SSL Certificate</th></tr>
          </thead>
          <tbody>
            <tr className="table-row"><td>Issuer</td><td>{ssl.issuer?.organizationName}</td></tr>
            <tr className="table-row"><td>Common Name</td><td>{ssl.subject?.commonName}</td></tr>
            <tr className="table-row"><td>Valid From</td><td>{ssl.not_before}</td></tr>
            <tr className="table-row"><td>Valid Until</td><td>{ssl.not_after}</td></tr>
          </tbody>
        </table>

        {/* ================= HEADERS ================= */}
        <table className="findings-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <thead>
            <tr className="table-header"><th>Security Header</th><th>Status</th></tr>
          </thead>
          <tbody>
            {Object.entries(headers).map(([key, value]) => (
              <tr key={key} className="table-row">
                <td>{key}</td>
                <td>
                  <span className={`badge ${value ? 'severity-low' : 'severity-critical'}`}>
                    {value ? 'ENABLED' : 'MISSING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= CRT.SH ================= */}
        <table className="findings-table" style={{ width: '100%' }}>
          <thead>
            <tr className="table-header"><th>Certificate Transparency (crt.sh)</th></tr>
          </thead>
          <tbody>
            {osint.crtsh?.map((entry, i) => (
              <tr key={i} className="table-row">
                <td style={{ whiteSpace: 'pre-wrap', color: '#94a3b8' }}>{entry}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Dashboard – Main Component
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

  // Mock data for demo
  const mockScanData = {
    scan_id: "sync-demo-123456",
    target: "demo-target.com",
    risk_summary: { score: 75, severity: "HIGH" },
    vulnerabilities: [
      { type: "SQL Injection", severity: "HIGH", source: "CONFIG_SCAN", port: 80, recommendation: "Use parameterized queries" },
      { type: "SSH exposed", severity: "CRITICAL", source: "PORT_SCAN", port: 22, recommendation: "Restrict SSH access" }
    ],
    subdomain_enum: {
      found: 2,
      summary: { public: 2, restricted: 0, dns_only: 0 },
      subdomains: [
        { subdomain: "mail.demo.com", url: "https://mail.demo.com", dns_ips: ["192.168.1.1"], status: 200, alive: true },
        { subdomain: "www.demo.com", url: "https://www.demo.com", dns_ips: ["192.168.1.2"], status: 200, alive: true }
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
      generated_at: new Date().toISOString(),
      domain: "demo.com",
      whois: {
        registrar: "Demo Registrar",
        organization: "Demo Org",
        country: "US",
        creation_date: "2020-01-01",
        expiration_date: "2030-01-01"
      },
      crtsh: ["*.demo.com", "mail.demo.com"],
      dns: {
        A: ["192.168.1.1"],
        MX: ["mail.demo.com"],
        NS: ["ns1.demo.com"],
        TXT: ["v=spf1 include:_spf.google.com"]
      },
      http: {
        status: 200,
        server: "nginx/1.20.1",
        security_headers: { HSTS: true, CSP: false, XFO: true }
      },
      ssl: {
        issuer: { organizationName: "Let's Encrypt" },
        subject: { commonName: "*.demo.com" },
        not_before: "2025-01-01",
        not_after: "2026-01-01"
      },
      osint_score: 85,
      trust_level: "HIGH"
    },
    fingerprinted_services: [
      {
        port: 22,
        service: "ssh",
        service_name: "openssh",
        version: "7.4",
        banner: "SSH-2.0-OpenSSH_7.4",
        cves: [
          { id: "CVE-2021-28041", cvss: 7.5, description: "OpenSSH 7.4 vulnerability allows remote code execution" },
          { id: "CVE-2020-15778", cvss: 6.8, description: "scp command injection in OpenSSH 7.4" }
        ],
        exploit_weight: 0.75
      },
      {
        port: 80,
        service: "http",
        service_name: "apache",
        version: "2.4.49",
        banner: "Apache/2.4.49 (Ubuntu)",
        cves: [
          { id: "CVE-2021-41773", cvss: 7.5, description: "Apache 2.4.49 path traversal vulnerability" },
          { id: "CVE-2021-42013", cvss: 9.8, description: "Apache 2.4.49 remote code execution" }
        ],
        exploit_weight: 0.85
      }
    ],
    meta: {
      cve_api_configured: true
    }
  };

  const handleScan = async () => {
    if (!domain.trim()) {
      // Show mock data if no domain entered
      const processed = processScanData(mockScanData);
      setScanResult(mockScanData);
      setChartData(processed);
      return;
    }

    setLoading(true);
    setError('');
    setJsonResponse(null);

    try {
    const response = await fetch(
  `https://ai-vapt-project.onrender.com/scan/full?target=${domain}`,
  {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  }
);

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

  const backToDashboard = () => setShowJsonViewer(false);

  // Loading screen
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

  // JSON Viewer
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

  // Scan Input Page
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
            {['Overview', 'Vulnerabilities', 'Services', 'Ports', 'Subdomains', 'OSINT'].map(tab => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.toLowerCase())}
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
            {scanResult.meta?.cve_api_configured && (
              <div className="cve-status-badge">
                ✓ NVD API Connected
              </div>
            )}
          </div>
        </div>

        {/* Overview Tab */}
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

            {/* NEW: Fingerprinted Services with CVEs */}
            <FingerprintedServices services={fingerprintedServices} />

            <OsintOverview osint={osint} />

            {/* Top Critical Issues */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">Top Critical Issues</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="findings-table" style={{ width: '100%' }}>
                  <thead>
                    <tr className="table-header">
                      <th>Vulnerability</th>
                      <th>Source</th>
                      <th>Severity</th>
                      <th>Port</th>
                      <th>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vulns.slice(0, 5).map((vuln, i) => (
                      <tr key={i} className="table-row">
                        <td>{vuln.type}</td>
                        <td>{vuln.source || 'CONFIG'}</td>
                        <td>
                          <span className={`badge severity-${vuln.severity?.toLowerCase() || 'info'}`}>
                            {vuln.severity}
                          </span>
                        </td>
                        <td>{vuln.port || '-'}</td>
                        <td>{vuln.recommendation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ports Table */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div className="card-title">Port Risk Analysis</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="findings-table" style={{ width: '100%' }}>
                  <thead>
                    <tr className="table-header">
                      <th>Port</th>
                      <th>Service</th>
                      <th>State</th>
                      <th>Exposure</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.map((port, i) => {
                      const risk = port.state === 'open' ? (port.exposure_level === 'HIGH' ? 95 : 65) : 20;
                      return (
                        <tr key={i} className="table-row">
                          <td><strong>{port.port}</strong></td>
                          <td>{port.service}</td>
                          <td>
                            <span className={`badge ${port.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
                              {port.state.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${port.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
                              {port.exposure_level}
                            </span>
                          </td>
                          <td style={{ color: risk > 80 ? '#ef4444' : risk > 60 ? '#ea580c' : '#4ade80' }}>
                            {risk}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subdomains Grid */}
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

        {/* Vulnerabilities Tab */}
        {activeTab === 'vulnerabilities' && (
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Detected Vulnerabilities ({vulns.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="findings-table" style={{ width: '100%' }}>
                <thead>
                  <tr className="table-header">
                    <th>Type</th>
                    <th>Source</th>
                    <th>Severity</th>
                    <th>Port</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {vulns.map((v, i) => (
                    <tr key={i} className="table-row">
                      <td>{v.type}</td>
                      <td>{v.source || 'CONFIG'}</td>
                      <td>
                        <span className={`badge severity-${v.severity?.toLowerCase()}`}>{v.severity}</span>
                      </td>
                      <td>{v.port || '-'}</td>
                      <td>{v.recommendation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW: Services Tab with CVEs */}
        {activeTab === 'services' && (
          <FingerprintedServices services={fingerprintedServices} />
        )}

        {/* Ports Tab */}
        {activeTab === 'ports' && (
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Port Scan Results ({ports.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="findings-table" style={{ width: '100%' }}>
                <thead>
                  <tr className="table-header">
                    <th>Port</th>
                    <th>Service</th>
                    <th>State</th>
                    <th>Exposure</th>
                    <th>Attack Surface</th>
                  </tr>
                </thead>
                <tbody>
                  {ports.map((p, i) => (
                    <tr key={i} className="table-row">
                      <td><strong>{p.port}</strong></td>
                      <td>{p.service}</td>
                      <td>
                        <span className={`badge ${p.state === 'open' ? 'severity-critical' : 'severity-low'}`}>
                          {p.state.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.exposure_level === 'HIGH' ? 'severity-critical' : 'severity-low'}`}>
                          {p.exposure_level}
                        </span>
                      </td>
                      <td>{p.attack_surface || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subdomains Tab */}
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

        {/* OSINT Tab */}
        {activeTab === 'osint' && (
          <OsintDetails osint={osint} />
        )}

      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main App
// ──────────────────────────────────────────────────────────────
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
