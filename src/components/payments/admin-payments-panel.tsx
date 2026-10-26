"use client";

import React, { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  CreditCard,
  Plus,
  Ban,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Receipt,
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
import { recordPaymentAction, voidPaymentAction, editPaymentAction } from "@/app/actions/payments";
import type { OrderPayment, PaymentSummary } from "@/lib/data/payments";
import { formatINR } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  other: "Other",
};

const TYPE_LABELS: Record<string, string> = {
  advance: "Advance",
  balance: "Balance",
  full: "Full Payment",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Sub-component: Record Payment Form ───────────────────────────────────────

interface RecordFormProps {
  orderId: string;
  orderNumber: string;
  onSuccess: () => void;
}

function RecordPaymentForm({ orderId, orderNumber, onSuccess }: RecordFormProps) {
  const [state, formAction] = useFormState(recordPaymentAction, null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-4"
    >
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="order_number" value={orderNumber} />

      {state && !state.success && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.message || state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-vermilion" />
            Amount (₹) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            name="amount_inr"
            placeholder="e.g. 12500"
            min="1"
            step="0.01"
            required
            className="text-xs"
          />
          {state?.errors?.amount_inr && (
            <p className="text-[11px] text-destructive">{state.errors.amount_inr[0]}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Date Received <span className="text-destructive">*</span>
          </label>
          <Input
            type="date"
            name="date_received"
            defaultValue={today}
            required
            className="text-xs"
          />
        </div>

        {/* Payment Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Payment Type <span className="text-destructive">*</span>
          </label>
          <select
            name="payment_type"
            required
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="advance">Advance (50% upfront)</option>
            <option value="balance">Balance (remaining)</option>
            <option value="full">Full Payment (100%)</option>
          </select>
        </div>

        {/* Method */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Payment Method <span className="text-destructive">*</span>
          </label>
          <select
            name="method"
            required
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* UTR / Reference */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          UTR / Transaction Reference{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          type="text"
          name="reference_utr"
          placeholder="e.g. 425816302947 (UPI ref or bank UTR)"
          className="text-xs font-mono"
        />
      </div>

      {/* Admin Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Internal Notes{" "}
          <span className="text-muted-foreground font-normal">(optional, not shown to client)</span>
        </label>
        <Textarea
          name="notes"
          placeholder="e.g. Client transferred via PhonePe. Screenshot saved in Drive."
          rows={2}
          className="text-xs resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className="gap-1.5 text-xs font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Recording…
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Record Payment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ── Sub-component: Void Payment Inline ───────────────────────────────────────

interface VoidRowProps {
  payment: OrderPayment;
  orderNumber: string;
}

function VoidPaymentRow({ payment, orderNumber }: VoidRowProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(voidPaymentAction, null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
      >
        Void
      </button>
    );
  }

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="mt-2 space-y-2 p-3 bg-destructive/5 rounded-md border border-destructive/20"
    >
      <input type="hidden" name="payment_id" value={payment.id} />
      <input type="hidden" name="order_number" value={orderNumber} />
      <p className="text-[11px] font-semibold text-destructive">Void this payment?</p>
      <Textarea
        name="void_reason"
        placeholder="Reason for voiding (e.g. Duplicate entry, client requested refund)"
        rows={2}
        required
        className="text-xs resize-none"
      />
      {state?.message && !state.success && (
        <p className="text-[11px] text-destructive">{state.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" size="sm" disabled={isPending} className="text-xs gap-1">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
          Confirm Void
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Sub-component: Edit Payment Inline ────────────────────────────────────────

interface EditRowProps {
  payment: OrderPayment;
  orderNumber: string;
}

function EditPaymentRow({ payment, orderNumber }: EditRowProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(editPaymentAction, null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    );
  }

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="mt-2 space-y-3 p-3 bg-muted/20 rounded-md border border-border"
    >
      <input type="hidden" name="payment_id" value={payment.id} />
      <input type="hidden" name="order_id" value={payment.order_id} />
      <input type="hidden" name="order_number" value={orderNumber} />

      <p className="text-[11px] font-semibold text-foreground">Edit Payment Details</p>

      {state && !state.success && (
        <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {state.message || state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Amount (₹)</label>
          <Input
            type="number"
            name="amount_inr"
            defaultValue={payment.amount_inr}
            min="1"
            step="0.01"
            required
            className="text-xs h-8"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Date Received</label>
          <Input
            type="date"
            name="date_received"
            defaultValue={payment.date_received}
            required
            className="text-xs h-8"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Payment Type</label>
          <select
            name="payment_type"
            defaultValue={payment.payment_type}
            required
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="advance">Advance</option>
            <option value="balance">Balance</option>
            <option value="full">Full Payment</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Method</label>
          <select
            name="method"
            defaultValue={payment.method}
            required
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-medium text-muted-foreground block mb-1">UTR / Transaction Ref</label>
        <Input
          type="text"
          name="reference_utr"
          defaultValue={payment.reference_utr || ""}
          placeholder="e.g. UPI Ref ID"
          className="text-xs font-mono h-8"
        />
      </div>

      <div>
        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Internal Notes</label>
        <Textarea
          name="notes"
          defaultValue={payment.notes || ""}
          rows={2}
          className="text-xs resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending} className="text-xs h-8 gap-1">
          {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Save Changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-8"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface AdminPaymentsPanelProps {
  orderId: string;
  orderNumber: string;
  summary: PaymentSummary;
}

export function AdminPaymentsPanel({
  orderId,
  orderNumber,
  summary,
}: AdminPaymentsPanelProps) {
  const [showForm, setShowForm] = useState(false);

  const statusColour =
    summary.status === "Paid in Full"
      ? "text-emerald-600 dark:text-emerald-400"
      : summary.status === "Unpaid"
      ? "text-muted-foreground"
      : "text-amber-600 dark:text-amber-400";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-vermilion" />
            Payments
          </CardTitle>
          <Badge variant="outline" className={`text-[10px] font-semibold uppercase ${statusColour}`}>
            {summary.status}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Record UPI / bank transfer / cash payments. Client sees totals only — UTR and notes are admin-only.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">Quote Total</p>
            <p className="text-sm font-bold text-foreground">
              {summary.quote_amount ? formatINR(summary.quote_amount) : "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">Received</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(summary.total_paid)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">Balance Due</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {formatINR(summary.balance_due)}
            </p>
          </div>
        </div>

        {/* Payment History */}
        {summary.payments.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment History
            </p>
            {summary.payments.map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  p.voided_at
                    ? "opacity-50 bg-muted/10 border-border/40"
                    : "bg-card border-border/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {formatINR(p.amount_inr)}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0">
                      {TYPE_LABELS[p.payment_type] || p.payment_type}
                    </Badge>
                    <span className="text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.voided_at ? (
                      <Badge variant="destructive" className="text-[10px] py-0">Voided</Badge>
                    ) : (
                      <>
                        <EditPaymentRow payment={p} orderNumber={orderNumber} />
                        <VoidPaymentRow payment={p} orderNumber={orderNumber} />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{formatDate(p.date_received)}</span>
                  {p.reference_utr && (
                    <span className="font-mono">UTR: {p.reference_utr}</span>
                  )}
                </div>

                {p.voided_at && p.void_reason && (
                  <p className="text-[11px] text-destructive/80 italic">
                    Void reason: {p.void_reason}
                  </p>
                )}

                {p.notes && (
                  <p className="text-[11px] text-muted-foreground italic">{p.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No payments recorded yet.</p>
          </div>
        )}

        {/* Add Payment */}
        {!showForm ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Record New Payment
          </Button>
        ) : (
          <div className="pt-2 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Record Payment</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <RecordPaymentForm
              orderId={orderId}
              orderNumber={orderNumber}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
