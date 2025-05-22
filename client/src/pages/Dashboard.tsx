import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import MetricsCards from "@/components/Dashboard/MetricsCards";
import ExpenseChart from "@/components/Dashboard/ExpenseChart";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import CreditCards from "@/components/Dashboard/CreditCards";
import TransactionModal from "@/components/Modals/TransactionModal";

export default function Dashboard() {
  const { currentAccount } = useAccount();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM format
  });

  if (!currentAccount) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conta...</p>
        </div>
      </div>
    );
  }

  const handlePreviousMonth = () => {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <Header 
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onAddTransaction={() => setIsTransactionModalOpen(true)}
        />
        
        <div className="p-8">
          <MetricsCards currentMonth={currentMonth} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <ExpenseChart currentMonth={currentMonth} />
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Categorias</h3>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <i className="fas fa-chart-pie text-4xl text-slate-400 mb-4"></i>
                    <p className="text-slate-600">Estatísticas por categoria</p>
                    <p className="text-sm text-slate-500 mt-1">Baseado nas transações do mês</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentTransactions />
            <CreditCards />
          </div>
        </div>
      </main>

      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  );
}
