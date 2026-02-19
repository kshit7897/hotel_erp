import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@shared/schema";
import { Clock, CheckCircle2, ChefHat, PlayCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function KitchenDisplay() {
  const { orders, updateOrderStatus } = useOrders(true); // true = active only

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "preparing": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "ready": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Kitchen Display</h1>
          <p className="text-muted-foreground">Live incoming orders</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {orders.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <ChefHat className="h-24 w-24 mb-4" />
            <h2 className="text-2xl font-bold">All caught up!</h2>
            <p>Waiting for new orders...</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={(status) => updateOrderStatus(order.id!, status)}
              statusColor={getStatusColor(order.status)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAction,
  statusColor
}: {
  order: Order;
  onAction: (status: OrderStatus) => void;
  statusColor: string;
}) {

  const timeAgo = order.createdAt?.seconds
    ? formatDistanceToNow(new Date(order.createdAt.seconds * 1000), { addSuffix: true })
    : "Just now";

  return (
    <Card className="flex flex-col h-full border-2 overflow-hidden shadow-md animate-in zoom-in-95 duration-300">
      <CardHeader className={`pb-3 border-b ${statusColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">#{order.id?.slice(-4).toUpperCase()}</CardTitle>
            <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
          <Badge variant="outline" className="bg-white/50 backdrop-blur border-0 capitalize">
            {order.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold bg-muted w-6 h-6 flex items-center justify-center rounded-full text-xs">
                  {item.quantity}x
                </span>
                <span className="font-medium">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-3 bg-muted/10 border-t flex gap-2">
        {order.status === 'pending' && (
          <Button
            className="w-full gap-2 font-bold bg-yellow-500 hover:bg-yellow-600 text-white"
            size="lg"
            onClick={() => onAction('preparing')}
          >
            <ChefHat className="h-5 w-5" />
            Start Preparing
          </Button>
        )}

        {order.status === 'preparing' && (
          <Button
            className="w-full gap-2 font-bold bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
            onClick={() => onAction('ready')}
          >
            <CheckCircle2 className="h-5 w-5" />
            Mark Ready
          </Button>
        )}

        {order.status === 'ready' && (
          <Button
            className="w-full gap-2 font-bold bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={() => onAction('completed')}
          >
            <PlayCircle className="h-5 w-5" />
            Complete Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
