
import React from 'react';
import Icon from '../Icon';

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
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70 font-mono text-[var(--color-text)] uppercase">{value}</span>
      <div className="relative w-8 h-8 overflow-hidden rounded border border-[var(--color-text)]/20">
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

const SettingsModal: React.FC<SettingsModalProps> = ({ colors, onColorChange, onReset, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] w-80 rounded-xl p-6 shadow-2xl border border-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-6 border-b border-[var(--bg-secondary)] pb-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Theme Settings</h2>
          <button onClick={onClose} className="text-[var(--color-text)] hover:opacity-70">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <ColorInput label="Background Color" value={colors.appBg} onChange={(v) => onColorChange('appBg', v)} />
        <ColorInput label="Main Tone" value={colors.panelBg} onChange={(v) => onColorChange('panelBg', v)} />
        <ColorInput label="Secondary / Input" value={colors.secondaryBg} onChange={(v) => onColorChange('secondaryBg', v)} />
        <ColorInput label="Accent Color" value={colors.accentColor} onChange={(v) => onColorChange('accentColor', v)} />
        <ColorInput label="Text / Icon Color" value={colors.textColor} onChange={(v) => onColorChange('textColor', v)} />

        <div className="mt-6 pt-4 border-t border-[var(--bg-secondary)] flex gap-3">
           <button 
            onClick={onReset}
            className="flex-1 py-2 px-4 rounded-lg border border-[var(--bg-secondary)] text-[var(--color-text)] hover:bg-[var(--bg-secondary)] transition-colors text-xs font-medium"
          >
            Reset Defaults
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg bg-[var(--color-accent)] text-black font-bold hover:opacity-90 transition-opacity text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
