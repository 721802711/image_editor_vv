
import React, { useState } from 'react';
import Icon from '../Icon';
import type { IconStyle } from '../../types';

interface ThemeColors {
  appBg: string;
  panelBg: string;
  secondaryBg: string;
  accentColor: string;
  textColor: string;
}

interface SettingsModalProps {
  colors: ThemeColors;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  onReset: () => void;
  onClose: () => void;
  iconStyle: IconStyle;
  onIconStyleChange: (style: IconStyle) => void;
  iconWeight: number;
  onIconWeightChange: (weight: number) => void;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-medium text-[var(--color-text)] opacity-80">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[10px] opacity-50 font-mono text-[var(--color-text)] uppercase">{value}</span>
      <div className="relative w-6 h-6 overflow-hidden rounded-full border border-[var(--color-text)]/20 shadow-sm">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
          />
      </div>
    </div>
  </div>
);

const IconStyleButton: React.FC<{ styleId: IconStyle; current: IconStyle; label: string; onClick: (s: IconStyle) => void }> = ({ styleId, current, label, onClick }) => (
    <button 
        onClick={() => onClick(styleId)}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all
            ${current === styleId ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/50' : 'border-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--color-text)]/30'}
        `}
    >
        <div data-icon-style={styleId} className="mb-1 pointer-events-none">
             <Icon name="wand" className="w-5 h-5 text-[var(--color-text)]" />
        </div>
        <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text)] opacity-80">{label}</span>
    </button>
);

const AccordionItem: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-[var(--bg-secondary)] last:border-0">
        <button 
            onClick={onToggle} 
            className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
        >
            <span className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">{title}</span>
            <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                <Icon name="expand" className="w-4 h-4 text-[var(--color-text)] opacity-50" />
            </div>
        </button>
        {isOpen && (
            <div className="pb-6 animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ colors, onColorChange, onReset, onClose, iconStyle, onIconStyleChange, iconWeight, onIconWeightChange }) => {
  
  const [openSection, setOpenSection] = useState<'style' | 'colors'>('style');

  const styles: { id: IconStyle; label: string }[] = [
      { id: 'standard', label: 'Std' },
      { id: 'thin', label: 'Thin' },
      { id: 'bold', label: 'Bold' },
      { id: 'technical', label: 'Tech' },
      { id: 'sketch', label: 'Sketch' },
      { id: 'neon', label: 'Neon' },
      { id: 'soft', label: 'Soft' },
      { id: 'ink', label: 'Ink' },
      { id: 'thread', label: 'Thread' },
      { id: 'block', label: 'Block' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] w-[400px] rounded-2xl p-0 shadow-2xl border border-[var(--bg-secondary)] max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bg-secondary)] bg-[var(--bg-panel)]">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Interface Settings</h2>
          <button onClick={onClose} className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
            
            {/* Icon Style Section */}
            <AccordionItem 
                title="Icon Style" 
                isOpen={openSection === 'style'} 
                onToggle={() => setOpenSection(openSection === 'style' ? 'colors' : 'style')}
            >
                <div className="flex flex-col items-center justify-center mb-6 space-y-2 bg-[var(--bg-secondary)]/30 rounded-xl p-6 border border-[var(--bg-secondary)]/50">
                    <Icon name="pencil" className="w-16 h-16 text-[var(--color-text)] mb-2 transition-all duration-300" />
                    <div className="w-full px-4">
                        <div className="flex items-center justify-between mb-2 text-xs text-[var(--color-text)] font-medium opacity-60">
                            <span>Weight</span>
                            <span>{iconWeight.toFixed(1)}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="4" 
                            step="0.1" 
                            value={iconWeight} 
                            onChange={(e) => onIconWeightChange(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] hover:accent-opacity-90"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {styles.map(s => (
                        <div key={s.id} className="contents">
                            <IconStyleButton 
                                styleId={s.id} 
                                current={iconStyle} 
                                label={s.label} 
                                onClick={onIconStyleChange} 
                            />
                        </div>
                    ))}
                </div>
            </AccordionItem>

            {/* Colors Section */}
            <AccordionItem 
                title="Colors" 
                isOpen={openSection === 'colors'} 
                onToggle={() => setOpenSection(openSection === 'colors' ? 'style' : 'colors')}
            >
                <div className="space-y-1">
                    <ColorInput label="Background" value={colors.appBg} onChange={(v) => onColorChange('appBg', v)} />
                    <ColorInput label="Panel Background" value={colors.panelBg} onChange={(v) => onColorChange('panelBg', v)} />
                    <ColorInput label="Secondary Background" value={colors.secondaryBg} onChange={(v) => onColorChange('secondaryBg', v)} />
                    <ColorInput label="Accent Color" value={colors.accentColor} onChange={(v) => onColorChange('accentColor', v)} />
                    <ColorInput label="Text Color" value={colors.textColor} onChange={(v) => onColorChange('textColor', v)} />
                </div>
            </AccordionItem>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--bg-secondary)] bg-[var(--bg-panel)] flex gap-3">
           <button 
            onClick={onReset}
            className="flex-1 h-10 rounded-lg border border-[var(--bg-secondary)] text-[var(--color-text)] hover:bg-[var(--bg-secondary)] transition-colors text-xs font-bold uppercase tracking-wide"
          >
            Reset Defaults
          </button>
          <button 
            onClick={onClose}
            className="flex-1 h-10 rounded-lg bg-[var(--color-accent)] text-black font-bold hover:opacity-90 transition-opacity text-xs uppercase tracking-wide"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
