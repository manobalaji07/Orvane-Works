"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  CreditCard,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
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
  assignOrderEmployeeAction,
  updateOrderAdminAction,
} from "@/app/actions/admin";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/data/orders";
import type { EmployeeAdminItem } from "@/lib/data/admin";

interface AdminOrderWorkbenchProps {
  order: Order;
  employees: EmployeeAdminItem[];
}

export function AdminOrderWorkbench({
  order,
  employees,
}: AdminOrderWorkbenchProps) {
  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState(
    order.preferred_employee_id || ""
  );
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [quoteAmount, setQuoteAmount] = useState<string>(
    order.quote_amount_inr?.toString() || ""
  );
  const [quoteTerms, setQuoteTerms] = useState<string>(order.quote_terms || "");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.payment_status
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    order.internal_notes || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 1. Assign lead if changed
      if (selectedLeadId && selectedLeadId !== order.preferred_employee_id) {
        await assignOrderEmployeeAction(
          order.id,
          selectedLeadId,
          order.order_number
        );
      }

      // 2. Update order details
      const res = await updateOrderAdminAction(order.id, order.order_number, {
        status,
        quote_amount_inr: quoteAmount ? Number(quoteAmount) : undefined,
        quote_terms: quoteTerms || undefined,
        payment_status: paymentStatus,
        internal_notes: internalNotes || undefined,
      });

      if (res.success) {
        setSuccessMessage("Order governance updated successfully!");
      } else {
        setErrorMessage(res.error || "Failed to update order.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vermilion" />
            Founder Governance &amp; Commercial Terms
          </CardTitle>
          <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
            Admin Controls
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Assign student specialists, issue binding quotes, record manual payments, and maintain private notes.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSaveOrder} className="space-y-5">
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMessage}
            </div>
          )}

          {/* Row 1: Assign Lead & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-vermilion" />
                Assigned Student Lead
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Unassigned (Open for assignment)</option>
                {employees.map((emp) => (
                  <option key={emp.user_id} value={emp.user_id}>
                    {emp.full_name} — {emp.designation} ({emp.availability_status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="submitted">Submitted (Awaiting review)</option>
                <option value="in_review">In Review (Scope analysis)</option>
                <option value="quote_sent">Quote Sent (Waiting for client acceptance)</option>
                <option value="accepted">Accepted (Quote accepted by client)</option>
                <option value="in_progress">In Progress (Engineering underway)</option>
                <option value="awaiting_feedback">Awaiting Feedback</option>
                <option value="delivered">Delivered (Files shared)</option>
                <option value="closed">Closed (Complete &amp; signed off)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quote Amount & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-vermilion" />
                Agreed Quote Amount (₹)
              </label>
              <Input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="e.g. 24999"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="unbilled">Unbilled</option>
                <option value="quote_pending">Quote Pending</option>
                <option value="invoiced">Invoiced</option>
                <option value="partially_paid">Partially Paid (50% Advance)</option>
                <option value="paid_in_full">Paid in Full</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Row 3: Quote Terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Quote Terms &amp; Payment Milestones (Visible to Client)
            </label>
            <Textarea
              value={quoteTerms}
              onChange={(e) => setQuoteTerms(e.target.value)}
              placeholder="e.g. 50% advance milestone payment upon acceptance. Final 50% upon master deployment."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Row 4: Private Internal Notes (Strictly Hidden from Client) */}
          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Private Internal Notes (Founders &amp; Team Only)</span>
            </div>
            <p className="text-[11px] text-muted-foreground pb-1">
              Strictly never exposed to the client or returned in client portal API responses.
            </p>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Client requested delivery before target date. Assigned specialist committed to delivering 5 days in advance."
              rows={3}
              className="text-xs resize-none bg-background"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500 font-medium text-xs gap-1.5"
            >
              {isSaving ? "Saving..." : "Save Governance Updates"}
              <Save className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
