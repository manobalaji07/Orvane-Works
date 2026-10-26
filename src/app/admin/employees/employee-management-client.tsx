"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  UserX,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  Eye,
  Slash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  approveEmployeeAction,
  rejectEmployeeAction,
  suspendEmployeeAction,
  reinstateEmployeeAction,
  inviteEmployeeAction,
} from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { EmployeeRequestItem, EmployeeAdminItem } from "@/lib/data/admin";

interface EmployeeManagementClientProps {
  initialRequests: EmployeeRequestItem[];
  initialEmployees: EmployeeAdminItem[];
}

export function EmployeeManagementClient({
  initialRequests,
  initialEmployees,
}: EmployeeManagementClientProps) {
  const [requests, setRequests] = useState<EmployeeRequestItem[]>(initialRequests);
  const [employees, setEmployees] = useState<EmployeeAdminItem[]>(initialEmployees);

  // Invite modal states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Reject modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectUser, setSelectedRejectUser] = useState<EmployeeRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Action feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleApprove = async (req: EmployeeRequestItem) => {
    try {
      const res = await approveEmployeeAction(req.user_id);
      if (res.success) {
        setStatusMessage(`Approved ${req.applicant_name}! Welcome email sent.`);
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
        );
      } else {
        alert(res.error || "Failed to approve employee.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRejectUser || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      const res = await rejectEmployeeAction(
        selectedRejectUser.user_id,
        rejectReason.trim()
      );
      if (res.success) {
        setStatusMessage(`Application rejected and feedback sent to ${selectedRejectUser.applicant_name}.`);
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRejectUser.id ? { ...r, status: "rejected" } : r
          )
        );
        setRejectModalOpen(false);
        setRejectReason("");
      } else {
        alert(res.error || "Failed to reject applicant.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleToggleSuspend = async (emp: EmployeeAdminItem) => {
    try {
      if (emp.status === "active") {
        await suspendEmployeeAction(emp.user_id);
        setStatusMessage(`Suspended ${emp.full_name}. Profile unpublished.`);
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === emp.id ? { ...e, status: "suspended", is_published: false } : e
          )
        );
      } else {
        await reinstateEmployeeAction(emp.user_id);
        setStatusMessage(`Reinstated ${emp.full_name} to active duty.`);
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === emp.id ? { ...e, status: "active", is_published: true } : e
          )
        );
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    setIsInviting(true);
    try {
      const res = await inviteEmployeeAction(inviteEmail.trim(), inviteName.trim());
      if (res.success) {
        setStatusMessage(res.message || "Invitation sent.");
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
      } else {
        alert(res.error || "Failed to send invitation.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Notification Toast */}
      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Student Team Governance
          </h2>
          <p className="text-xs text-muted-foreground">
            Strict founder review for student applicants. Role elevation is database-guarded.
          </p>
        </div>

        {/* Direct Invite Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 font-medium text-xs bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500">
              <Plus className="w-4 h-4" />
              Invite Specialist by Email
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-vermilion" />
                Invite Student Engineering Lead
              </DialogTitle>
              <DialogDescription className="text-xs">
                Directly invite a known student engineer or designer to bypass public queue.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Student Name
                </label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Vignesh Natarajan"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  required
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isInviting}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500 font-semibold"
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SECTION 1: Pending Approvals Queue */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-vermilion">
              <UserCheck className="w-5 h-5" />
              Pending Employee Queue ({pendingRequests.length})
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Awaiting Verification
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Review applicant portfolios, college engineering credentials, and cover statements.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <UserCheck className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-semibold text-foreground">No pending employee requests</p>
              <p>All student team applications have been reviewed.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-lg border border-border bg-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-foreground">
                        {req.applicant_name}
                      </h4>
                      <span className="font-mono text-xs text-muted-foreground">
                        {req.applicant_email}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Applied on {formatDate(req.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 h-8"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Approve Member
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRejectUser(req);
                        setRejectModalOpen(true);
                      }}
                      className="text-destructive hover:bg-destructive/10 text-xs gap-1.5 h-8"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                  <span className="font-semibold text-foreground block mb-1">
                    Cover Note:
                  </span>
                  {req.cover_note}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-muted-foreground">Skills:</span>
                    {req.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {req.portfolio_url && (
                      <a
                        href={req.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-vermilion hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Portfolio / GitHub
                      </a>
                    )}
                    {req.resume_url && (
                      <a
                        href={req.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-vermilion hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Resume CV
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Active & Suspended Team Members */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-vermilion" />
              Active Studio Roster ({employees.length})
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Public Team Page Directory
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Manage designations, public publishing visibility, and account suspension status.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {emp.full_name}
                    </span>
                    <Badge
                      variant={emp.status === "active" ? "default" : "destructive"}
                      className="text-[10px] capitalize"
                    >
                      {emp.status}
                    </Badge>
                    <Badge
                      variant={emp.is_published ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {emp.is_published ? "Published" : "Hidden"}
                    </Badge>
                    {emp.is_featured && (
                      <Badge variant="accent" className="text-[10px]">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {emp.designation} • {emp.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleSuspend(emp)}
                    className="text-xs h-8"
                  >
                    {emp.status === "active" ? "Suspend Access" : "Reinstate Access"}
                  </Button>

                  <Link href={`/team`}>
                    <Button size="sm" variant="ghost" className="text-xs h-8 gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Public View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal with Mandatory Feedback Reason */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="w-5 h-5" />
              Reject Applicant with Feedback
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide constructive feedback to {selectedRejectUser?.applicant_name}. This message is sent via transactional email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Rejection Reason &amp; Recommendations <span className="text-vermilion">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Currently we are seeking candidates with deeper Next.js App Router experience. We encourage you to strengthen your TypeScript projects and reapply next semester."
                className="text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRejecting || !rejectReason.trim()}
                variant="destructive"
                size="sm"
                className="font-semibold"
              >
                {isRejecting ? "Sending Notice..." : "Send Rejection Notice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
