import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['↑', '↓'], description: 'Navigate between results', category: 'Navigation' },
  { keys: ['Enter'], description: 'Open symbol details', category: 'Navigation' },
  { keys: ['Space'], description: 'Select/deselect symbol', category: 'Navigation' },
  { keys: ['Esc'], description: 'Clear filters / close modal', category: 'Navigation' },
  { keys: ['Tab'], description: 'Switch between controls', category: 'Navigation' },
  
  // Actions
  { keys: ['Ctrl', 'S'], description: 'Run deep scan', category: 'Actions' },
  { keys: ['Ctrl', 'Q'], description: 'Run quick scan', category: 'Actions' },
  { keys: ['Ctrl', 'E'], description: 'Export results', category: 'Actions' },
  { keys: ['Ctrl', 'F'], description: 'Focus on search', category: 'Actions' },
  { keys: ['Ctrl', 'A'], description: 'Select all results', category: 'Actions' },
  { keys: ['Ctrl', 'D'], description: 'Deselect all', category: 'Actions' },
  
  // View Modes
  { keys: ['1'], description: 'List view', category: 'Views' },
  { keys: ['2'], description: 'Grid view', category: 'Views' },
  { keys: ['3'], description: 'Chart view', category: 'Views' },
  
  // Filters
  { keys: ['F'], description: 'Open advanced filters', category: 'Filters' },
  { keys: ['B'], description: 'Bullish symbols only', category: 'Filters' },
  { keys: ['N'], description: 'Bearish symbols only', category: 'Filters' },
  { keys: ['R'], description: 'Reset filters', category: 'Filters' },
  
  // Help
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-slate-400 mt-1">
                Use these shortcuts to boost your scanning efficiency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                  {category}
                </h3>
                <div className="space-y-2">
                  {SHORTCUTS.filter(s => s.category === category).map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                    >
                      <span className="text-slate-300 text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-white shadow-sm min-w-[2rem] text-center">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-slate-500 text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
            <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
              💡 Tips
            </h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Make sure the page has focus before using shortcuts</li>
              <li>• In list view, use arrow keys to navigate between results</li>
              <li>• To select multiple symbols, press Space on each one</li>
              <li>• Ctrl+S works like clicking the "Deep Scan" button</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-between bg-slate-900/50">
          <div className="text-xs text-slate-400">
            To print this guide: <kbd className="px-2 py-1 bg-slate-700 rounded text-white">Ctrl+P</kbd>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsPanel;
