import html2pdf from 'html2pdf.js';

/**
 * Step 4: Exact UI -> PDF Generation
 */
export const generateVaptReport = (data) => {
  const element = document.getElementById('report-content');
  const opt = {
    margin: [0.5, 0.5],
    filename: `WHITENX_REPORT_${data?.target || 'SCAN'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      backgroundColor: '#000000',
      useCORS: true 
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};