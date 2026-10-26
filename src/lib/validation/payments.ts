import { z } from "zod";

export const recordPaymentSchema = z.object({
  order_id: z.string().uuid("Invalid order ID."),
  order_number: z.string().min(1, "Order number required."),
  amount_inr: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive("Amount must be greater than 0.")
    .max(9_999_999, "Amount exceeds maximum."),
  payment_type: z.enum(["advance", "balance", "full"], {
    errorMap: () => ({ message: "Select a valid payment type." }),
  }),
  method: z.enum(["upi", "bank_transfer", "cash", "other"], {
    errorMap: () => ({ message: "Select a valid payment method." }),
  }),
  reference_utr: z.string().max(100).optional().or(z.literal("")),
  date_received: z.string().min(1, "Date is required."),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const voidPaymentSchema = z.object({
  payment_id: z.string().uuid("Invalid payment ID."),
  order_number: z.string().min(1, "Order number required."),
  void_reason: z.string().min(3, "Provide a reason for voiding this payment.").max(300),
});

export const editPaymentSchema = z.object({
  payment_id: z.string().uuid("Invalid payment ID."),
  order_id: z.string().uuid("Invalid order ID."),
  order_number: z.string().min(1, "Order number required."),
  amount_inr: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive("Amount must be greater than 0.")
    .max(9_999_999, "Amount exceeds maximum."),
  payment_type: z.enum(["advance", "balance", "full"], {
    errorMap: () => ({ message: "Select a valid payment type." }),
  }),
  method: z.enum(["upi", "bank_transfer", "cash", "other"], {
    errorMap: () => ({ message: "Select a valid payment method." }),
  }),
  reference_utr: z.string().max(100).optional().or(z.literal("")),
  date_received: z.string().min(1, "Date is required."),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type VoidPaymentInput = z.infer<typeof voidPaymentSchema>;
export type EditPaymentInput = z.infer<typeof editPaymentSchema>;
