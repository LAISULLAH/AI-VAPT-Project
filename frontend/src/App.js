import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ════════════════════════════════════════════════════════════
// WHITENX — App.js
// CompleteReport + exportToPDF
// Theme: dark navy consistent with VAPT_final.jsx
// ════════════════════════════════════════════════════════════

// ── Shared token helpers ─────────────────────────────────────
const sevColor = s => ({
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#3b82f6'
}[s] || '#475569');

const sevBg = s => ({
  CRITICAL: '#ef444412', HIGH: '#f9731612', MEDIUM: '#f59e0b12', LOW: '#3b82f612'
}[s] || '#11111a');

const Badge = ({ label, color, bg, border }) => (
  <span style={{
    display: 'inline-block', fontSize: 9, fontWeight: 700,
    letterSpacing: '1.5px', padding: '3px 10px', borderRadius: 3,
    fontFamily: "'JetBrains Mono', monospace",
    color: color, background: bg,
    border: `1px solid ${border || color + '30'}`,
  }}>{label}</span>
);

const SevBadge = ({ s }) => (
  <Badge label={s} color={sevColor(s)} bg={sevBg(s)} />
);

// ── Section heading ──────────────────────────────────────────
const ModuleTitle = ({ num, title }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '0 0 14px', marginBottom: 20,
    borderBottom: '1px solid #0f2040',
  }}>
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '2px',
      color: '#22c55e', fontFamily: 'monospace', minWidth: 24,
    }}>{String(num).padStart(2, '0')}</span>
    <span style={{
      fontSize: 13, fontWeight: 800, letterSpacing: '3px',
      color: '#e2e8f0', fontFamily: 'monospace',
    }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: '#0f2040' }} />
  </div>
);

// ── Stat mini card ───────────────────────────────────────────
const MiniStat = ({ label, value, color }) => (
  <div style={{
    background: '#04091a', border: '1px solid #0f2040',
    borderTop: `2px solid ${color}`,
    borderRadius: 6, padding: '16px 20px', textAlign: 'center',
    flex: 1, minWidth: 100,
  }}>
    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: '#1e3a5f', marginBottom: 8, fontFamily: 'monospace' }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
  </div>
);

