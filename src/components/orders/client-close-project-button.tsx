"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { closeOrderClientAction } from "@/app/actions/orders";

interface ClientCloseProjectButtonProps {
  orderNumber: string;
}

export function ClientCloseProjectButton({
  orderNumber,
}: ClientCloseProjectButtonProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (!confirm("Are you sure you want to approve all deliverables and close this project?")) {
      return;
    }

    setIsClosing(true);
    try {
      const res = await closeOrderClientAction(orderNumber);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.message || "Failed to close project.");
      }
    } catch (err: any) {
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Button
      onClick={handleClose}
      disabled={isClosing}
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-sm"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>{isClosing ? "Closing Project..." : "Approve & Complete Project"}</span>
    </Button>
  );
}
