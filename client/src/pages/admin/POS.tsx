import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, OrderItem, PaymentMethod } from "@shared/schema";
import { Search, Trash2, Plus, Minus, CreditCard, Banknote, ShoppingBag } from "lucide-react";

export default function POS() {
  const { products, loading } = useProducts();
  const { createOrder } = useOrders();

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id!,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!cart.length) return;
    setIsProcessing(true);
    try {
      await createOrder({
        items: cart,
        totalAmount: total,
        paymentMethod
      });
      setCart([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto h-[calc(100vh-64px)] p-4 flex gap-4">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                mode="pos"
                onAdd={addToCart}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Sidebar */}
      <Card className="w-96 flex flex-col shadow-xl border-l h-full">
        <CardHeader className="pb-4 border-b">
          <CardTitle>Current Order</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <ShoppingBag className="mx-auto h-12 w-12 mb-2 opacity-20" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Select items to start order</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive ml-1" onClick={() => removeFromCart(item.productId)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t p-4 bg-muted/10">
          <div className="flex justify-between w-full text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant={paymentMethod === "cash" ? "default" : "outline"}
              onClick={() => setPaymentMethod("cash")}
              className="gap-2"
            >
              <Banknote className="h-4 w-4" />
              Cash
            </Button>
            <Button
              variant={paymentMethod === "digital" ? "default" : "outline"}
              onClick={() => setPaymentMethod("digital")}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Digital
            </Button>
          </div>

          <Button
            className="w-full py-6 text-lg"
            size="lg"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? "Processing..." : "Confirm Order"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
