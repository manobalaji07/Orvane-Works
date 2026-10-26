"use client";

import React, { useState } from "react";
import { Activity, Shield, Filter, Calendar, User, Search } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import type { AuditLogItem } from "@/lib/data/admin";

interface AuditClientProps {
  initialLogs: AuditLogItem[];
}

export function AuditClient({ initialLogs }: AuditClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const actions = [
    "ALL",
    "ORDER_CREATED",
    "QUOTE_ISSUED",
    "ORDER_ASSIGNED",
    "EMPLOYEE_APPROVED",
    "EMPLOYEE_PROFILE_UPDATED",
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    const matchesSearch =
      search === "" ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_name &&
        log.actor_name.toLowerCase().includes(search.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, or entity..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {actions.map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                filterAction === act
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-vermilion" />
              Chronological Audit Trail ({filteredLogs.length})
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Tamper-Evident System Log
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Every administrative authorization, status transition, quote revision, and approval event is permanently recorded.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No audit log entries match the selected filter.
              </div>
            ) : (
              paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        on {log.entity_type} ({log.entity_id})
                      </span>
                    </div>

                    <p className="text-muted-foreground text-[11px]">
                      Triggered by: <strong className="text-foreground">{log.actor_name || "System"}</strong>{" "}
                      {log.actor_email && `(${log.actor_email})`}
                    </p>

                    {Object.keys(log.metadata).length > 0 && (
                      <div className="p-2 rounded bg-muted/40 text-[10px] text-muted-foreground font-mono">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground shrink-0 font-sans">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-sans">
              <span>
                Page {currentPage} of {totalPages} ({filteredLogs.length} events)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-sans"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-sans"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
