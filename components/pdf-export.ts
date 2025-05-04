import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface PDFOptions {
  filename?: string
  page?: {
    margin?: number
    format?: string
    orientation?: "portrait" | "landscape"
  }
  fonts?: {
    [key: string]: string
  }
}

// Update the toPDF function to better preserve styles
export const toPDF = async (element: HTMLElement, options: PDFOptions = {}) => {
  const {
    filename = "resume.pdf",
    page = {
      margin: 10,
      format: "a4",
      orientation: "portrait",
    },
  } = options

  // Create a clone of the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement

  // Create a temporary container to hold our clone for rendering
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "-9999px"
  container.appendChild(clone)
  document.body.appendChild(container)

  // Apply any necessary style adjustments for PDF export
  // This ensures the styles are properly captured in the PDF
  const computedStyle = window.getComputedStyle(element)

  // Apply font styles
  clone.style.fontFamily = computedStyle.fontFamily
  clone.style.fontSize = computedStyle.fontSize
  clone.style.fontWeight = computedStyle.fontWeight
  clone.style.lineHeight = computedStyle.lineHeight
  clone.style.color = computedStyle.color

  // Apply layout styles
  clone.style.padding = computedStyle.padding
  clone.style.margin = "0" // Reset margin for PDF
  clone.style.width = "210mm" // A4 width
  clone.style.backgroundColor = "#ffffff"

  // Ensure all text is visible (not cut off)
  const textElements = clone.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, li")
  textElements.forEach((el) => {
    ;(el as HTMLElement).style.pageBreakInside = "avoid"(el as HTMLElement).style.color =
      (el as HTMLElement).style.color || "#000000"
  })

  // Create a canvas from the element
  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1000, // Fixed width for consistent rendering
      onclone: (document, clonedElement) => {
        // Additional style adjustments can be made here if needed
        const allElements = clonedElement.querySelectorAll("*")
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            // Ensure text color is preserved
            if (window.getComputedStyle(el).color === "rgba(0, 0, 0, 0)") {
              el.style.color = "#000000"
            }

            // Ensure backgrounds are preserved
            if (el.classList.contains("bg-gray-100")) {
              el.style.backgroundColor = "#f3f4f6"
            } else if (el.classList.contains("bg-green-100")) {
              el.style.backgroundColor = "#d1fae5"
            } else if (el.classList.contains("bg-red-100")) {
              el.style.backgroundColor = "#fee2e2"
            }
          }
        })
      },
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
    let pageCount = 1

    // Add first page
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth - margin * 2, imgHeight - margin * 2)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", margin, position, imgWidth - margin * 2, imgHeight - margin * 2)
      heightLeft -= pageHeight
      pageCount++
    }

    // Save the PDF
    pdf.save(filename)

    // Clean up
    document.body.removeChild(container)

    return pdf
  } catch (error) {
    console.error("Error generating PDF:", error)
    // Clean up on error
    document.body.removeChild(container)
    throw error
  }
}
