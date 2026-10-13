"use client";

export type PdfPage = { number: number; text: string };

/** Past this many characters there is nothing more to read; drafts are capped. */
const READ_LIMIT = 12_000;

export async function readPdf(data: ArrayBuffer): Promise<PdfPage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    standardFontDataUrl: "/standard_fonts/",
  });
  const doc = await task.promise.catch((error: unknown) => {
    void task.destroy();
    throw error;
  });
  const pages: PdfPage[] = [];
  let chars = 0;
  try {
    for (let number = 1; number <= doc.numPages && chars < READ_LIMIT; number += 1) {
      const page = await doc.getPage(number);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push({ number, text });
      chars += text.length;
    }
  } finally {
    void task.destroy();
  }
  return pages;
}

export function pdfFailure(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") return "This PDF is password protected.";
  if (name === "InvalidPDFException") return "That file isn’t a readable PDF.";
  return "Humanora couldn’t read that PDF.";
}
