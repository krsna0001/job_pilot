export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    if (text.trim()) {
      pageTexts.push(text);
    }
    page.cleanup();
  }

  doc.destroy();
  return pageTexts.join("\n");
}
