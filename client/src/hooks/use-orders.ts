import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { Order, OrderStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOrders(filterStatus?: boolean) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let q;
    
    if (filterStatus) {
      // For kitchen: show only active orders
      q = query(
        collection(db, "orders"),
        where("status", "!=", "completed"),
        orderBy("status", "asc"),
        orderBy("createdAt", "asc")
      );
    } else {
      // For admin: show all orders (could limit to recent 50)
      q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamp to serializable format if needed, though for UI we use it directly
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast({
        title: "Connection Error",
        description: "Failed to sync orders. Please check your connection.",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterStatus, toast]);

  const createOrder = async (order: Omit<Order, "id" | "createdAt" | "status">) => {
    try {
      await addDoc(collection(db, "orders"), {
        ...order,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast({ title: "Order Placed", description: "Sent to kitchen successfully" });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
        updatedAt: serverTimestamp(),
      });
      // Optional: No toast for status updates to keep UI snappy, or use a small one
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { orders, loading, createOrder, updateOrderStatus };
}
