import { Resend } from "resend";
import { SITE_CONFIG } from "@/lib/constants/site";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || `${SITE_CONFIG.name} <notifications@example.com>`;
const COMPANY_INBOX = process.env.COMPANY_INBOX || SITE_CONFIG.email;

/**
 * Base email layout wrapper with Orvane Works brand styling
 */
function wrapEmailHtml(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F6F3EE;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111214;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #FFFFFF;
      border: 1px solid #E5E1D8;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: #111214;
      padding: 24px 32px;
      text-align: left;
    }
    .logo-text {
      color: #F6F3EE;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .logo-sub {
      color: #9CA3AF;
      font-size: 12px;
      margin: 2px 0 0 0;
    }
    .content {
      padding: 32px;
    }
    .heading {
      font-size: 20px;
      font-weight: 700;
      color: #111214;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #F4E8E5;
      color: #C8341B;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .footer {
      padding: 24px 32px;
      background: #F9F8F6;
      border-top: 1px solid #E5E1D8;
      font-size: 12px;
      color: #6B7280;
    }
    .btn {
      display: inline-block;
      background-color: #C8341B;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo-text">${SITE_CONFIG.wordmark}</h1>
      <p class="logo-sub">Student-Founded Freelance Studio • Madurai, Tamil Nadu</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>${SITE_CONFIG.name}</strong> • Madurai, Tamil Nadu, India</p>
      <p style="margin: 0;">Need help? Email <a href="mailto:${SITE_CONFIG.email}" style="color: #C8341B;">${SITE_CONFIG.email}</a> or WhatsApp <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}" style="color: #C8341B;">+91 ${SITE_CONFIG.whatsappNumber.slice(2)}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generic email dispatcher helper
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    // In local development or CI without secrets, safely simulate delivery
    console.info(`[Email Simulated] To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("[Email Error] Failed to send email:", err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 1. Contact Form Received (to client/sender)
 */
export async function sendContactConfirmationEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const html = wrapEmailHtml(
    "We received your message",
    `
    <div class="badge">Message Received</div>
    <h2 class="heading">Vanakkam ${name}, thank you for reaching out to ${SITE_CONFIG.name}.</h2>
    <p>We have safely received your inquiry. One of our student founders in Madurai will review your brief and reply within 24 hours.</p>
    <p>If your project is time-sensitive or you prefer WhatsApp, you can also reach us directly at <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}" style="color: #C8341B; font-weight: 600;">+91 ${SITE_CONFIG.whatsappNumber.slice(2)}</a>.</p>
    <p>Warm regards,<br><strong>The ${SITE_CONFIG.name} Team</strong></p>
    `
  );

  return sendEmail({
    to: email,
    subject: `Vanakkam! We received your message — ${SITE_CONFIG.name}`,
    html,
  });
}

/**
 * 2. Contact Message Notification (to studio inbox)
 */
export async function sendContactAdminNotificationEmail({
  name,
  email,
  phone,
  service,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}) {
  const html = wrapEmailHtml(
    "New Contact Inquiry",
    `
    <div class="badge">New Client Lead</div>
    <h2 class="heading">New message from ${name}</h2>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
    ${service ? `<p><strong>Requested Service:</strong> ${service}</p>` : ""}
    <div style="background: #F9F8F6; padding: 16px; border-left: 3px solid #C8341B; margin: 16px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    <a href="mailto:${email}" class="btn">Reply to ${name}</a>
    `
  );

  return sendEmail({
    to: COMPANY_INBOX,
    subject: `[Lead] New Inquiry from ${name} (${service || "General"})`,
    html,
  });
}

/**
 * 3. Order Received Confirmation (to client)
 */
export async function sendOrderReceivedEmail({
  clientName,
  clientEmail,
  orderNumber,
  serviceTitle,
}: {
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  serviceTitle: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const html = wrapEmailHtml(
    `Order Received: ${orderNumber}`,
    `
    <div class="badge">Order Submitted • ${orderNumber}</div>
    <h2 class="heading">Vanakkam ${clientName}, your order has been registered!</h2>
    <p>Thank you for trusting ${SITE_CONFIG.name} with your project: <strong>${serviceTitle}</strong>.</p>
    <p>Our engineering leads are now reviewing your brief, budget requirements, and project scope. You will receive an official quote and timeline breakdown in your client portal shortly.</p>
    <a href="${appUrl}/dashboard/orders/${orderNumber}" class="btn">View Order Details &amp; Timeline</a>
    <p style="font-size: 13px; color: #6B7280;">Order reference number: <strong>${orderNumber}</strong></p>
    `
  );

  return sendEmail({
    to: clientEmail,
    subject: `Order Confirmed: ${orderNumber} — ${SITE_CONFIG.name}`,
    html,
  });
}

/**
 * 4. Order Status Changed (to client)
 */
export async function sendOrderStatusUpdatedEmail({
  clientName,
  clientEmail,
  orderNumber,
  newStatus,
  statusLabel,
  notes,
}: {
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  newStatus: string;
  statusLabel: string;
  notes?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const html = wrapEmailHtml(
    `Order Status Update: ${orderNumber}`,
    `
    <div class="badge">Status Update</div>
    <h2 class="heading">Project status changed to: ${statusLabel}</h2>
    <p>Dear ${clientName},</p>
    <p>Your project <strong>${orderNumber}</strong> has advanced to: <strong style="color: #C8341B;">${statusLabel}</strong>.</p>
    ${
      notes
        ? `<div style="background: #F9F8F6; padding: 16px; border-left: 3px solid #C8341B; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Note from team:</strong> ${notes}</p>
          </div>`
        : ""
    }
    <a href="${appUrl}/dashboard/orders/${orderNumber}" class="btn">Check Progress &amp; Files</a>
    `
  );

  return sendEmail({
    to: clientEmail,
    subject: `[${orderNumber}] Status updated to "${statusLabel}" — ${SITE_CONFIG.name}`,
    html,
  });
}

/**
 * 5. Employee Application Decision (Approved or Rejected)
 */
export async function sendEmployeeDecisionEmail({
  applicantName,
  applicantEmail,
  status,
  reason,
}: {
  applicantName: string;
  applicantEmail: string;
  status: "approved" | "rejected";
  reason?: string;
}) {
  const isApproved = status === "approved";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const body = isApproved
    ? `
      <div class="badge" style="background: #E8F5E9; color: #1E7E34;">Welcome to the Team</div>
      <h2 class="heading">Congratulations ${applicantName}! Your ${SITE_CONFIG.name} application was approved.</h2>
      <p>The student founders have verified your application. Your employee account is now fully active.</p>
      <p>You can now log in to the employee dashboard, configure your public team profile (specializations, bio, and experience), and receive client order assignments.</p>
      <a href="${appUrl}/employee" class="btn">Open Employee Dashboard</a>
    `
    : `
      <div class="badge" style="background: #FEE2E2; color: #DC2626;">Application Update</div>
      <h2 class="heading">Dear ${applicantName}, update regarding your ${SITE_CONFIG.name} application</h2>
      <p>Thank you for taking the time to apply to join ${SITE_CONFIG.name}. After reviewing current project capacities and domain requirements, we are unable to bring you onto the active team at this time.</p>
      ${
        reason
          ? `<div style="background: #F9F8F6; padding: 16px; border-left: 3px solid #6B7280; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>Feedback from founders:</strong> ${reason}</p>
            </div>`
          : ""
      }
      <p>We keep all engineering profiles on file and encourage you to reapply in upcoming semesters as our client base expands.</p>
    `;

  const html = wrapEmailHtml(
    isApproved ? `Welcome to ${SITE_CONFIG.name} Team` : `${SITE_CONFIG.name} Application Status`,
    body
  );

  return sendEmail({
    to: applicantEmail,
    subject: isApproved
      ? `Welcome to ${SITE_CONFIG.name}! Application Approved 🎉`
      : `Update on your ${SITE_CONFIG.name} Team Application`,
    html,
  });
}

/**
 * 6. Payment Recorded Confirmation (to client)
 */
export async function sendPaymentConfirmationEmail({
  clientName,
  clientEmail,
  orderNumber,
  amountInr,
  paymentType,
  method,
  dateReceived,
}: {
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  amountInr: number;
  paymentType: "advance" | "balance" | "full";
  method: string;
  dateReceived: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const typeLabel =
    paymentType === "advance" ? "Advance Payment" :
    paymentType === "balance" ? "Balance Payment" : "Full Payment";
  const methodLabel =
    method === "upi" ? "UPI" :
    method === "bank_transfer" ? "Bank Transfer" :
    method === "cash" ? "Cash" : "Other";
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amountInr);

  const html = wrapEmailHtml(
    `Payment Received: ${orderNumber}`,
    `
    <div class="badge" style="background: #E8F5E9; color: #1E7E34;">Payment Received</div>
    <h2 class="heading">Thank you, ${clientName}! Your payment has been recorded.</h2>
    <p>We have received and confirmed the following payment for project <strong>${orderNumber}</strong>:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
      <tr style="border-bottom: 1px solid #E5E1D8;">
        <td style="padding: 8px 0; color: #6B7280;">Amount:</td>
        <td style="padding: 8px 0; font-weight: 700; color: #111214;">${formattedAmount}</td>
      </tr>
      <tr style="border-bottom: 1px solid #E5E1D8;">
        <td style="padding: 8px 0; color: #6B7280;">Type:</td>
        <td style="padding: 8px 0; font-weight: 600;">${typeLabel}</td>
      </tr>
      <tr style="border-bottom: 1px solid #E5E1D8;">
        <td style="padding: 8px 0; color: #6B7280;">Method:</td>
        <td style="padding: 8px 0;">${methodLabel}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B7280;">Date:</td>
        <td style="padding: 8px 0;">${dateReceived}</td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #6B7280;">You can view your full payment history and project progress in the client portal.</p>
    <a href="${appUrl}/dashboard/orders/${orderNumber}" class="btn">View Order & Payment Status</a>
    <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">If you believe this payment was recorded in error, please reply to this email or contact us on WhatsApp immediately.</p>
    `
  );

  return sendEmail({
    to: clientEmail,
    subject: `Payment Received for ${orderNumber} — ${SITE_CONFIG.name}`,
    html,
  });
}

/**
 * 7. New Message Received (to client or team)
 */
export async function sendNewMessageNotificationEmail({
  recipientName,
  recipientEmail,
  orderNumber,
  senderName,
  messageSnippet,
}: {
  recipientName: string;
  recipientEmail: string;
  orderNumber: string;
  senderName: string;
  messageSnippet: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const html = wrapEmailHtml(
    `New Message on ${orderNumber}`,
    `
    <div class="badge">New Project Message</div>
    <h2 class="heading">New message from ${senderName}</h2>
    <p>Hi ${recipientName}, you have a new message on project <strong>${orderNumber}</strong>:</p>
    <div style="background: #F9F8F6; padding: 16px; border-left: 3px solid #C8341B; margin: 16px 0;">
      <p style="margin: 0; font-style: italic;">"${messageSnippet}"</p>
    </div>
    <a href="${appUrl}/dashboard/orders/${orderNumber}" class="btn">Reply in Project Thread</a>
    `
  );

  return sendEmail({
    to: recipientEmail,
    subject: `New message on ${orderNumber} from ${senderName}`,
    html,
  });
}
