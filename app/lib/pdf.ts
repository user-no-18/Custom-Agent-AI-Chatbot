// lib/pdf.ts
export async function uploadPDFForOCR(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/extract-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`PDF upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}
