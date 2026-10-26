"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
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
import { StatusChip } from "@/components/ui/status-chip";
import { formatINR, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/data/orders";

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.client_name &&
        order.client_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statuses: { label: string; value: string }[] = [
    { label: "All Orders", value: "all" },
    { label: "Submitted", value: "submitted" },
    { label: "In Review", value: "in_review" },
    { label: "Quote Sent", value: "quote_sent" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in_progress" },
    { label: "Awaiting Feedback", value: "awaiting_feedback" },
    { label: "Delivered", value: "delivered" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, project title, or client..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterStatus === s.value
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <FolderKanban className="w-8 h-8 mx-auto stroke-1" />
              <p className="font-semibold text-foreground">No orders match filter criteria</p>
              <p>Try resetting the search query or status filter.</p>
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {order.order_number}
                    </span>
                    <StatusChip status={order.status} />
                    <Badge variant="outline" className="text-[10px]">
                      {order.service_title}
                    </Badge>
                  </div>

                  <Link
                    href={`/admin/orders/${order.order_number}`}
                    className="font-semibold text-base text-foreground hover:text-vermilion block"
                  >
                    {order.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Client: <strong className="text-foreground">{order.client_name || "Client"}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-vermilion" />
                      Assigned: {order.preferred_employee_name || "Unassigned"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Target: {formatDate(order.target_deadline)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">
                      {order.quote_amount_inr ? "Quote Issued" : "Client Budget"}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {order.quote_amount_inr
                        ? formatINR(order.quote_amount_inr)
                        : `${formatINR(order.budget_min_inr)} - ${formatINR(order.budget_max_inr)}`}
                    </span>
                  </div>

                  <Link href={`/admin/orders/${order.order_number}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 font-medium">
                      Manage Order
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
