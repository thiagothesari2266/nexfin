import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Category, InsertCategory } from "@shared/schema";

export function useCategories(accountId: number) {
  return useQuery({
    queryKey: ["/api/categories", accountId],
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${accountId}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Category[];
    },
    enabled: !!accountId,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ["/api/categories", id],
    queryFn: async () => {
      const response = await apiRequest(`/api/categories/${id}`);
      return response as Category;
    },
    enabled: !!id,
  });
}

export function useCreateCategory(accountId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await fetch(`/api/accounts/${accountId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json() as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", accountId] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }) => {
      const response = await apiRequest(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response as Category;
    },
    onSuccess: (category: Category) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", category.accountId] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}