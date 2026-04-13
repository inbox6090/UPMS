// qr.js
// Handles the dynamic generation of certificate serials and basic printing layouts

/**
 * Generate 6-digit dynamic serial (DDMMSS)
 */
function generateCertificateSerial() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${ss}`;
}

/**
 * Mock Print function demonstrating the A4, red-green border and logo overlay requirement
 * In production this would open a new window or write HTML to an iframe for window.print()
 */
function generatePrintTemplate(citizen, certificateType, banglaBodyText, serial) {
    const printHTML = `
    <html>
        <head>
            <title>Print Certificate - ${serial}</title>
            <style>
                @page { size: A4; margin: 0; }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: white;
                }
                .a4-container {
                    width: 210mm;
                    height: 297mm;
                    padding: 20mm;
                    box-sizing: border-box;
                    margin: auto;
                    position: relative;
                }
                .border-red {
                    position: absolute;
                    top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
                    border: 4px solid #bc2025; /* Bangladesh Red */
                    pointer-events: none;
                }
                .border-green {
                    position: absolute;
                    top: 12mm; left: 12mm; right: 12mm; bottom: 12mm;
                    border: 4px solid #006a4e; /* Bangladesh Green */
                    pointer-events: none;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.1;
                    width: 300px;
                    z-index: 0;
                }
                .content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                }
                .header-text { margin-top: 20px; color: #006a4e; font-size: 24px; font-weight: bold; }
                .body-text { text-align: left; margin-top: 40px; font-size: 16px; line-height: 1.6; }
                .qr-container { margin-top: 40px; }
            </style>
        </head>
        <body>
            <div class="a4-container">
                <div class="border-red"></div>
                <div class="border-green"></div>
                <img src="./assets/1000182319.png" class="watermark" />
                
                <div class="content">
                    <img src="./assets/1000182319.png" width="80" />
                    <div class="header-text">02 No. Baheratail Union Parishad</div>
                    <div style="margin-top: 10px; font-weight: bold;">Serial Number: ${serial}</div>
                    
                    <h2 style="margin-top: 40px; text-decoration: underline;">${certificateType}</h2>
                    
                    <div class="body-text">
                        ${banglaBodyText}
                    </div>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function(){ window.close(); }, 500);
                }
            </script>
        </body>
    </html>
    `;

    const printWin = window.open('', '', 'width=800,height=900');
    if (printWin) {
        printWin.document.write(printHTML);
        printWin.document.close();
    }
}
