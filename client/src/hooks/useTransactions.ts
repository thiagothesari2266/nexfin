import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction, InsertTransaction, TransactionWithCategory } from "@shared/schema";

export function useTransactions(accountId: number, options?: { limit?: number; startDate?: string; endDate?: string }) {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  
  const queryString = params.toString();
  const url = `/api/accounts/${accountId}/transactions${queryString ? `?${queryString}` : ''}`;

  return useQuery<TransactionWithCategory[]>({
    queryKey: ['/api/accounts', accountId, 'transactions', options],
    enabled: !!accountId,
  });
}

export function useTransaction(id: number) {
  return useQuery<TransactionWithCategory>({
    queryKey: ['/api/transactions', id],
    enabled: !!id,
  });
}

export function useCreateTransaction(accountId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const response = await apiRequest('POST', `/api/accounts/${accountId}/transactions`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', accountId] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTransaction> }) => {
      const response = await apiRequest('PATCH', `/api/transactions/${id}`, data);
      return response.json();
    },
    onSuccess: (transaction: Transaction) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', transaction.accountId] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', transaction.id] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const transaction = await queryClient.getQueryData<TransactionWithCategory>(['/api/transactions', id]);
      await apiRequest('DELETE', `/api/transactions/${id}`);
      return transaction;
    },
    onSuccess: (transaction) => {
      if (transaction) {
        queryClient.invalidateQueries({ queryKey: ['/api/accounts', transaction.accountId] });
      }
    },
  });
}
