import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Use free OCR API
    const ocrFormData = new FormData();
    ocrFormData.append('filetype', 'PDF');
    ocrFormData.append('isOverlayRequired', 'false');
    ocrFormData.append('apikey', 'K87899142372222');
    
    const fileBlob = new Blob([uint8Array], { type: 'application/pdf' });
    ocrFormData.append('filename', file.name);
    ocrFormData.append('file', fileBlob);

    const ocrResponse = await fetch('https://api.ocr.space/parse', {
      method: 'POST',
      body: ocrFormData,
    });

    if (!ocrResponse.ok) {
      throw new Error('OCR service error');
    }

    const ocrData = await ocrResponse.json();

    if (ocrData.isErroredOnProcessing) {
      throw new Error(ocrData.errorMessage);
    }

    const extractedText = ocrData.parsedText || '';

    return NextResponse.json({
      text: extractedText || '[No text found]',
      success: true
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      text: 'Could not extract PDF text'
    }, { status: 400 });
  }
}