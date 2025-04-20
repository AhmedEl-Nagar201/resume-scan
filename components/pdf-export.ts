import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface PDFOptions {
  filename?: string
  page?: {
    margin?: number
    format?: string
    orientation?: "portrait" | "landscape"
  }
}

export const toPDF = async (element: HTMLElement, options: PDFOptions = {}) => {
  const {
    filename = "resume.pdf",
    page = {
      margin: 10,
      format: "a4",
      orientation: "portrait",
    },
  } = options

  // Create a canvas from the element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  })

  const imgData = canvas.toDataURL("image/png")

  // Calculate dimensions
  const imgWidth = 210 // A4 width in mm (210mm × 297mm)
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const margin = page.margin || 10

  // Create PDF
  const pdf = new jsPDF({
    orientation: page.orientation || "portrait",
    unit: "mm",
    format: page.format || "a4",
  })

  // Add image to PDF
  let heightLeft = imgHeight
  let position = 0

  // Add first page
  pdf.addImage(imgData, "PNG", margin, margin, imgWidth - margin * 2, imgHeight - margin * 2)
  heightLeft -= pageHeight

  // Add additional pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", margin, position, imgWidth - margin * 2, imgHeight - margin * 2)
    heightLeft -= pageHeight
  }

  // Save the PDF
  pdf.save(filename)

  return pdf
}
