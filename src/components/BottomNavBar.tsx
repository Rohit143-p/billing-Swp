import React from 'react';
import { LayoutGrid, Receipt, BarChart3, Wallet, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-5 h-5" />
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <Receipt className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'menu',
      label: 'Config',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg md:hidden pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-center px-1.5 py-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer relative min-h-[44px] ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
