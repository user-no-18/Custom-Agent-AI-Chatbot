import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();

  const ocrForm = new FormData();
  ocrForm.append('apikey', process.env.OCR_API_KEY!);
  ocrForm.append('file', new Blob([buffer]), file.name);
  ocrForm.append('language', 'eng');

  const ocrRes = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: ocrForm,
  });

  const data = await ocrRes.json();

  const text =
    data?.ParsedResults?.[0]?.ParsedText || 'No text found';

  return NextResponse.json({ text });
}
