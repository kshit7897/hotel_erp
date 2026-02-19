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

    // Simplified query to avoid index requirement errors locally
    // Fetch recent orders first
    q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc") // Show newest first generally
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      if (filterStatus) {
        // Client-side filtering for Kitchen Display
        // Filter out completed orders
        ordersData = ordersData.filter(o => o.status !== 'completed');

        // Custom sort: pending -> preparing -> ready -> (then by time)
        const statusPriority = { 'pending': 0, 'preparing': 1, 'ready': 2, 'completed': 3 };
        ordersData.sort((a, b) => {
          const statusDiff = (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
          if (statusDiff !== 0) return statusDiff;
          // If same status, older first (FIFO)
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        });
      }

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
