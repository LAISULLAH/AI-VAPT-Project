import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.platypus.flowables import KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from typing import Dict, List, Any


class DarkThemePDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()

        # Dark theme colors
        self.bg_color = colors.Color(0.1, 0.1, 0.1)  # Dark charcoal
        self.card_bg = colors.Color(0.15, 0.15, 0.15)  # Slightly lighter charcoal
        self.text_color = colors.white
        self.accent_color = colors.Color(0.3, 0.6, 1.0)  # Blue accent
        self.warning_color = colors.Color(1.0, 0.8, 0.0)  # Orange warning
        self.danger_color = colors.Color(1.0, 0.4, 0.4)  # Red danger
        self.success_color = colors.Color(0.4, 0.8, 0.4)  # Green success

        # Custom styles
        self.title_style = ParagraphStyle(
            'Title',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.accent_color,
            alignment=TA_CENTER,
            spaceAfter=30,
        )

        self.section_title_style = ParagraphStyle(
            'SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=self.text_color,
            spaceAfter=15,
            borderWidth=0,
            borderPadding=10,
            backgroundColor=self.card_bg,
            borderColor=self.accent_color,
            borderRadius=5,
        )

        self.normal_style = ParagraphStyle(
            'Normal',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.text_color,
            spaceAfter=10,
        )

        self.tip_style = ParagraphStyle(
            'Tip',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.Color(0.8, 0.8, 0.8),
            backgroundColor=colors.Color(0.2, 0.2, 0.2),
            borderWidth=1,
            borderColor=colors.Color(0.4, 0.4, 0.4),
            borderPadding=8,
            borderRadius=3,
            spaceAfter=15,
        )

        self.table_header_style = ParagraphStyle(
            'TableHeader',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.text_color,
            backgroundColor=self.accent_color,
            alignment=TA_CENTER,
        )

    def create_card_table(self, title: str, data: List[List[str]], col_widths=None) -> Table:
        """Create a card-style table with dark theme"""
        if not data:
            return Paragraph("No data available", self.normal_style)

        # Add header row
        table_data = [[Paragraph(cell, self.table_header_style) for cell in data[0]]]

        # Add data rows
        for row in data[1:]:
            table_data.append([Paragraph(str(cell), self.normal_style) for cell in row])

        table = Table(table_data, colWidths=col_widths)

        # Dark theme table styling
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.accent_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), self.card_bg),
            ('TEXTCOLOR', (0, 1), (-1, -1), self.text_color),
            ('GRID', (0, 0), (-1, -1), 1, colors.Color(0.3, 0.3, 0.3)),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.card_bg, colors.Color(0.18, 0.18, 0.18)]),
        ]))

        return table

    def create_tip_box(self, text: str) -> Paragraph:
        """Create a tip/info box"""
        return Paragraph(f"💡 {text}", self.tip_style)

    def generate_report(self, scan_data: Dict[str, Any]) -> bytes:
        """Generate the complete PDF report"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        story = []

        # Title Page
        story.extend(self._create_title_page(scan_data))
        story.append(PageBreak())

        # Target Information
        story.extend(self._create_target_section(scan_data))

        # Summary
        story.extend(self._create_summary_section(scan_data))

        # WHOIS Information
        story.extend(self._create_whois_section(scan_data))

        # DNS Records
        story.extend(self._create_dns_section(scan_data))

        # Ports/Services
        story.extend(self._create_ports_section(scan_data))

        # HTTP Security Headers
        story.extend(self._create_headers_section(scan_data))

        # Vulnerabilities
        story.extend(self._create_vulnerabilities_section(scan_data))

        # Build PDF
        doc.build(story, onFirstPage=self._page_template, onLaterPages=self._page_template)

        buffer.seek(0)
        return buffer.getvalue()

    def _create_title_page(self, scan_data: Dict) -> List:
        """Create the title page"""
        elements = []

        elements.append(Paragraph("Security Assessment Report", self.title_style))
        elements.append(Spacer(1, 50))

        # Subtitle
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.Color(0.7, 0.7, 0.7),
            alignment=TA_CENTER,
        )
        elements.append(Paragraph("Vulnerability Assessment & Penetration Testing", subtitle_style))
        elements.append(Spacer(1, 30))

        # Report details
        details = [
            f"Target: {scan_data.get('target', 'N/A')}",
            f"Scan ID: {scan_data.get('scan_id', 'N/A')}",
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        ]

        for detail in details:
            elements.append(Paragraph(detail, self.normal_style))
            elements.append(Spacer(1, 10))

        return elements

    def _create_target_section(self, scan_data: Dict) -> List:
        """Create target information section"""
        elements = []

        elements.append(Paragraph("Target Information", self.section_title_style))
        elements.append(Spacer(1, 10))

        target_data = [
            ["Field", "Value"],
            ["Domain", scan_data.get('target', 'N/A')],
            ["Scan ID", scan_data.get('scan_id', 'N/A')],
            ["Scan Date", datetime.now().strftime('%Y-%m-%d')],
        ]

        elements.append(self.create_card_table("Target Details", target_data))
        elements.append(Spacer(1, 15))

        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_summary_section(self, scan_data: Dict) -> List:
        """Create vulnerability summary section"""
        elements = []

        elements.append(Paragraph("Executive Summary", self.section_title_style))
        elements.append(Spacer(1, 10))

        # Get vulnerability counts
        vulns = scan_data.get('vulnerabilities', [])
        high_count = sum(1 for v in vulns if v.get('severity', '').upper() in ['HIGH', 'CRITICAL'])
        medium_count = sum(1 for v in vulns if v.get('severity', '').upper() == 'MEDIUM')
        low_count = sum(1 for v in vulns if v.get('severity', '').upper() == 'LOW')

        # Get additional stats from enhanced data
        subdomain_info = scan_data.get('subdomain_enum', {})
        port_scan_info = scan_data.get('port_scan', {})
        services_count = len(scan_data.get('services', []))
        osint_score = scan_data.get('osint', {}).get('osint_score', 0)

        summary_data = [
            ["Metric", "Value"],
            ["High/Critical Vulnerabilities", str(high_count)],
            ["Medium Vulnerabilities", str(medium_count)],
            ["Low Vulnerabilities", str(low_count)],
            ["Open Ports Found", str(len(port_scan_info.get('open_ports', [])))],
            ["Services Identified", str(services_count)],
            ["Subdomains Enumerated", str(subdomain_info.get('found', 0))],
            ["OSINT Trust Score", f"{osint_score}/100"],
        ]

        elements.append(self.create_card_table("Comprehensive Summary", summary_data))
        elements.append(Spacer(1, 15))

        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_whois_section(self, scan_data: Dict) -> List:
        """Create WHOIS information section"""
        elements = []

        elements.append(Paragraph("WHOIS Information", self.section_title_style))
        elements.append(Spacer(1, 10))

        osint = scan_data.get('osint', {})
        whois = osint.get('whois', {})

        if whois:
            whois_data = [
                ["Field", "Value"],
                ["Domain", whois.get('domain_name', 'N/A')],
                ["Registrar", whois.get('registrar', 'N/A')],
                ["Organization", whois.get('organization', 'N/A')],
                ["Country", whois.get('country', 'N/A')],
                ["Creation Date", str(whois.get('creation_date', 'N/A'))],
                ["Expiration Date", str(whois.get('expiration_date', 'N/A'))],
            ]

            elements.append(self.create_card_table("WHOIS Details", whois_data))
        else:
            elements.append(Paragraph("No WHOIS data available", self.normal_style))

        elements.append(Spacer(1, 15))
        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_dns_section(self, scan_data: Dict) -> List:
        """Create DNS records section"""
        elements = []

        elements.append(Paragraph("DNS Records", self.section_title_style))
        elements.append(Spacer(1, 10))

        osint = scan_data.get('osint', {})
        dns = osint.get('dns', {})

        if dns and isinstance(dns, dict):
            dns_data = [["Record Type", "Value"]]

            # Show more DNS records
            for record_type, values in dns.items():
                if isinstance(values, list) and values:
                    for value in values[:5]:  # Show up to 5 records per type
                        dns_data.append([record_type.upper(), str(value)])
                elif values:
                    dns_data.append([record_type.upper(), str(values)])

            if len(dns_data) > 1:
                elements.append(self.create_card_table("DNS Records", dns_data))
            else:
                elements.append(Paragraph("No DNS records found", self.normal_style))
        else:
            elements.append(Paragraph("No DNS data available", self.normal_style))

        elements.append(Spacer(1, 15))
        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_ports_section(self, scan_data: Dict) -> List:
        """Create ports and services section"""
        elements = []

        elements.append(Paragraph("Ports & Services", self.section_title_style))
        elements.append(Spacer(1, 10))

        port_scan = scan_data.get('port_scan', {})
        services = scan_data.get('services', [])

        if isinstance(port_scan, dict) and 'open_ports' in port_scan:
            # Enhanced port scan data
            total_scanned = port_scan.get('total_ports_scanned', 0)
            scan_duration = port_scan.get('scan_duration', 0)
            open_ports = port_scan.get('open_ports', [])

            elements.append(Paragraph(f"Port Scan Results: {len(open_ports)} open ports found out of {total_scanned} scanned (Duration: {scan_duration:.1f}s)", self.normal_style))
            elements.append(Spacer(1, 10))

            if open_ports:
                ports_data = [["Port", "Service", "State", "Version"]]

                for port_info in open_ports[:15]:  # Show top 15 ports
                    ports_data.append([
                        str(port_info.get('port', 'N/A')),
                        port_info.get('service', 'unknown'),
                        port_info.get('state', 'unknown'),
                        port_info.get('version', 'N/A')
                    ])

                elements.append(self.create_card_table("Open Ports", ports_data))
        elif services:
            # Fallback to services array
            ports_data = [["Port", "Service", "State"]]

            for service in services[:15]:  # Show top 15 services
                ports_data.append([
                    str(service.get('port', 'N/A')),
                    service.get('service_name', service.get('service', 'unknown')),
                    service.get('state', 'unknown')
                ])

            elements.append(self.create_card_table("Services", ports_data))
        else:
            elements.append(Paragraph("No port scan data available", self.normal_style))

        elements.append(Spacer(1, 15))
        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_headers_section(self, scan_data: Dict) -> List:
        """Create HTTP security headers section"""
        elements = []

        elements.append(Paragraph("HTTP Security Headers", self.section_title_style))
        elements.append(Spacer(1, 10))

        # This would come from web_analysis in the scan data
        web_analysis = scan_data.get('web_analysis', {})
        security_headers = web_analysis.get('security_headers', {})

        if security_headers:
            headers_data = [["Header", "Status"]]

            important_headers = ['strict-transport-security', 'content-security-policy',
                               'x-frame-options', 'x-content-type-options']

            for header in important_headers:
                status = "Present" if header in security_headers else "Missing"
                headers_data.append([header.upper(), status])

            elements.append(self.create_card_table("Security Headers", headers_data))
        else:
            elements.append(Paragraph("No HTTP security header data available", self.normal_style))

        elements.append(Spacer(1, 15))
        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _create_vulnerabilities_section(self, scan_data: Dict) -> List:
        """Create vulnerabilities section"""
        elements = []

        elements.append(Paragraph("Key Vulnerabilities", self.section_title_style))
        elements.append(Spacer(1, 10))

        vulns = scan_data.get('vulnerabilities', [])

        # Filter to high and medium severity only
        important_vulns = [v for v in vulns if v.get('severity', '').upper() in ['HIGH', 'CRITICAL', 'MEDIUM']][:10]

        if important_vulns:
            vuln_data = [["Severity", "Type", "Port"]]

            for vuln in important_vulns:
                severity = vuln.get('severity', 'Unknown')
                vuln_type = vuln.get('type', 'Unknown')
                port = str(vuln.get('port', 'N/A'))

                # Color code severity
                color = self.danger_color if severity.upper() in ['HIGH', 'CRITICAL'] else self.warning_color
                severity_text = f'<font color="{color}">{severity.upper()}</font>'

                vuln_data.append([severity_text, vuln_type, port])

            elements.append(self.create_card_table("Key Findings", vuln_data))
        else:
            elements.append(Paragraph("No significant vulnerabilities found", self.normal_style))

        elements.append(Spacer(1, 15))
        elements.append(self.create_tip_box("Detailed scan data is available in the JSON tab of the platform."))

        return [KeepTogether(elements)]

    def _page_template(self, canvas, doc):
        """Page template with dark background"""
        canvas.saveState()

        # Set dark background
        canvas.setFillColor(self.bg_color)
        canvas.rect(0, 0, A4[0], A4[1], fill=1)

        # Footer
        canvas.setFillColor(colors.Color(0.5, 0.5, 0.5))
        canvas.setFont("Helvetica", 8)
        footer_text = f"Generated by AI VAPT Platform - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        canvas.drawString(72, 50, footer_text)

        # Page number
        page_num = canvas.getPageNumber()
        canvas.drawRightString(A4[0] - 72, 50, f"Page {page_num}")

        canvas.restoreState()


def generate_pdf_report(scan_data: Dict[str, Any]) -> bytes:
    """Convenience function to generate PDF report"""
    generator = DarkThemePDFGenerator()
    return generator.generate_report(scan_data)