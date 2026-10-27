"use client";

import React, { useState } from "react";
import { MessageSquare, Send, AlertCircle, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { postOrderMessageAction } from "@/app/actions/orders";
import { formatDate } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants/site";
import type { OrderMessage } from "@/lib/data/orders";

interface MessageThreadProps {
  orderId: string;
  orderNumber: string;
  initialMessages: OrderMessage[];
}

export function MessageThread({
  orderId,
  orderNumber,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<OrderMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const whatsappChatUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${SITE_CONFIG.name}, regarding project #${orderNumber}: `
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("order_number", orderNumber);
    formData.append("content", content);

    try {
      const res = await postOrderMessageAction(null, formData);
      if (res && !res.success) {
        setErrorMessage(res.message || "Failed to deliver message.");
      } else {
        const newMsg: OrderMessage = {
          id: `temp-${Date.now()}`,
          order_id: orderId,
          sender_id: "me",
          sender_name: "You",
          sender_role: "client",
          content: content.trim(),
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setContent("");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-vermilion" />
              Project Discussion Thread
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Real-time chat with the engineering team for order #{orderNumber}.
          </CardDescription>
        </div>

        {/* WhatsApp Switch Option */}
        <a
          href={whatsappChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 border-[#25D366]/40 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/10"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            <span>Chat on WhatsApp</span>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
          </Button>
        </a>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Messages List Container - cohesive and scrollable */}
        <div className="space-y-3 min-h-[140px] max-h-[360px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto stroke-1 text-muted-foreground/60" />
              <p className="font-medium text-foreground">No messages in this project thread yet.</p>
              <p className="text-[11px] text-muted-foreground">
                Type a message below or click &quot;Chat on WhatsApp&quot; above to reach the founders instantly.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isClient = msg.sender_role === "client";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1 ${
                    isClient ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
                    <span className="font-semibold text-foreground">
                      {msg.sender_name}
                    </span>
                    <Badge
                      variant={isClient ? "outline" : "secondary"}
                      className="text-[9px] h-4 px-1"
                    >
                      {isClient ? "Client" : SITE_CONFIG.name}
                    </Badge>
                    <span>• {formatDate(msg.created_at)}</span>
                  </div>

                  <div
                    className={`p-3 rounded-lg max-w-[85%] text-xs leading-relaxed ${
                      isClient
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground border border-border rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose Input Form - tightly joined to the thread */}
        <form onSubmit={handleSubmit} className="space-y-2 pt-3 border-t border-border">
          {errorMessage && (
            <div className="text-xs text-destructive flex items-center gap-1.5 pb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question, request an update, or send feedback to the team..."
              rows={2}
              className="resize-none text-xs bg-background"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="h-auto px-4 bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
            <span>Messages notify the student engineering team via real-time studio inbox and email.</span>
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              WhatsApp <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
