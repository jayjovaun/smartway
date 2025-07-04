import React from 'react';
import { motion } from 'framer-motion';
import { FiList, FiCreditCard, FiHelpCircle } from 'react-icons/fi';

export type TabType = 'summary' | 'flashcards' | 'quiz';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'summary' as TabType, label: 'Summary', icon: FiList },
  { id: 'flashcards' as TabType, label: 'Flashcards', icon: FiCreditCard },
  { id: 'quiz' as TabType, label: 'Quiz', icon: FiHelpCircle },
];

export const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="d-flex gap-2 p-1 bg-dark-700 rounded-lg mb-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-md fw-medium transition-all ${
              isActive
                ? 'btn-accent-indigo text-white shadow'
                : 'btn-outline-secondary text-muted'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="me-2" />
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}; 