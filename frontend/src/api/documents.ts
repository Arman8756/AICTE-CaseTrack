export interface UploadedDocument {
  id: string;
  complaint_id: string;
  original_filename: string;
  stored_filename: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  // blob URL — only exists in mock/browser session
  preview_url?: string;
}

// ── In-memory store ───────────────────────────────────────────────────────────
const store: Record<string, UploadedDocument[]> = {
  // Pre-seeded documents for demo complaints
  c1: [
    {
      id: "d1",
      complaint_id: "c1",
      original_filename: "Fee_Structure_2026.pdf",
      stored_filename: "c1_fee_structure_2026.pdf",
      file_size_bytes: 245760,
      mime_type: "application/pdf",
      uploaded_by: "Rajesh Kumar Sharma",
      uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "d2",
      complaint_id: "c1",
      original_filename: "Student_Complaint_Letter.pdf",
      stored_filename: "c1_complaint_letter.pdf",
      file_size_bytes: 102400,
      mime_type: "application/pdf",
      uploaded_by: "Rajesh Kumar Sharma",
      uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  c3: [
    {
      id: "d3",
      complaint_id: "c3",
      original_filename: "Faculty_List_Deficiency.xlsx",
      stored_filename: "c3_faculty_list.xlsx",
      file_size_bytes: 51200,
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploaded_by: "Sunita Devi Patel",
      uploaded_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ],
  c12: [
    {
      id: "d4",
      complaint_id: "c12",
      original_filename: "AntiRagging_Notice.pdf",
      stored_filename: "c12_antiragging_notice.pdf",
      file_size_bytes: 88064,
      mime_type: "application/pdf",
      uploaded_by: "Anita Krishnamurthy",
      uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "d5",
      complaint_id: "c12",
      original_filename: "Incident_Report.docx",
      stored_filename: "c12_incident_report.docx",
      file_size_bytes: 38912,
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploaded_by: "Anita Krishnamurthy",
      uploaded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
};

// ── API functions ─────────────────────────────────────────────────────────────

export function getDocuments(complaint_id: string): UploadedDocument[] {
  return store[complaint_id] ?? [];
}

export function uploadDocument(
  complaint_id: string,
  file: File,
  uploader: string
): UploadedDocument {
  const doc: UploadedDocument = {
    id: `d${Date.now()}`,
    complaint_id,
    original_filename: file.name,
    stored_filename: `${complaint_id}_${file.name}`,
    file_size_bytes: file.size,
    mime_type: file.type || "application/octet-stream",
    uploaded_by: uploader,
    uploaded_at: new Date().toISOString(),
    preview_url: URL.createObjectURL(file),
  };
  if (!store[complaint_id]) store[complaint_id] = [];
  store[complaint_id] = [doc, ...store[complaint_id]];
  return doc;
}

export function deleteDocument(complaint_id: string, doc_id: string): void {
  if (store[complaint_id]) {
    const doc = store[complaint_id].find((d) => d.id === doc_id);
    if (doc?.preview_url) URL.revokeObjectURL(doc.preview_url);
    store[complaint_id] = store[complaint_id].filter((d) => d.id !== doc_id);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mime: string): "pdf" | "image" | "excel" | "word" | "generic" {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.endsWith(".xlsx"))
    return "excel";
  if (mime.includes("wordprocessingml") || mime.includes("msword")) return "word";
  return "generic";
}

// Allowed types for upload
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_FILE_SIZE_MB = 10;
