import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBookOpen, FiCreditCard, FiHelpCircle } from 'react-icons/fi';

export type TabType = 'summary' | 'flashcards' | 'quiz';

interface TabSelectorProps {
  activeTab: TabType;
  totalFlashcards?: number;
  totalQuestions?: number;
}

const tabs = [
  { id: 'summary' as TabType, label: 'Summary', icon: FiBookOpen, path: '/summary' },
  { id: 'flashcards' as TabType, label: 'Flashcards', icon: FiCreditCard, path: '/flashcards' },
  { id: 'quiz' as TabType, label: 'Quiz', icon: FiHelpCircle, path: '/quiz' },
];

export const TabSelector: React.FC<TabSelectorProps> = ({ 
  activeTab, 
  totalFlashcards = 0,
  totalQuestions = 0 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (tab: TabType) => {
    const targetTab = tabs.find(t => t.id === tab);
    if (targetTab) {
      // Navigate to the target page while preserving the state
      navigate(targetTab.path, { state: location.state });
    }
  };

  const getTabCount = (tabId: TabType) => {
    switch (tabId) {
      case 'flashcards':
        return totalFlashcards > 0 ? `(${totalFlashcards})` : '';
      case 'quiz':
        return totalQuestions > 0 ? `(${totalQuestions})` : '';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {/* Sticky container for mobile */}
      <div 
        className="position-sticky" 
        style={{ top: '80px', zIndex: 100 }}
      >
        <div 
          className="d-flex gap-1 p-2 mx-auto"
          style={{
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: 'fit-content'
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`btn d-flex align-items-center gap-2 px-3 py-2 fw-semibold transition-all position-relative ${
                  isActive ? 'text-white' : 'text-bright-muted'
                }`}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, #6366F1, #7C3AED)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  minWidth: '100px',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -1,
                  background: isActive 
                    ? 'linear-gradient(135deg, #6366F1, #7C3AED)' 
                    : 'rgba(99, 102, 241, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={16} />
                <span className="d-none d-sm-inline">{tab.label}</span>
                <span className="d-inline d-sm-none">
                  {tab.id === 'summary' ? 'Sum' : 
                   tab.id === 'flashcards' ? 'Cards' : 'Quiz'}
                </span>
                {count && <span className="small opacity-75">{count}</span>}
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    style={{
                      width: '20px',
                      height: '2px',
                      background: 'white',
                      borderRadius: '1px',
                      bottom: '-1px'
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}; 