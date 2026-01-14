
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  switch (extension) {
    case 'pdf':
      return await extractTextFromPDF(arrayBuffer);
    case 'docx':
      return await extractTextFromDocx(arrayBuffer);
    case 'txt':
    case 'md':
      return new TextDecoder().decode(arrayBuffer);
    default:
      throw new Error(`Unsupported file type: .${extension}. Please use .pdf, .docx, .txt, or .md`);
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to read PDF file. It might be password protected or corrupted.');
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Docx extraction failed:', error);
    throw new Error('Failed to read Word document.');
  }
}
