import { PDFDocument, rgb } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import logger from "@logger";
import * as forge from "node-forge";
import * as crypto from "crypto";
import Cryptography from "@utils/cryptography";
import { exec } from "child_process";
import util from "util";

export default class Pdf {
  /**
   * Function to create a PDF with given text and save it to a specified folder
   * @param {string} text - The text to include in the PDF
   * @param {string} savePath - The folder path where the PDF should be saved
   */
  static async createAndSavePdf(text: string, savePath: string, fileName: string): Promise<void> {
    try {
      const pdfBytes = await this.createPdf(text);
      this.savePdf(pdfBytes, savePath, fileName);
    } catch (error) {
      logger.error("Error creating and saving PDF:", error);
    }
  }

  /**
   * Function to create a PDF with given text and return the PDF as bytes.
   * @param {string} text - The text to include in the PDF
   * @returns {Promise<Uint8Array>} - The PDF document bytes
   */
  static async createPdf(text: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 dimensions in points

    // Set the font size and add the text to the page
    page.drawText(text, {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0, 0, 0), // Black text color
    });

    const pdfBytes = await pdfDoc.save();
    logger.info(`PDF created successfully`);
    return pdfBytes;
  }

  /**
   * Save PDF to disk.
   * @param {Uint8Array} pdfBytes - PDF bytes
   * @param {string} savePath - The folder path where the PDF should be saved
   * @param {string} fileName - The name of the PDF file
   */
  static savePdf(pdfBytes: Uint8Array, savePath: string, fileName: string) {
    const fullPath = path.join(savePath, fileName);
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    fs.writeFileSync(fullPath, pdfBytes);
    logger.info(`PDF saved successfully at ${fullPath}`);
  }
}
