import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Account } from '@shared/schema';

interface AccountContextType {
  currentAccount: Account | null;
  accounts: Account[];
  setCurrentAccount: (account: Account) => void;
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['/api/accounts'],
  });

  // Set the first account as current if none is selected
  useEffect(() => {
    if (accounts.length > 0 && !currentAccount) {
      setCurrentAccount(accounts[0]);
    }
  }, [accounts, currentAccount]);

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        accounts,
        setCurrentAccount,
        isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
