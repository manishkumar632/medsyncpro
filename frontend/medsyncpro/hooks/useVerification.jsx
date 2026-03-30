import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { config } from "@/lib/config";
import {
  fetchVerificationStatusAction,
  submitForVerificationAction,
  uploadDocumentsBatchAction,
} from "@/actions/verificationAction";

/**
 * useVerification
 *
 * Manages professional verification state for doctors, pharmacists, agents, and patients.
 *
 * Data flow:
 *   • Status / submit / batch-upload  →  server actions (verificationAction.js)
 *   • Single file upload / delete     →  Route Handler (/api/verification/documents/:documentTypeId)
 *
 * The browser never calls Spring Boot directly — the access_token cookie
 * is read and forwarded server-side in both paths.
 *
 * NOTE: Document types are now dynamic (DB-driven). The `type` parameter
 * in upload/delete is now a document type ID (number), not an enum string.
 */
export default function useVerification() {
  const [status, setStatus] = useState("UNVERIFIED");
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [notes, setNotes] = useState("");
  const [submittedAt, setSubmittedAt] = useState(null);
  const [reviewedAt, setReviewedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Sync local state from the API response data object ─────────────────────

  function applyVerificationData(data) {
    setStatus(data.status);
    setDocuments(data.submittedDocuments || []);
    setRequiredDocuments(data.requiredDocuments || []);
    setNotes(data.verificationNotes || "");
    setSubmittedAt(data.submittedAt || null);
    setReviewedAt(data.reviewedAt || null);
  }

  // ── Fetch verification status ───────────────────────────────────────────────

  const fetchVerificationStatus = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchVerificationStatusAction();
      if (result.success && result.data) {
        applyVerificationData(result.data);
      }
    } catch (error) {
      console.error("Error fetching verification status", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  // ── Upload a single document ────────────────────────────────────────────────
  //
  // Goes through the Route Handler at /api/verification/documents/:documentTypeId.
  // The handler reads the HttpOnly cookie server-side and pipes the multipart
  // body directly to Spring Boot — the file is never buffered in Next.js memory.

  const uploadSingleDocument = async (documentTypeId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${config.basePath}/verification/documents/${documentTypeId}`,
        {
          method: "POST",
          body: formData,
          // No Authorization header needed — the Route Handler reads the
          // HttpOnly cookie and forwards it to Spring Boot server-side.
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Document uploaded successfully");
        applyVerificationData(data.data);
        return true;
      } else {
        toast.error(data.message || "Failed to upload document");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload");
      return false;
    }
  };

  // ── Delete a single document ────────────────────────────────────────────────
  //
  // Also goes through the Route Handler — same cookie forwarding logic.

  const deleteSingleDocument = async (documentTypeId) => {
    try {
      const res = await fetch(
        `${config.basePath}/api/verification/documents/${documentTypeId}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Document removed");
        applyVerificationData(data.data);
        return true;
      } else {
        toast.error(data.message || "Failed to remove document");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
      return false;
    }
  };

  // ── Submit for verification ─────────────────────────────────────────────────

  const submitForVerification = async () => {
    try {
      const result = await submitForVerificationAction();

      if (result.success) {
        toast.success(
          "Verification submitted! Our team will review your documents.",
        );
        applyVerificationData(result.data);
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
      return false;
    }
  };

  // ── Batch upload (legacy) ───────────────────────────────────────────────────

  const uploadDocuments = async (files, documentTypes) => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("documents", file));
      Object.entries(documentTypes).forEach(([key, value]) =>
        formData.append(`documentTypes[${key}]`, value),
      );

      const result = await uploadDocumentsBatchAction(formData);

      if (result.success) {
        toast.success("Documents uploaded successfully");
        await fetchVerificationStatus();
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    documents,
    requiredDocuments,
    notes,
    submittedAt,
    reviewedAt,
    loading,
    uploadDocuments,
    uploadSingleDocument,
    deleteSingleDocument,
    submitForVerification,
    refresh: fetchVerificationStatus,
  };
}
