/**
 * extractFileText.ts
 * Converts uploaded file buffers to clean plain text for ATS parsing.
 * Supports: PDF, DOCX, TXT, MD, DOC (plain text fallback)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfModule = require("pdf-parse");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth");

export interface ExtractResult {
  text: string;
  method: string;
  charCount: number;
}

/**
 * Strips non-printable garbage from a raw binary->text conversion.
 * Used as a last-resort fallback when proper parsers fail.
 */
function cleanBinaryFallback(raw: string): string {
  return raw
    .replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, " ") // keep printable + unicode
    .replace(/[ \t]{3,}/g, "  ")                         // collapse wide whitespace
    .replace(/\n{4,}/g, "\n\n")                          // collapse blank lines
    .trim();
}

/**
 * Safely extracts plain text from a PDF buffer across multiple pdf-parse versions / exports.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  // 1. pdf-parse v2+ (exports { PDFParse: class ... })
  if (pdfModule && typeof pdfModule.PDFParse === "function") {
    try {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = result?.text?.trim() || "";
      if (typeof parser.destroy === "function") {
        await parser.destroy().catch(() => {});
      }
      if (text.length > 20) return text;
    } catch (err) {
      console.warn("[extractPdfText] pdfModule.PDFParse error:", err);
    }
  }

  // 2. pdf-parse v1 (exports function (buffer) => Promise<{ text: string }>)
  if (typeof pdfModule === "function") {
    try {
      const data = await pdfModule(buffer);
      const text = data?.text?.trim() || "";
      if (text.length > 20) return text;
    } catch (err) {
      console.warn("[extractPdfText] direct pdfModule call error:", err);
    }
  }

  // 3. Default export wrapping
  if (pdfModule?.default) {
    if (typeof pdfModule.default.PDFParse === "function") {
      try {
        const parser = new pdfModule.default.PDFParse({ data: buffer });
        const result = await parser.getText();
        const text = result?.text?.trim() || "";
        if (typeof parser.destroy === "function") {
          await parser.destroy().catch(() => {});
        }
        if (text.length > 20) return text;
      } catch (err) {
        console.warn("[extractPdfText] pdfModule.default.PDFParse error:", err);
      }
    }
    if (typeof pdfModule.default === "function") {
      try {
        const data = await pdfModule.default(buffer);
        const text = data?.text?.trim() || "";
        if (text.length > 20) return text;
      } catch (err) {
        console.warn("[extractPdfText] pdfModule.default call error:", err);
      }
    }
  }

  return "";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractResult> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  /* ── PDF ─────────────────────────────────────────────────── */
  if (mimeType === "application/pdf" || ext === "pdf") {
    try {
      const text = await extractPdfText(buffer);
      if (text.length > 30) {
        return { text, method: "pdf-parse", charCount: text.length };
      }
    } catch (err) {
      console.warn("[extractFileText] PDF extraction failed, falling back:", err);
    }
  }

  /* ── DOCX ─────────────────────────────────────────────────── */
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim() || "";
      if (text.length > 30) {
        return { text, method: "mammoth-docx", charCount: text.length };
      }
    } catch (err) {
      console.warn("[extractFileText] mammoth failed, falling back:", err);
    }
  }

  /* ── Plain text / Markdown ───────────────────────────────── */
  if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    ext === "txt" ||
    ext === "md"
  ) {
    const text = buffer.toString("utf-8").trim();
    return { text, method: "plaintext", charCount: text.length };
  }

  /* ── DOC (legacy Word — no native parser, binary fallback) ── */
  if (mimeType === "application/msword" || ext === "doc") {
    const raw = buffer.toString("latin1"); // latin1 preserves byte values
    const cleaned = cleanBinaryFallback(raw);
    if (cleaned.length > 80) {
      return { text: cleaned, method: "doc-binary-fallback", charCount: cleaned.length };
    }
  }

  /* ── Generic binary fallback (try UTF-8 then latin1) ──────── */
  let raw: string;
  try {
    raw = buffer.toString("utf-8");
  } catch {
    raw = buffer.toString("latin1");
  }
  const cleaned = cleanBinaryFallback(raw);
  return {
    text: cleaned.length > 80 ? cleaned : `[File: ${fileName} — could not extract text]`,
    method: "binary-fallback",
    charCount: cleaned.length,
  };
}
