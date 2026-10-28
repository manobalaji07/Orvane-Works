"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Download,
  Trash2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateProfileSettingsAction,
  exportMyDataAction,
  deleteMyAccountAction,
} from "@/app/actions/client";

interface SettingsClientProps {
  initialProfile: {
    id: string;
    email: string;
    full_name: string;
    phone?: string | null;
    metadata?: any;
  };
}

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // DPDP Export states
  const [isExporting, setIsExporting] = useState(false);

  // DPDP Delete states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProfileSettingsAction(null, formData);
      if (res.success) {
        setSaveSuccess(true);
      } else {
        setErrorMessage(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await exportMyDataAction();
      if (res.success && res.data) {
        // Trigger browser JSON download
        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orvane-dpdp-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(res.message || "Export failed.");
      }
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccountAction();
    } catch (err: any) {
      const isRedirect =
        err?.message === "NEXT_REDIRECT" ||
        err?.message?.includes("NEXT_REDIRECT") ||
        (typeof err?.digest === "string" && err.digest.includes("NEXT_REDIRECT"));

      if (isRedirect) {
        throw err;
      }

      alert("Failed to delete account: " + err?.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Profile & Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-vermilion" />
            Profile &amp; Contact Details
          </CardTitle>
          <CardDescription>
            Manage the name and contact coordinates used for quotes, invoices, and direct WhatsApp communication.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  name="full_name"
                  defaultValue={profile.full_name}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address (Primary Login)
                </label>
                <Input
                  name="email"
                  defaultValue={profile.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  WhatsApp / Phone Number
                </label>
                <Input
                  name="phone"
                  defaultValue={profile.phone || ""}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Company / Brand Name
                </label>
                <Input
                  name="company_name"
                  defaultValue={profile.metadata?.company_name || ""}
                  placeholder="e.g. Madurai Textile Mills"
                />
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="space-y-3 pt-3 border-t border-border">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-vermilion" />
                Notification Preferences
              </label>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notify_order_updates"
                    defaultChecked={profile.metadata?.notify_order_updates ?? true}
                    className="rounded border-input text-vermilion focus:ring-vermilion"
                  />
                  <span>Email me when project milestone status changes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notify_messages"
                    defaultChecked={profile.metadata?.notify_messages ?? true}
                    className="rounded border-input text-vermilion focus:ring-vermilion"
                  />
                  <span>Email me when student team posts a new message</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500 font-semibold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* DPDP Act 2023 Compliance & Data Privacy Section */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-vermilion" />
              Data Privacy &amp; India DPDP Act Rights
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              DPDP Act 2023
            </Badge>
          </div>
          <CardDescription>
            Under India&apos;s Digital Personal Data Protection Act, 2023, you retain absolute ownership and control over your digital identity and project submissions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Export Data Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/20 border border-border">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                Right to Data Portability (Export Archive)
              </h4>
              <p className="text-xs text-muted-foreground">
                Download a machine-readable JSON archive of all personal records, order briefs, quotes, and communication logs.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isExporting}
              className="gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Assembling JSON..." : "Export My Data"}
            </Button>
          </div>

          {/* Delete Account Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Right to Erasure (Delete Account &amp; Data)
              </h4>
              <p className="text-xs text-muted-foreground">
                Permanently anonymize your personal credentials and cancel account access in accordance with DPDP statutory requirements.
              </p>
            </div>

            <Dialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="gap-2 shrink-0 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Confirm Account &amp; Data Deletion
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    This action is immediate and non-reversible.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs text-muted-foreground">
                  <p>
                    In compliance with Section 12 of the DPDP Act 2023, initiating erasure will:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Scrub your name, phone number, and personal email.</li>
                    <li>Revoke authentication credentials and active sessions.</li>
                    <li>Retain only anonymized transaction references required for financial accounting audit integrity.</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    Keep Account
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDeleteAccount}
                    className="font-semibold"
                  >
                    {isDeleting ? "Erasing..." : "Permanently Erase Everything"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
