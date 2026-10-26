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
  Sparkles,
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
import { StatusUpdater } from "@/components/employee/status-updater";
import { DeliverableUploader } from "@/components/employee/deliverable-uploader";
import {
  getOrderByNumber,
  getOrderMessages,
  getOrderFiles,
} from "@/lib/data/orders";
import { formatDate, formatContactMethod } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";
import { requireEmployee } from "@/lib/auth/guards";

interface EmployeeOrderDetailPageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({
  params,
}: EmployeeOrderDetailPageProps) {
  return {
    title: `Workbench: ${params.orderNumber} — ${SITE_CONFIG.name} Employee Hub`,
    description: `Manage project deliverables and milestones for ${params.orderNumber}.`,
  };
}

export default async function EmployeeOrderDetailPage({
  params,
}: EmployeeOrderDetailPageProps) {
  let user: any = null;
  let profile: any = null;
  try {
    const auth = await requireEmployee();
    user = auth.user;
    profile = auth.profile;
  } catch {
    notFound();
  }

  const order = await getOrderByNumber(params.orderNumber);

  // Strict assignment check: employee can only view orders assigned to them (or admin)
  if (
    !order ||
    (profile?.role !== "admin" &&
      order.preferred_employee_id !== user.id &&
      !(order as any).assigned_employee_ids?.includes(user.id))
  ) {
    notFound();
  }

  const [messages, files] = await Promise.all([
    getOrderMessages(params.orderNumber, order.id),
    getOrderFiles(params.orderNumber, order.id),
  ]);

  return (
    <div className="container py-8 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/employee">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Assigned Queue
            </Button>
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {order.order_number}
          </span>
          <StatusChip status={order.status} />
          <Badge variant="outline" className="text-xs capitalize font-medium">
            Payment: {order.payment_status.replace(/_/g, " ")}
          </Badge>
        </div>

        <Badge variant="accent" className="text-xs">
          Specialist Workbench
        </Badge>
      </div>

      {/* Project Header */}
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
          <span>Client: {order.client_name || "Valued Client"}</span>
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
        {/* Left Column: Scope, Deliverables, Message Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Brief */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-vermilion" />
                Client Brief &amp; Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/60">
                {order.project_brief}
              </p>

              {order.reference_links && (
                <div className="space-y-1 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inspiration &amp; Reference Links
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

          {/* Deliverables Uploader Component */}
          <DeliverableUploader orderId={order.id} orderNumber={order.order_number} />

          {/* Files Vault */}
          <FilesCard
            files={files}
            orderNumber={order.order_number}
            orderId={order.id}
            userRole="employee"
          />

          {/* Message Thread */}
          <MessageThread
            orderId={order.id}
            orderNumber={order.order_number}
            initialMessages={messages}
          />
        </div>

        {/* Right Column: Milestone Status Advancement & Meta Details */}
        <div className="space-y-6">
          {/* Milestone Status Updater */}
          <StatusUpdater
            orderId={order.id}
            orderNumber={order.order_number}
            currentStatus={order.status}
          />

          {/* Client Details Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-vermilion" />
                Client Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Client Name:</span>
                <span className="font-semibold text-foreground">
                  {order.client_name || "Client"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Client Email:</span>
                <span className="font-mono text-[11px] text-foreground">
                  {order.client_email || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Preferred Contact:</span>
                <span className="font-semibold text-foreground">
                  {formatContactMethod(order.preferred_contact_method)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
