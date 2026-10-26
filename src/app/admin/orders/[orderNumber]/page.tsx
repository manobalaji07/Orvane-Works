import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  MessageCircle,
  FileText,
  ShieldCheck,
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
import { MessageThread } from "@/components/orders/message-thread";
import { FilesCard } from "@/components/orders/files-card";
import { AdminOrderWorkbench } from "./admin-order-workbench";
import { AdminPaymentsPanel } from "@/components/payments/admin-payments-panel";
import {
  getOrderByNumber,
  getOrderMessages,
  getOrderFiles,
} from "@/lib/data/orders";
import { getOrderPaymentSummary } from "@/lib/data/payments";
import { getAllEmployeesAdmin } from "@/lib/data/admin";
import { formatDate, formatContactMethod } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";

interface AdminOrderDetailPageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps) {
  return {
    title: `Admin Control: ${params.orderNumber} — ${SITE_CONFIG.name} Admin`,
    description: `Administrative governance and terms for order ${params.orderNumber}.`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const [order, employees] = await Promise.all([
    getOrderByNumber(params.orderNumber),
    getAllEmployeesAdmin(),
  ]);

  if (!order) {
    notFound();
  }

  const [messages, files, paymentSummary] = await Promise.all([
    getOrderMessages(params.orderNumber, order.id),
    getOrderFiles(params.orderNumber, order.id),
    getOrderPaymentSummary(order.id, order.quote_amount_inr),
  ]);

  return (
    <div className="container py-8 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Studio Orders
            </Button>
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {order.order_number}
          </span>
          <StatusChip status={order.status} />
        </div>

        <Badge variant="destructive" className="text-xs">
          Founder Control Deck
        </Badge>
      </div>

      {/* Project Title & Client Summary */}
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
          <span>Target Deadline: {formatDate(order.target_deadline)}</span>
          <span>•</span>
          <span>Client: {order.client_name} ({order.client_email})</span>
        </p>
      </div>

      {/* Visual Status Progression Timeline */}
      <Card className="bg-card/60 border-border">
        <CardContent className="pt-4 pb-2">
          <StatusTimeline currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Admin Governance Workbench + Message Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Order Workbench (Lead Assignment, Quote, Payment Status, Private Notes) */}
          <AdminOrderWorkbench order={order} employees={employees} />

          {/* Payments Panel — record and manage manual UPI/bank/cash payments */}
          <AdminPaymentsPanel
            orderId={order.id}
            orderNumber={order.order_number}
            summary={paymentSummary}
          />

          {/* Deliverables and Files */}
          <FilesCard
            files={files}
            orderNumber={order.order_number}
            orderId={order.id}
            userRole="admin"
          />

          {/* Project Message Thread */}
          <MessageThread
            orderId={order.id}
            orderNumber={order.order_number}
            initialMessages={messages}
          />
        </div>

        {/* Right Column: Original Project Brief & Contact Coordinates */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-vermilion" />
                Original Client Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                {order.project_brief}
              </p>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Client Name:</span>
                  <span className="font-semibold text-foreground">
                    {order.client_name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Client Email:</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {order.client_email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Preferred Contact:</span>
                  <span className="font-semibold text-foreground">
                    {formatContactMethod(order.preferred_contact_method)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Initial Budget Range:</span>
                  <span className="font-semibold text-foreground">
                    ₹{order.budget_min_inr.toLocaleString("en-IN")} - ₹{order.budget_max_inr.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {order.reference_links && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <span className="font-semibold text-muted-foreground block text-[11px]">
                    Reference Links:
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
        </div>
      </div>
    </div>
  );
}
