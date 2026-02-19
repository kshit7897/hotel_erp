import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CreateStaffRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateStaff() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateStaffRequest) => {
      const res = await fetch(api.staff.create.path, {
        method: api.staff.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create staff");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff Created",
        description: "New staff member has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
