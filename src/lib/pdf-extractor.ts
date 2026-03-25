"use client"

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async function(e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        
        // Check if valid PDF
        const bytes = new Uint8Array(arrayBuffer)
        const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4])
        if (header !== '%PDF-') {
          reject(new Error("Not a valid PDF file"))
          return
        }
        
        // Dynamic import of pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        
        let fullText = ""
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          
          const pageText = textContent.items
            .filter((item: any) => item.str)
            .map((item: any) => item.str)
            .join(' ')
          
          if (pageText.trim()) {
            fullText += pageText + ' '
          }
        }
        
        if (!fullText.trim()) {
          reject(new Error("No text found in PDF - may be scanned image"))
          return
        }
        
        resolve(fullText.trim())
      } catch (err) {
        console.error("PDF parse error:", err)
        reject(new Error("Could not read PDF"))
      }
    }
    
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
