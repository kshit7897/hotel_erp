import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { DollarSign, CreditCard, Banknote, ShoppingBag, CalendarDays } from "lucide-react";
import { format, isSameDay, isSameWeek, isSameMonth, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { useMemo, useState } from "react";

export default function AdminDashboard() {
  const { orders, loading } = useOrders();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  // Filter orders based on selected time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const date = o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000)
        : new Date(o.createdAt || now);

      if (timeRange === 'day') return isSameDay(date, now);
      if (timeRange === 'week') return isSameWeek(date, now);
      if (timeRange === 'month') return isSameMonth(date, now);
      return false;
    });
  }, [orders, timeRange]);

  // Calculate Comparison (Previous Period)
  const previousStats = useMemo(() => {
    const now = new Date();
    let pastDate = subDays(now, 1);
    if (timeRange === 'week') pastDate = subWeeks(now, 1);
    if (timeRange === 'month') pastDate = subMonths(now, 1);

    const pastOrders = orders.filter(o => {
      const date = o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000)
        : new Date(o.createdAt || now);

      if (timeRange === 'day') return isSameDay(date, pastDate);
      if (timeRange === 'week') return isSameWeek(date, pastDate);
      if (timeRange === 'month') return isSameMonth(date, pastDate);
      return false;
    });

    return pastOrders.reduce((acc, order) => {
      acc.total += order.totalAmount;
      acc.count += 1;
      return acc;
    }, { total: 0, count: 0 });
  }, [orders, timeRange]);

  // Current Stats
  const stats = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      acc.total += order.totalAmount;
      acc.count += 1;
      if (order.paymentMethod === "cash") acc.cash += order.totalAmount;
      else acc.digital += order.totalAmount;
      return acc;
    }, { total: 0, cash: 0, digital: 0, count: 0 });
  }, [filteredOrders]);

  // Calculate Trends
  const salesTrend = previousStats.total > 0
    ? ((stats.total - previousStats.total) / previousStats.total) * 100
    : 0;

  const ordersTrend = previousStats.count > 0
    ? stats.count - previousStats.count
    : 0;

  const chartData = [
    { name: "Cash", value: stats.cash },
    { name: "Digital", value: stats.digital },
  ];

  const COLORS = ["#10b981", "#8b5cf6"]; // Green for Cash, Purple for Digital

  if (loading) return <div className="p-8 flex justify-center"><span className="loader">Loading stats...</span></div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview for {timeRange === 'day' ? "Today" : timeRange === 'week' ? "This Week" : "This Month"}
          </p>
        </div>

        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={timeRange === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('day')}
          >
            Today
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={`₹${stats.total.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend={salesTrend !== 0 ? `${salesTrend > 0 ? '+' : ''}${salesTrend.toFixed(1)}% vs last ${timeRange}` : "No past data"}
          trendColor={salesTrend >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Orders"
          value={stats.count.toString()}
          icon={<ShoppingBag className="h-4 w-4 text-blue-500" />}
          trend={ordersTrend !== 0 ? `${ordersTrend > 0 ? '+' : ''}${ordersTrend} vs last ${timeRange}` : "No past data"}
          trendColor={ordersTrend >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Cash Sales"
          value={`₹${stats.cash.toFixed(2)}`}
          icon={<Banknote className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Digital Sales"
          value={`₹${stats.digital.toFixed(2)}`}
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] relative">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No sales data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {filteredOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Order #{order.id?.slice(-4).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • <span className="capitalize">{order.paymentMethod}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders found for this period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendColor
}: {
  title: string,
  value: string,
  icon: any,
  trend?: string,
  trendColor?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trendColor || "text-muted-foreground"}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
