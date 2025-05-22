import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CreditCard, InsertCreditCard } from "@shared/schema";

export function useCreditCards(accountId: number) {
  return useQuery<CreditCard[]>({
    queryKey: ['/api/accounts', accountId, 'credit-cards'],
    enabled: !!accountId,
  });
}

export function useCreditCard(id: number) {
  return useQuery<CreditCard>({
    queryKey: ['/api/credit-cards', id],
    enabled: !!id,
  });
}

export function useCreateCreditCard(accountId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCreditCard) => {
      const response = await apiRequest('POST', `/api/accounts/${accountId}/credit-cards`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', accountId, 'credit-cards'] });
    },
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCreditCard> }) => {
      const response = await apiRequest('PATCH', `/api/credit-cards/${id}`, data);
      return response.json();
    },
    onSuccess: (creditCard: CreditCard) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', creditCard.accountId, 'credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards', creditCard.id] });
    },
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const creditCard = await queryClient.getQueryData<CreditCard>(['/api/credit-cards', id]);
      await apiRequest('DELETE', `/api/credit-cards/${id}`);
      return creditCard;
    },
    onSuccess: (creditCard) => {
      if (creditCard) {
        queryClient.invalidateQueries({ queryKey: ['/api/accounts', creditCard.accountId, 'credit-cards'] });
      }
    },
  });
}
