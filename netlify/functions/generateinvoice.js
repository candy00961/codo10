// netlify/functions/generateinvoice.js
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib'); // Ensure 'pdf-lib' is in dependencies

// This helper function seems okay, but needs to be called correctly
const generateInvoicePDF = async (billingData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]); // Example size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // *** FIX: Added quotes and potentially better formatting ***
  const textContent = `Invoice\nTotal kWh: ${billingData?.totalKwh || 'N/A'}\nCost: $${billingData?.cost?.toFixed(2) || 'N/A'}`;

  page.drawText(textContent, {
    x: 50,
    y: height - 4 * 50, // Position text lower
    size: 30,
    font: font,
    color: rgb(0, 0.53, 0.71),
    lineHeight: 35, // Adjust line height
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

exports.handler = async (event) => {
  // *** FIX: Get billingData from the request body (assuming POST) ***
  let billingData;
  try {
    if (!event.body) {
        throw new Error("Request body is missing.");
    }
    // Assuming the body is JSON like: { "reads": [...], "cdr": { "rate": 0.15 } }
    // Or perhaps you pass the calculated data directly?
    // Let's assume calculated data is passed: { "totalKwh": 100, "cost": 15 }
    billingData = JSON.parse(event.body);
    if (!billingData || typeof billingData.totalKwh === 'undefined' || typeof billingData.cost === 'undefined') {
        throw new Error("Invalid billing data received in request body.");
    }
  } catch (error) {
    console.error("[generateinvoice] Error parsing request body:", error);
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid request body: ${error.message}` }) };
  }

  try {
    // Call the PDF generation function with the parsed data
    const invoiceBytes = await generateInvoicePDF(billingData);

    return {
      statusCode: 200,
      headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="invoice.pdf"' // Suggest download
       },
      body: Buffer.from(invoiceBytes).toString("base64"), // Use Buffer.from()
      isBase64Encoded: true,
    };
  } catch(error) {
      console.error("[generateinvoice] Error generating PDF:", error);
      return { statusCode: 500, body: JSON.stringify({ error: `Failed to generate invoice: ${error.message}` }) };
  }
};
