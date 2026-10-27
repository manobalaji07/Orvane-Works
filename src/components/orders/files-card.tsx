"use client";

import React, { useRef, useState } from "react";
import {
  FileText,
  Download,
  PackageCheck,
  FolderOpen,
  FileArchive,
  FileCode,
  FileImage,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";
import type { OrderFile } from "@/lib/data/orders";
import {
  uploadOrderFileAction,
  getOrderFileDownloadUrlAction,
} from "@/app/actions/files";

interface FilesCardProps {
  files: OrderFile[];
  orderNumber: string;
  orderId?: string;
  userRole?: "client" | "admin" | "employee";
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("compressed")) {
    return FileArchive;
  }
  if (mimeType.includes("image")) {
    return FileImage;
  }
  if (mimeType.includes("pdf")) {
    return FileText;
  }
  return FileCode;
}

export function FilesCard({
  files,
  orderNumber,
  orderId,
  userRole = "client",
}: FilesCardProps) {
  const [isUploading, setIsUploading] = useState<"deliverable" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const deliverableInputRef = useRef<HTMLInputElement>(null);

  const deliverables = files.filter((f) => f.is_deliverable);
  const references = files.filter((f) => !f.is_deliverable);

  const canUploadDeliverables = userRole === "admin" || userRole === "employee";

  const whatsappAssetUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${SITE_CONFIG.name}, I want to share brand assets / reference files for my order (${orderNumber}): `
  )}`;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isDeliverable: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!orderId) {
      setErrorMessage("Order ID missing. Please refresh the page.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading("deliverable");

    try {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("order_number", orderNumber);
      formData.append("is_deliverable", isDeliverable.toString());
      formData.append("file", file);

      const res = await uploadOrderFileAction(formData);
      if (res.success) {
        setSuccessMessage(`"${file.name}" uploaded successfully!`);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setErrorMessage(res.message || "Failed to upload file.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleDownload = async (file: OrderFile) => {
    setDownloadingId(file.id);
    try {
      const res = await getOrderFileDownloadUrlAction(file.id);
      if (res.success && res.url) {
        const a = document.createElement("a");
        a.href = res.url;
        a.download = file.file_name;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert(res.message || "Failed to generate download URL.");
      }
    } catch (err: any) {
      alert("Download error: " + (err?.message || "Network issue"));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="border-border">
      {/* Hidden file input for admin deliverables */}
      <input
        type="file"
        ref={deliverableInputRef}
        onChange={(e) => handleFileUpload(e, true)}
        className="hidden"
      />

      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-vermilion" />
            Deliverables &amp; Project Assets
          </CardTitle>
          <CardDescription className="text-xs">
            Review completed work packages and share project assets directly via WhatsApp.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          {files.length} vault files
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Final Deliverables Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
              Final Deliverables ({deliverables.length})
            </h4>

            {canUploadDeliverables && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUploading !== null}
                onClick={() => deliverableInputRef.current?.click()}
                className="h-7 text-xs gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              >
                {isUploading === "deliverable" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Uploading Package...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Final Deliverable</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {deliverables.length === 0 ? (
            <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground space-y-1">
              <p>No final deliverables uploaded yet.</p>
              <p className="text-[11px] text-muted-foreground/80">
                {canUploadDeliverables
                  ? "As an administrator, click 'Upload Final Deliverable' above to attach project zip, source code, or media packages."
                  : "Completed project deliverables will appear here upon milestone completion."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deliverables.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                const isDownloading = downloadingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-vermilion/40 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {file.file_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(file.file_size)} • Uploaded on{" "}
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isDownloading}
                      onClick={() => handleDownload(file)}
                      className="gap-1.5 text-xs shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Client References & Brand Assets Section (WhatsApp Sharing) */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
              Client References &amp; Brand Assets
            </h4>

            <a
              href={whatsappAssetUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs gap-1.5 bg-[#25D366] text-white hover:bg-[#20ba59] shadow-sm font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Share via WhatsApp</span>
              </Button>
            </a>
          </div>

          {/* WhatsApp Direct Sharing Card */}
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground/90 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Direct WhatsApp Asset Sharing</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Share your brand logos, Figma links, video raw footage, or reference screenshots directly with our engineering core on WhatsApp. This guarantees high-speed transfers without file size or storage errors.
            </p>
            <div className="pt-1">
              <a
                href={whatsappAssetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Click here to open WhatsApp with order #{orderNumber}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* If any past files were uploaded, display them */}
          {references.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Previously Attached Assets ({references.length})
              </span>
              {references.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                const isDownloading = downloadingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-muted/10 text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {file.file_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isDownloading}
                      onClick={() => handleDownload(file)}
                      className="h-7 px-2 text-xs"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
