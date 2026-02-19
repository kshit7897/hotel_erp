import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  mode: "admin" | "pos";
  onAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({ product, mode, onAdd, onEdit, onDelete }: ProductCardProps) {
  // Static image mapping based on category for visual appeal
  const getImage = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "burger": return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60";
      case "pizza": return "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60";
      case "drink": return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=60";
      case "dessert": return "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=500&q=60";
      default: return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg group h-full flex flex-col",
      !product.available && "opacity-60 grayscale"
    )}>
      <div className="relative h-32 w-full overflow-hidden">
        {/* Descriptive alt text for accessibility */}
        <img 
          src={getImage(product.category)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full">
          ${product.price.toFixed(2)}
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-display font-bold text-lg leading-tight mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {mode === "pos" ? (
          <Button 
            className="w-full" 
            onClick={() => onAdd?.(product)}
            disabled={!product.available}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Order
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onEdit?.(product)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete?.(product)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
