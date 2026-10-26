import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ExternalLink,
  MessageCircle,
  FileText,
  Sparkles,
  CheckCircle2,
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
import { StatusChip } from "@/components/ui/status-chip";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { QuoteCard } from "@/components/orders/quote-card";
import { MessageThread } from "@/components/orders/message-thread";
import { FilesCard } from "@/components/orders/files-card";
import { ReviewModal } from "@/components/orders/review-modal";
import { ClientCloseProjectButton } from "@/components/orders/client-close-project-button";
import { ClientPaymentCard } from "@/components/payments/client-payment-card";
import {
  getOrderByNumber,
  getOrderMessages,
  getOrderFiles,
} from "@/lib/data/orders";
import { getOrderPaymentSummary } from "@/lib/data/payments";
import { getSiteSetting } from "@/lib/data/settings";
import { formatDate, formatINR, formatContactMethod } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";
import { requireClient } from "@/lib/auth/guards";

interface OrderDetailPageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  return {
    title: `Order ${params.orderNumber} — ${SITE_CONFIG.name} Client Portal`,
    description: `Track milestones, deliverables, and communication for order ${params.orderNumber}.`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  let user: any = null;
  let profile: any = null;
  try {
    const auth = await requireClient();
    user = auth.user;
    profile = auth.profile;
  } catch {
    notFound();
  }

  const order = await getOrderByNumber(params.orderNumber);

  // Strict ownership check: client can never open another client's order by changing the URL
  if (!order || (profile?.role !== "admin" && order.client_id !== user.id)) {
    notFound();
  }

  const [messages, files, paymentSummary, paymentInstructions] = await Promise.all([
    getOrderMessages(params.orderNumber, order.id),
    getOrderFiles(params.orderNumber, order.id),
    getOrderPaymentSummary(order.id, order.quote_amount_inr),
    getSiteSetting("payment_instructions"),
  ]);

  const canReview = order.status === "delivered" || order.status === "closed";

  return (
    <div className="container py-8 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Orders
            </Button>
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {order.order_number}
          </span>
          <StatusChip status={order.status} />
        </div>

        <div className="flex items-center gap-2">
          {order.status === "delivered" && (
            <ClientCloseProjectButton orderNumber={order.order_number} />
          )}

          {canReview && (
            <ReviewModal orderId={order.id} orderNumber={order.order_number} />
          )}

          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
              `Hi ${SITE_CONFIG.name}, regarding my order ${order.order_number}: `
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Lead
            </Button>
          </a>
        </div>
      </div>

      {/* Project Title & Service Overview */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {order.service_title}
            </Badge>
            {order.package_name && (
              <Badge variant="secondary" className="text-xs">
                {order.package_name}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {order.title}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Ordered on {formatDate(order.created_at)}</span>
            <span>•</span>
            <span>Target Deadline: {formatDate(order.target_deadline)}</span>
          </p>
        </div>
      </div>

      {/* Visual Status Progression Timeline */}
      <Card className="bg-card/60 border-border">
        <CardContent className="pt-4 pb-2">
          <StatusTimeline currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope, Files, and Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Scope & Brief */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-vermilion" />
                Project Brief &amp; Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/60">
                {order.project_brief}
              </p>

              {order.reference_links && (
                <div className="space-y-1 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reference Links
                  </span>
                  <div className="space-y-1">
                    {order.reference_links
                      .split("\n")
                      .filter((l) => l.trim())
                      .map((url, i) => (
                        <a
                          key={i}
                          href={url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-vermilion hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{url.trim()}</span>
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables & Assets Vault */}
          <FilesCard
            files={files}
            orderNumber={order.order_number}
            orderId={order.id}
            userRole="client"
          />

          {/* Project Collaboration Message Thread */}
          <MessageThread
            orderId={order.id}
            orderNumber={order.order_number}
            initialMessages={messages}
          />
        </div>

        {/* Right Column: Financial Quote & Meta Card */}
        <div className="space-y-6">
          {/* Financial Quote Card */}
          <QuoteCard order={order} />

          {/* Payment Status & How to Pay */}
          <ClientPaymentCard summary={paymentSummary} paymentInstructions={paymentInstructions} />

          {/* Project Details & Assigned Team Lead */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vermilion" />
                Assignment &amp; Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Assigned Lead:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-vermilion" />
                  {order.preferred_employee_name || "Madurai Engineering Core"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Preferred Contact:</span>
                <span className="font-semibold text-foreground">
                  {formatContactMethod(order.preferred_contact_method)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Target Deadline:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(order.target_deadline)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Initial Budget:</span>
                <span className="font-semibold text-foreground">
                  {formatINR(order.budget_min_inr)} - {formatINR(order.budget_max_inr)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Studio Guarantee Notice */}
          <div className="p-4 rounded-lg bg-vermilion/5 border border-vermilion/20 space-y-2">
            <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-vermilion" />
              The {SITE_CONFIG.name} Engineering Promise
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every deliverable is code-reviewed, tested at 360px mobile width, and checked for WCAG 2.2 AA accessibility before being marked complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
