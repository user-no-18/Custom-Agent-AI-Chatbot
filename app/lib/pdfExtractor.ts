export async function extractPDFText(file: File): Promise<string> {
  try {
    console.log('📖 Extracting PDF:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(` Extracted ${data.text.length} characters`);
    return data.text;
  } catch (error: any) {
    console.error('PDF error:', error);
    return `[PDF: ${file.name}] - Could not extract text`;
  }
}