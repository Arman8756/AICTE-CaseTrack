import { useRef, useState, useCallback } from "react";
import {
  Upload, FileText, FileImage, FileSpreadsheet, File,
  Trash2, Download, Eye, X, Paperclip, CheckCircle,
} from "lucide-react";
import {
  getDocuments, uploadDocument, deleteDocument,
  formatFileSize, getFileIcon, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB,
  type UploadedDocument,
} from "../api/documents";
import { formatDateTime } from "../utils";
import toast from "react-hot-toast";

// ── Icon per file type ────────────────────────────────────────────────────────
function FileTypeIcon({ mime, className = "w-5 h-5" }: { mime: string; className?: string }) {
  const type = getFileIcon(mime);
  switch (type) {
    case "pdf":
      return <FileText className={`${className} text-red-500`} />;
    case "image":
      return <FileImage className={`${className} text-blue-500`} />;
    case "excel":
      return <FileSpreadsheet className={`${className} text-green-600`} />;
    case "word":
      return <FileText className={`${className} text-blue-700`} />;
    default:
      return <File className={`${className} text-gray-500`} />;
  }
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  doc,
  onClose,
}: {
  doc: UploadedDocument;
  onClose: () => void;
}) {
  const isImage = doc.mime_type.startsWith("image/");
  const isPdf = doc.mime_type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileTypeIcon mime={doc.mime_type} />
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                {doc.original_filename}
              </p>
              <p className="text-xs text-gray-400">{formatFileSize(doc.file_size_bytes)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {isImage && doc.preview_url ? (
            <img
              src={doc.preview_url}
              alt={doc.original_filename}
              className="max-w-full mx-auto rounded shadow"
            />
          ) : isPdf && doc.preview_url ? (
            <iframe
              src={doc.preview_url}
              className="w-full h-[60vh] rounded border border-gray-200"
              title={doc.original_filename}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileTypeIcon mime={doc.mime_type} className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-sm font-medium text-gray-600">{doc.original_filename}</p>
              <p className="text-xs mt-1 text-gray-400">Preview not available for this file type</p>
              {doc.preview_url && (
                <a
                  href={doc.preview_url}
                  download={doc.original_filename}
                  className="mt-4 btn-primary text-sm"
                >
                  <Download className="w-4 h-4" /> Download to view
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white rounded-b-xl flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Uploaded by <strong className="text-gray-600">{doc.uploaded_by}</strong>{" "}
            · {formatDateTime(doc.uploaded_at)}
          </div>
          {doc.preview_url && (
            <a
              href={doc.preview_url}
              download={doc.original_filename}
              className="btn-secondary text-xs py-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({
  onFiles,
  uploading,
}: {
  onFiles: (files: FileList) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-lg px-6 py-8 text-center cursor-pointer transition-colors
        ${dragging
          ? "border-primary-400 bg-primary-50"
          : "border-gray-300 hover:border-primary-300 hover:bg-gray-50"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
            <p className="text-sm text-primary-600 font-medium">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className={`w-8 h-8 ${dragging ? "text-primary-500" : "text-gray-400"}`} />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {dragging ? "Drop files here" : "Click or drag files to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, Word, Excel, Images · Max {MAX_FILE_SIZE_MB} MB each
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  complaintId: string;
  readOnly?: boolean;
  uploaderName?: string;
}

export default function DocumentUpload({ complaintId, readOnly = false, uploaderName = "Current User" }: Props) {
  const [docs, setDocs] = useState<UploadedDocument[]>(() => getDocuments(complaintId));
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<UploadedDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [recentlyUploaded, setRecentlyUploaded] = useState<Set<string>>(new Set());

  const handleFiles = useCallback(
    async (files: FileList) => {
      const newDocs: UploadedDocument[] = [];
      const errors: string[] = [];

      for (const file of Array.from(files)) {
        // Validate size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${MAX_FILE_SIZE_MB} MB limit`);
          continue;
        }
        // Validate type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          errors.push(`${file.name} — unsupported file type`);
          continue;
        }
        newDocs.push(uploadDocument(complaintId, file, uploaderName));
      }

      if (errors.length) {
        errors.forEach((e) => toast.error(e));
      }

      if (newDocs.length) {
        setUploading(true);
        // Simulate brief upload delay for UX
        await new Promise((r) => setTimeout(r, 600));
        setUploading(false);
        setDocs(getDocuments(complaintId));
        const newIds = new Set(newDocs.map((d) => d.id));
        setRecentlyUploaded(newIds);
        setTimeout(() => setRecentlyUploaded(new Set()), 3000);
        toast.success(
          newDocs.length === 1
            ? `"${newDocs[0].original_filename}" uploaded`
            : `${newDocs.length} files uploaded`
        );
      }
    },
    [complaintId, uploaderName]
  );

  const handleDelete = (docId: string) => {
    deleteDocument(complaintId, docId);
    setDocs(getDocuments(complaintId));
    setDeleteConfirm(null);
    toast.success("Document removed");
  };

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
          {docs.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
              {docs.length}
            </span>
          )}
        </div>
      </div>

      {/* Upload zone */}
      {!readOnly && (
        <DropZone onFiles={handleFiles} uploading={uploading} />
      )}

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No documents attached yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                ${recentlyUploaded.has(doc.id)
                  ? "border-green-200 bg-green-50"
                  : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                }`}
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                <FileTypeIcon mime={doc.mime_type} className="w-8 h-8" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {doc.original_filename}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatFileSize(doc.file_size_bytes)} · {doc.uploaded_by} · {formatDateTime(doc.uploaded_at)}
                </p>
              </div>

              {/* Recently uploaded tick */}
              {recentlyUploaded.has(doc.id) && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Preview */}
                <button
                  onClick={() => setPreview(doc)}
                  className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Download */}
                {doc.preview_url && (
                  <a
                    href={doc.preview_url}
                    download={doc.original_filename}
                    className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {/* Delete */}
                {!readOnly && (
                  deleteConfirm === doc.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-xs text-red-600 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-500 px-1 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(doc.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal doc={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