// ── Table wrapper ────────────────────────────────────────────
const ReportTable = ({ cols, rows }) => (
  <div style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid #0f2040' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
      <thead>
        <tr style={{ background: '#04091a' }}>
          {cols.map(c => (
            <th key={c} style={{
              padding: '10px 16px', textAlign: 'left',
              fontSize: 8, fontWeight: 700, letterSpacing: '1.5px',
              color: '#1e3a5f', borderBottom: '1px solid #0f2040',
            }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
);

const TD = ({ children, accent, mono, small }) => (
  <td style={{
    padding: '11px 16px',
    fontSize: small ? 10 : 11,
    color: accent || (mono ? '#94a3b8' : '#475569'),
    borderBottom: '1px solid #04091a',
    fontFamily: mono ? 'monospace' : 'inherit',
    maxWidth: small ? 220 : undefined,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: small ? 'nowrap' : undefined,
  }}>{children}</td>
);

// ── Section card ─────────────────────────────────────────────
const SectionCard = ({ title, children }) => (
  <div style={{
    background: '#060d1c', border: '1px solid #0f2040',
    borderRadius: 8, overflow: 'hidden', marginBottom: 12,
  }}>
    <div style={{
      padding: '10px 18px', background: '#04091a',
      borderBottom: '1px solid #0f2040',
      fontSize: 9, fontWeight: 700, letterSpacing: '2px',
      color: '#1e3a5f', fontFamily: 'monospace',
    }}>{title}</div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
);

// ════════════════════════════════════════════════════════════
// COMPLETE REPORT COMPONENT
// ════════════════════════════════════════════════════════════
export const CompleteReport = ({
  scanResult, fingerprintedServices, vulns,
  ports, subdomains, osint, onExportPDF
}) => {
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    await onExportPDF();
    setExporting(false);
  };

  const crit = vulns.filter(v => v.severity === 'CRITICAL').length;
  const high = vulns.filter(v => v.severity === 'HIGH').length;
  const med  = vulns.filter(v => v.severity === 'MEDIUM').length;
  const low  = vulns.filter(v => v.severity === 'LOW').length;
  const openPorts = ports.filter(p => p.state === 'open').length;
  const whois = osint?.whois || {};
  const dns   = osint?.dns   || {};
  const hdrs  = osint?.http?.security_headers || {};

  return (
    <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── REPORT HEADER ── */}
      <div style={{
        background: '#060d1c', border: '1px solid #1e3a5f',
        borderRadius: 10, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative corner lines */}
        {[['0','0','top','left'],['0','auto','top','right'],['auto','0','bottom','left'],['auto','auto','bottom','right']].map(([t,r,b1,b2],i)=>(
          <div key={i} style={{
            position:'absolute',
            top:t!=='auto'?16:undefined, bottom:t==='auto'?16:undefined,
            left:r!=='auto'?16:undefined, right:r==='auto'?undefined:16,
            width:20, height:20,
            borderTop: b1==='top'?'1.5px solid #1e3a5f':'none',
            borderBottom: b1==='bottom'?'1.5px solid #1e3a5f':'none',
            borderLeft: b2==='left'?'1.5px solid #1e3a5f':'none',
            borderRight: b2==='right'?'1.5px solid #1e3a5f':'none',
          }}/>
        ))}

        <div style={{ fontSize: 9, color: '#1e3a5f', letterSpacing: '3px', marginBottom: 10, fontFamily: 'monospace' }}>
          ⚡ WHITENX — SECURITY ASSESSMENT
        </div>
        <div style={{ fontSize: 'clamp(14px,3vw,22px)', fontWeight: 800, letterSpacing: '3px', color: '#e2e8f0', marginBottom: 20, fontFamily: 'monospace' }}>
          COMPLETE VULNERABILITY REPORT
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { label: 'TARGET',    value: scanResult?.target },
            { label: 'SCAN ID',   value: scanResult?.scan_id?.substring(0, 16) + '...' },
            { label: 'GENERATED', value: new Date().toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{
              background: '#04091a', border: '1px solid #0f2040',
              borderRadius: 6, padding: '10px 16px', flex: 1, minWidth: 160,
            }}>
              <div style={{ fontSize: 8, color: '#1e3a5f', letterSpacing: '2px', marginBottom: 4, fontFamily: 'monospace' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#38bdf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <button onClick={handleExport} disabled={exporting} style={{
          fontFamily: 'monospace', fontSize: 11, fontWeight: 800, letterSpacing: '2px',
          padding: '13px 28px', borderRadius: 6,
          border: '1px solid #38bdf840',
          background: exporting ? '#04091a' : '#38bdf812',
          color: '#38bdf8', cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.6 : 1, transition: 'all .2s',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          {exporting ? '⏳  GENERATING PDF...' : '📄  EXPORT FULL REPORT AS PDF'}
        </button>
      </div>

      {/* ── 01: OVERVIEW ── */}
      <div>
        <ModuleTitle num={1} title="OVERVIEW" />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <MiniStat label="TOTAL VULNS"  value={vulns.length}      color="#ef4444" />
          <MiniStat label="CRITICAL"     value={crit}              color="#ef4444" />
          <MiniStat label="HIGH"         value={high}              color="#f97316" />
          <MiniStat label="MEDIUM"       value={med}               color="#f59e0b" />
          <MiniStat label="LOW"          value={low}               color="#3b82f6" />
          <MiniStat label="OPEN PORTS"   value={openPorts}         color="#38bdf8" />
          <MiniStat label="SUBDOMAINS"   value={subdomains.length} color="#a78bfa" />
        </div>
      </div>

      {/* ── 02: VULNERABILITIES ── */}
      <div>
        <ModuleTitle num={2} title="VULNERABILITIES DETECTED" />
        <ReportTable
          cols={['TYPE', 'SEVERITY', 'PORT', 'RECOMMENDATION']}
          rows={vulns.map((v, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#04091a08' : 'transparent' }}>
              <TD mono>{v.type}</TD>
              <TD><SevBadge s={v.severity} /></TD>
              <TD accent="#38bdf8">{v.port || '—'}</TD>
              <TD small>{(v.recommendation || 'Review configuration').substring(0, 80)}</TD>
            </tr>
          ))}
        />
      </div>

      {/* ── 03: FINGERPRINTED SERVICES ── */}
      <div>
        <ModuleTitle num={3} title="FINGERPRINTED SERVICES & CVEs" />
        {fingerprintedServices.length === 0 && (
          <div style={{ color: '#1e3a5f', fontSize: 11, fontFamily: 'monospace', padding: 20 }}>No services fingerprinted</div>
        )}
        {fingerprintedServices.map((svc, i) => (
          <SectionCard key={i} title={`PORT ${svc.port}  —  ${svc.service_name || svc.service}  ${svc.version ? `v${svc.version}` : ''}`}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 8, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'monospace' }}>BANNER</div>
                <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{svc.banner || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'monospace' }}>EXPLOIT PROBABILITY</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color: svc.exploit_weight >= 0.7 ? '#ef4444' : svc.exploit_weight >= 0.4 ? '#f97316' : '#22c55e' }}>
                  {svc.exploit_weight ? (svc.exploit_weight * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
            {svc.cves?.length > 0 && (
              <div>
                <div style={{ fontSize: 8, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: 8, fontFamily: 'monospace' }}>CVEs FOUND — {svc.cves.length}</div>
                {svc.cves.map((cve, ci) => (
                  <div key={ci} style={{
                    background: '#04091a', border: '1px solid #0f2040',
                    borderRadius: 4, padding: '10px 14px', marginBottom: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{cve.id}</span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
                        background: cve.cvss >= 7 ? '#ef444415' : cve.cvss >= 4 ? '#f9731615' : '#22c55e15',
                        color: cve.cvss >= 7 ? '#ef4444' : cve.cvss >= 4 ? '#f97316' : '#22c55e',
                        border: `1px solid ${cve.cvss >= 7 ? '#ef444430' : cve.cvss >= 4 ? '#f9731630' : '#22c55e30'}`,
                        fontFamily: 'monospace',
                      }}>CVSS {cve.cvss}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{cve.description}</div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ))}
      </div>

      {/* ── 04: PORT SCAN ── */}
      <div>
        <ModuleTitle num={4} title="PORT SCAN RESULTS" />
        <ReportTable
          cols={['PORT', 'SERVICE', 'STATE', 'EXPOSURE', 'ATTACK SURFACE']}
          rows={ports.map((p, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#04091a08' : 'transparent' }}>
              <TD accent="#38bdf8" mono><strong>{p.port}</strong></TD>
              <TD mono>{p.service}</TD>
              <TD><SevBadge s={(p.state || 'OPEN').toUpperCase()} /></TD>
              <TD>{p.exposure_level
                ? <Badge label={p.exposure_level} color={p.exposure_level === 'HIGH' ? '#ef4444' : '#f97316'} bg={p.exposure_level === 'HIGH' ? '#ef444412' : '#f9731612'} />
                : <span style={{ color: '#1e3a5f', fontSize: 10 }}>—</span>}
              </TD>
              <TD small>{p.attack_surface || '—'}</TD>
            </tr>
          ))}
        />
      </div>

      {/* ── 05: SUBDOMAINS ── */}
      <div>
        <ModuleTitle num={5} title="SUBDOMAIN ENUMERATION" />
        {subdomains.length === 0
          ? <div style={{ color: '#1e3a5f', fontSize: 11, fontFamily: 'monospace', padding: '20px 0' }}>No subdomains discovered</div>
          : <ReportTable
              cols={['SUBDOMAIN', 'STATUS', 'IP ADDRESSES']}
              rows={subdomains.map((s, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#04091a08' : 'transparent' }}>
                  <TD accent="#38bdf8" mono>{s.subdomain || s}</TD>
                  <TD>
                    <Badge
                      label={s.alive ? 'ALIVE' : 'DOWN'}
                      color={s.alive ? '#22c55e' : '#ef4444'}
                      bg={s.alive ? '#22c55e12' : '#ef444412'}
                    />
                  </TD>
                  <TD small>{s.dns_ips?.join(', ') || '—'}</TD>
                </tr>
              ))}
            />
        }
      </div>

      {/* ── 06: OSINT ── */}
      <div>
        <ModuleTitle num={6} title="OSINT INTELLIGENCE" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* WHOIS */}
          <SectionCard title="WHOIS">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
              <tbody>
                {[
                  ['Registrar',    whois.registrar],
                  ['Organization', whois.organization],
                  ['Country',      whois.country],
                  ['Created',      whois.creation_date],
                  ['Expires',      whois.expiration_date],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '6px 0', fontSize: 9, color: '#1e3a5f', width: 90, letterSpacing: '1px' }}>{k}</td>
                    <td style={{ padding: '6px 0', fontSize: 11, color: '#94a3b8' }}>{v || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* DNS */}
          <SectionCard title="DNS RECORDS">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
              <tbody>
                <tr><td style={{ padding: '6px 0', fontSize: 9, color: '#1e3a5f', width: 40 }}>A</td><td style={{ padding: '6px 0', fontSize: 10, color: '#94a3b8' }}>{dns.a_records?.join(', ') || 'None'}</td></tr>
                <tr><td style={{ padding: '6px 0', fontSize: 9, color: '#1e3a5f' }}>MX</td><td style={{ padding: '6px 0', fontSize: 10, color: '#94a3b8' }}>{dns.mx_records?.map(m => m.exchange || m).join(', ') || 'None'}</td></tr>
                <tr><td style={{ padding: '6px 0', fontSize: 9, color: '#1e3a5f' }}>NS</td><td style={{ padding: '6px 0', fontSize: 10, color: '#94a3b8' }}>{dns.ns_records?.slice(0, 3).join(', ') || 'None'}</td></tr>
                <tr><td style={{ padding: '6px 0', fontSize: 9, color: '#1e3a5f' }}>TXT</td><td style={{ padding: '6px 0', fontSize: 10, color: '#94a3b8' }}>{dns.txt_records?.slice(0, 2).join(', ') || 'None'}</td></tr>
              </tbody>
            </table>
          </SectionCard>
        </div>

        {/* SSL */}
        {osint?.ssl && (
          <SectionCard title="SSL CERTIFICATE">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                ['Issuer',      osint.ssl.issuer?.CN || osint.ssl.issuer?.organizationName],
                ['Subject',     osint.ssl.subject?.CN || osint.ssl.subject?.commonName],
                ['Valid From',  osint.ssl.validity?.notBefore || osint.ssl.not_before],
                ['Valid Until', osint.ssl.validity?.notAfter  || osint.ssl.not_after],
              ].map(([k, v]) => (
                <div key={k} style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 8, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'monospace' }}>{k}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{v || 'N/A'}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Security Headers */}
        {Object.keys(hdrs).length > 0 && (
          <SectionCard title="HTTP SECURITY HEADERS">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {Object.entries(hdrs).map(([key, val]) => (
                <div key={key} style={{
                  background: '#04091a',
                  border: `1px solid ${val ? '#22c55e15' : '#ef444415'}`,
                  borderLeft: `3px solid ${val ? '#22c55e' : '#ef4444'}`,
                  borderRadius: 4, padding: '8px 12px',
                }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: val ? '#22c55e60' : '#ef444460', letterSpacing: '1px', marginBottom: 3, fontFamily: 'monospace' }}>
                    {val ? 'ENABLED' : 'MISSING'}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{key}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Certificate Transparency */}
        {osint?.certificate_transparency?.length > 0 && (
          <SectionCard title="CERTIFICATE TRANSPARENCY — crt.sh">
            <ReportTable
              cols={['COMMON NAME', 'NOT BEFORE', 'NOT AFTER']}
              rows={osint.certificate_transparency.slice(0, 8).map((e, i) => (
                <tr key={i}>
                  <TD accent="#38bdf8" mono>{e.common_name}</TD>
                  <TD small>{e.not_before}</TD>
                  <TD small>{e.not_after}</TD>
                </tr>
              ))}
            />
          </SectionCard>
        )}
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PDF EXPORT — unchanged logic, cleaner code
// ════════════════════════════════════════════════════════════
export const exportToPDF = async (scanResult, fingerprintedServices, vulns, ports, subdomains, osint) => {
  try {
    const el = document.createElement('div');
    el.style.cssText = 'width:1200px;padding:50px;background:#060d1c;color:#e2e8f0;font-family:"JetBrains Mono",monospace;position:absolute;left:-9999px;';
    document.body.appendChild(el);

    const crit = vulns.filter(v => v.severity === 'CRITICAL').length;
    const high = vulns.filter(v => v.severity === 'HIGH').length;
    const med  = vulns.filter(v => v.severity === 'MEDIUM').length;
    const low  = vulns.filter(v => v.severity === 'LOW').length;
    const openPorts = ports.filter(p => p.state === 'open').length;

    const SC = s => ({ CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#3b82f6' }[s] || '#475569');
    const SB = s => ({ CRITICAL: '#ef444418', HIGH: '#f9731618', MEDIUM: '#f59e0b18', LOW: '#3b82f618' }[s] || '#111');

    el.innerHTML = `
    <style>
      *{box-sizing:border-box}
      .hdr{background:#04091a;border:1px solid #1e3a5f;border-radius:10px;padding:36px;margin-bottom:36px}
      .ttl{font-size:28px;font-weight:800;letter-spacing:4px;color:#e2e8f0;margin:0 0 20px}
      .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px}
      .mc{background:#000;border:1px solid #0f2040;border-radius:6px;padding:14px 18px}
      .ml{font-size:8px;letter-spacing:2px;color:#1e3a5f;margin-bottom:6px}
      .mv{font-size:13px;color:#38bdf8;font-weight:700}
      .sec{margin-bottom:40px}
      .sh{display:flex;align-items:center;gap:14px;padding:0 0 12px;margin-bottom:18px;border-bottom:1px solid #0f2040}
      .sn{font-size:10px;font-weight:800;color:#22c55e;letter-spacing:2px}
      .st{font-size:13px;font-weight:800;color:#e2e8f0;letter-spacing:3px}
      .stats{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
      .sc{background:#04091a;border:1px solid #0f2040;border-radius:6px;padding:16px 12px;text-align:center}
      .scl{font-size:7px;letter-spacing:2px;color:#1e3a5f;margin-bottom:8px}
      .scv{font-size:28px;font-weight:800}
      .tbl{width:100%;border-collapse:collapse;border:1px solid #0f2040;border-radius:6px;overflow:hidden}
      .tbl th{background:#04091a;padding:10px 14px;text-align:left;font-size:8px;letter-spacing:1.5px;color:#1e3a5f;border-bottom:1px solid #0f2040}
      .tbl td{padding:10px 14px;border-bottom:1px solid #04091a;font-size:11px;color:#475569}
      .bx{display:inline-block;padding:2px 8px;border-radius:3px;font-size:8px;font-weight:700;letter-spacing:1px}
      .svc{background:#04091a;border:1px solid #0f2040;border-radius:6px;margin-bottom:12px;overflow:hidden}
      .svch{background:#030810;padding:12px 18px;border-bottom:1px solid #0f2040;font-size:11px;font-weight:700;color:#38bdf8}
      .svcd{padding:16px 18px}
      .cve{background:#030810;border:1px solid #0f2040;border-radius:4px;padding:10px 14px;margin-bottom:8px}
      .card{background:#04091a;border:1px solid #0f2040;border-radius:6px;margin-bottom:12px;overflow:hidden}
      .cardh{background:#030810;padding:10px 18px;border-bottom:1px solid #0f2040;font-size:8px;letter-spacing:2px;color:#1e3a5f}
      .cardb{padding:16px 18px}
      .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .hdrgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}
    </style>

    <div class="hdr">
      <div style="font-size:9px;letter-spacing:3px;color:#1e3a5f;margin-bottom:10px">⚡ WHITENX — SECURITY ASSESSMENT PLATFORM</div>
      <div class="ttl">COMPLETE VULNERABILITY REPORT</div>
      <div class="meta">
        <div class="mc"><div class="ml">TARGET</div><div class="mv">${scanResult?.target || 'N/A'}</div></div>
        <div class="mc"><div class="ml">SCAN ID</div><div class="mv" style="font-size:11px">${scanResult?.scan_id || 'N/A'}</div></div>
        <div class="mc"><div class="ml">GENERATED</div><div class="mv" style="font-size:12px">${new Date().toLocaleString()}</div></div>
      </div>
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">01</span><span class="st">OVERVIEW</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      <div class="stats">
        <div class="sc"><div class="scl">TOTAL</div><div class="scv" style="color:#ef4444">${vulns.length}</div></div>
        <div class="sc"><div class="scl">CRITICAL</div><div class="scv" style="color:#ef4444">${crit}</div></div>
        <div class="sc"><div class="scl">HIGH</div><div class="scv" style="color:#f97316">${high}</div></div>
        <div class="sc"><div class="scl">MEDIUM</div><div class="scv" style="color:#f59e0b">${med}</div></div>
        <div class="sc"><div class="scl">LOW</div><div class="scv" style="color:#3b82f6">${low}</div></div>
        <div class="sc"><div class="scl">OPEN PORTS</div><div class="scv" style="color:#38bdf8">${openPorts}</div></div>
        <div class="sc"><div class="scl">SUBDOMAINS</div><div class="scv" style="color:#a78bfa">${subdomains.length}</div></div>
      </div>
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">02</span><span class="st">VULNERABILITIES</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      <table class="tbl">
        <thead><tr><th>TYPE</th><th>SEVERITY</th><th>PORT</th><th>RECOMMENDATION</th></tr></thead>
        <tbody>${vulns.map(v=>`<tr>
          <td style="color:#94a3b8">${v.type}</td>
          <td><span class="bx" style="color:${SC(v.severity)};background:${SB(v.severity)}">${v.severity}</span></td>
          <td style="color:#38bdf8">${v.port||'—'}</td>
          <td style="font-size:10px">${(v.recommendation||'Review configuration').substring(0,80)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">03</span><span class="st">SERVICES & CVEs</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      ${fingerprintedServices.map(svc=>`
        <div class="svc">
          <div class="svch">PORT ${svc.port} — ${svc.service_name||svc.service} ${svc.version?`v${svc.version}`:''}</div>
          <div class="svcd">
            <div style="margin-bottom:10px;font-size:10px;color:#475569">Banner: ${svc.banner||'—'}</div>
            <div style="margin-bottom:12px;font-size:10px">Exploit probability: <strong style="color:${svc.exploit_weight>=0.7?'#ef4444':svc.exploit_weight>=0.4?'#f97316':'#22c55e'}">${svc.exploit_weight?(svc.exploit_weight*100).toFixed(0):0}%</strong></div>
            ${svc.cves?.length>0?`<div style="font-size:8px;letter-spacing:1.5px;color:#1e3a5f;margin-bottom:8px">CVEs — ${svc.cves.length}</div>
            ${svc.cves.map(c=>`<div class="cve">
              <span style="color:#38bdf8;font-weight:700;font-size:11px">${c.id}</span>
              <span class="bx" style="margin-left:10px;color:${c.cvss>=7?'#ef4444':c.cvss>=4?'#f97316':'#22c55e'};background:${c.cvss>=7?'#ef444418':c.cvss>=4?'#f9731618':'#22c55e18'}">CVSS ${c.cvss}</span>
              <div style="font-size:10px;color:#374151;margin-top:6px">${c.description}</div>
            </div>`).join('')}`:''}
          </div>
        </div>`).join('')}
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">04</span><span class="st">PORT SCAN</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      <table class="tbl">
        <thead><tr><th>PORT</th><th>SERVICE</th><th>STATE</th><th>EXPOSURE</th><th>ATTACK SURFACE</th></tr></thead>
        <tbody>${ports.map(p=>`<tr>
          <td style="color:#38bdf8;font-weight:700">${p.port}</td>
          <td style="color:#94a3b8">${p.service}</td>
          <td><span class="bx" style="color:${p.state==='open'?'#ef4444':'#22c55e'};background:${p.state==='open'?'#ef444418':'#22c55e18'}">${(p.state||'OPEN').toUpperCase()}</span></td>
          <td><span class="bx" style="color:${p.exposure_level==='HIGH'?'#ef4444':'#f97316'};background:${p.exposure_level==='HIGH'?'#ef444418':'#f9731618'}">${p.exposure_level||'—'}</span></td>
          <td style="font-size:10px">${p.attack_surface||'—'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">05</span><span class="st">SUBDOMAINS</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      <table class="tbl">
        <thead><tr><th>SUBDOMAIN</th><th>STATUS</th><th>IP ADDRESSES</th></tr></thead>
        <tbody>${subdomains.map(s=>`<tr>
          <td style="color:#38bdf8">${s.subdomain||s}</td>
          <td><span class="bx" style="color:${s.alive?'#22c55e':'#ef4444'};background:${s.alive?'#22c55e18':'#ef444418'}">${s.alive?'ALIVE':'DOWN'}</span></td>
          <td style="font-size:10px;color:#475569">${s.dns_ips?.join(', ')||'—'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>

    <div class="sec">
      <div class="sh"><span class="sn">06</span><span class="st">OSINT INTELLIGENCE</span><div style="flex:1;height:1px;background:#0f2040"></div></div>
      <div class="g2" style="margin-bottom:12px">
        <div class="card">
          <div class="cardh">WHOIS</div>
          <div class="cardb">${['registrar','organization','country','creation_date','expiration_date'].map(k=>`
            <div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #0a0a0a">
              <span style="font-size:9px;color:#1e3a5f;min-width:80px;letter-spacing:1px">${k}</span>
              <span style="font-size:10px;color:#94a3b8">${osint?.whois?.[k]||'N/A'}</span>
            </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="cardh">DNS RECORDS</div>
          <div class="cardb">${['A','MX','NS','TXT'].map(t=>`
            <div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #0a0a0a">
              <span style="font-size:9px;color:#1e3a5f;min-width:40px">${t}</span>
              <span style="font-size:10px;color:#94a3b8">${osint?.dns?.[t.toLowerCase()+'_records']?.slice(0,3).join(', ')||'None'}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="cardh">HTTP SECURITY HEADERS</div>
        <div class="cardb" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
          ${Object.entries(osint?.http?.security_headers||{}).map(([k,v])=>`
            <div style="background:#030810;border:1px solid ${v?'#22c55e15':'#ef444415'};border-left:3px solid ${v?'#22c55e':'#ef4444'};border-radius:3px;padding:8px 10px">
              <div style="font-size:7px;color:${v?'#22c55e60':'#ef444460'};letter-spacing:1px;margin-bottom:3px">${v?'ENABLED':'MISSING'}</div>
              <div style="font-size:10px;color:#475569">${k}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    `;

    const canvas = await html2canvas(el, {
      scale: 2.5, backgroundColor: '#060d1c',
      logging: false, allowTaint: true, useCORS: true, windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgW = 210, pageH = 297;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
    pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);

    let left = imgH - pageH, pos = -pageH;
    while (left > 0) {
      pos -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, pos, imgW, imgH);
      left -= pageH;
    }

    pdf.save(`whitenx-${scanResult?.target}-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.removeChild(el);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Check console.');
  }
};