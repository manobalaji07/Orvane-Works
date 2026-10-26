import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Upload,
  ArrowUpRight,
  FolderKanban,
  Calendar,
  MessageSquare,
  AlertCircle,
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
import { getClientOrders } from "@/lib/data/orders";
import { formatDate, formatContactMethod } from "@/lib/utils";

export default async function EmployeeDashboardPage() {
  const allOrders = await getClientOrders();
  // Filter for orders relevant to the employee
  const assignedOrders = allOrders.filter(
    (o) => o.status !== "closed" && o.status !== "cancelled"
  );
  const upcomingDeadlines = assignedOrders.filter(
    (o) => o.status === "in_progress" || o.status === "awaiting_feedback"
  );

  return (
    <div className="container py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Employee Hub
            </h1>
            <Badge variant="accent">Approved Specialist</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage assigned studio projects, advance deliverable milestones, and keep your public studio profile up-to-date.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/employee/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <UserCheck className="w-4 h-4" />
              Public Profile Editor
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Assigned Orders
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">
              {assignedOrders.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active engineering queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Active Milestones
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-vermilion">
              {upcomingDeadlines.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In progress &amp; awaiting feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Unread Messages
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All client threads cleared</p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            My Assigned Projects ({assignedOrders.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Madurai Engineering Roster
          </span>
        </div>

        {assignedOrders.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-display font-semibold text-foreground text-lg">
                No orders currently assigned
              </h3>
              <p className="text-xs text-muted-foreground">
                You will be assigned to new client projects as orders matching your specializations come in.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignedOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:border-primary/40 transition-colors shadow-sm overflow-hidden"
              >
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        {order.order_number}
                      </span>
                      <StatusChip status={order.status} />
                      <Badge variant="outline" className="text-[10px]">
                        {order.service_title}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        Payment: {order.payment_status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg hover:text-vermilion transition-colors">
                      <Link href={`/employee/orders/${order.order_number}`}>
                        {order.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="text-xs line-clamp-2 max-w-2xl">
                      {order.project_brief}
                    </CardDescription>
                  </div>

                  <Link href={`/employee/orders/${order.order_number}`}>
                    <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-vermilion-700 dark:hover:bg-vermilion-500 font-medium text-xs">
                      <Upload className="w-4 h-4" />
                      Manage &amp; Upload
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="pt-0 border-t border-border/60 bg-muted/10 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      Deadline: {formatDate(order.target_deadline)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-vermilion" />
                      Contact via {formatContactMethod(order.preferred_contact_method)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
