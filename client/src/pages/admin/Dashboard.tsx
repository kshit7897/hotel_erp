import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { DollarSign, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { orders, loading } = useOrders();

  const stats = useMemo(() => {
    if (!orders.length) return { total: 0, cash: 0, digital: 0, count: 0 };

    const today = new Date();
    const todaysOrders = orders.filter(o => {
      // Handle Firestore timestamp or serialized date
      const date = o.createdAt?.seconds 
        ? new Date(o.createdAt.seconds * 1000) 
        : new Date(o.createdAt);
      return isSameDay(date, today);
    });

    return todaysOrders.reduce((acc, order) => {
      acc.total += order.totalAmount;
      acc.count += 1;
      if (order.paymentMethod === "cash") acc.cash += order.totalAmount;
      else acc.digital += order.totalAmount;
      return acc;
    }, { total: 0, cash: 0, digital: 0, count: 0 });
  }, [orders]);

  const chartData = useMemo(() => {
    const data = [
      { name: "Cash", value: stats.cash },
      { name: "Digital", value: stats.digital },
    ];
    return data;
  }, [stats]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) return <div className="p-8 flex justify-center"><span className="loader">Loading stats...</span></div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of today's performance</p>
        </div>
        <div className="text-sm bg-secondary px-3 py-1 rounded-full font-medium">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sales" 
          value={`$${stats.total.toFixed(2)}`} 
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="+12% from yesterday"
        />
        <StatCard 
          title="Orders" 
          value={stats.count.toString()} 
          icon={<ShoppingBag className="h-4 w-4 text-blue-500" />}
          trend="+5 new orders"
        />
        <StatCard 
          title="Cash Sales" 
          value={`$${stats.cash.toFixed(2)}`} 
          icon={<Banknote className="h-4 w-4 text-green-500" />}
        />
        <StatCard 
          title="Digital Sales" 
          value={`$${stats.digital.toFixed(2)}`} 
          icon={<CreditCard className="h-4 w-4 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                Cash
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                Digital
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Order #{order.id?.slice(-4).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders today yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}
