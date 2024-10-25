import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default class Pdf {
  /**
   * Function to create a PDF in landscape with dynamic width based on the length of the text.
   * @param {string} text - The text to include in the PDF
   * @returns {Promise<Uint8Array>} - The PDF document bytes
   */
  static async createPdf(text: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    // Embed the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Calculate the width of the text
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const pageHeight = 100; // Height for A4 in landscape 595
    const margin = 50;

    // Calculate the required page width based on the text length
    const pageWidth = textWidth + margin * 2;

    // Add a landscape page with dynamic width
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw the text on the page
    page.drawText(text, {
      x: margin,
      y: pageHeight - margin - fontSize, // Start from the top of the page
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    console.log("PDF created successfully with dynamic width");
    return pdfBytes;
  }

  /**
   * Triggers the download of a PDF in the browser.
   * @param {Uint8Array} pdfBytes - The bytes of the PDF document
   * @param {string} fileName - The name of the file to download
   */
  static downloadPdf(pdfBytes: Uint8Array, fileName: string) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
