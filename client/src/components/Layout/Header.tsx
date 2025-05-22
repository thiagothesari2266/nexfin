import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/contexts/AccountContext";

interface HeaderProps {
  currentMonth: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddTransaction: () => void;
}

export default function Header({ 
  currentMonth, 
  onPreviousMonth, 
  onNextMonth, 
  onAddTransaction 
}: HeaderProps) {
  const { currentAccount } = useAccount();

  const formatMonth = (month: string) => {
    const date = new Date(month + "-01");
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Financeiro</h1>
          <p className="text-slate-600 mt-1">
            Visão geral da conta <span className="font-medium">{currentAccount?.name}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onPreviousMonth}
              className="p-2 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </Button>
            <span className="font-medium text-slate-900 min-w-32 text-center">
              {formatMonth(currentMonth)}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNextMonth}
              className="p-2 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
          
          <Button 
            onClick={onAddTransaction}
            className="bg-primary text-white hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>
    </header>
  );
}
