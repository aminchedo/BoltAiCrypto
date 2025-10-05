import React, { useState } from 'react';
import { Zap, Shield, Settings, Save, Download, Upload, Check } from 'lucide-react';
import { store } from '../../state/store';

interface WeightPresetsPanelProps {
  onUpdate?: () => void;
}

const WeightPresetsPanel: React.FC<WeightPresetsPanelProps> = ({ onUpdate }) => {
  const [selectedPreset, setSelectedPreset] = useState<'custom' | 'aggressive' | 'conservative'>('custom');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const presets = [
    {
      id: 'aggressive' as const,
      name: 'تهاجمی',
      description: 'برای معامله‌گران پرریسک',
      icon: Zap,
      color: 'from-red-500 to-orange-500',
      action: () => {
        store.loadAggressivePreset();
        setSelectedPreset('aggressive');
        onUpdate?.();
      }
    },
    {
      id: 'conservative' as const,
      name: 'محافظه‌کارانه',
      description: 'برای معامله‌گران کم‌ریسک',
      icon: Shield,
      color: 'from-emerald-500 to-green-500',
      action: () => {
        store.loadConservativePreset();
        setSelectedPreset('conservative');
        onUpdate?.();
      }
    },
    {
      id: 'custom' as const,
      name: 'سفارشی',
      description: 'تنظیمات دلخواه شما',
      icon: Settings,
      color: 'from-cyan-500 to-blue-500',
      action: () => {
        setSelectedPreset('custom');
      }
    }
  ];

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await store.saveWeightsToBackend();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save weights:', error);
      alert('خطا در ذخیره‌سازی وزن‌ها در سرور');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromBackend = async () => {
    try {
      await store.loadWeightsFromBackend();
      setSelectedPreset('custom');
      onUpdate?.();
      alert('وزن‌ها از سرور بارگذاری شد');
    } catch (error) {
      console.error('Failed to load weights:', error);
      alert('خطا در بارگذاری وزن‌ها از سرور');
    }
  };

  const handleExport = () => {
    try {
      const config = store.exportConfig();
      const dataBlob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hts-config-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export config:', error);
      alert('خطا در خروجی گرفتن تنظیمات');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        store.importConfig(json);
        setSelectedPreset('custom');
        onUpdate?.();
        alert('تنظیمات با موفقیت وارد شد');
      } catch (error) {
        console.error('Failed to import config:', error);
        alert('فایل نامعتبر است یا فرمت آن اشتباه است');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Preset Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedPreset === preset.id;
          
          return (
            <button
              key={preset.id}
              onClick={preset.action}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-3">
                <div className={`
                  w-16 h-16 rounded-2xl bg-gradient-to-br ${preset.color}
                  flex items-center justify-center shadow-lg
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {preset.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Save to Backend */}
        <button
          onClick={handleSaveToBackend}
          disabled={isSaving}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
            ${saveSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>ذخیره شد</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره در سرور'}</span>
            </>
          )}
        </button>

        {/* Load from Backend */}
        <button
          onClick={handleLoadFromBackend}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg font-medium transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>بارگذاری از سرور</span>
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          <span>خروجی JSON</span>
        </button>

        {/* Import */}
        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg font-medium transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>ورودی JSON</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Info Card */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">💡 راهنما</h4>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>• <strong>تهاجمی:</strong> تمرکز بر SMC و Price Action، حداقل اعتبار پایین‌تر</li>
          <li>• <strong>محافظه‌کارانه:</strong> تمرکز بر Harmonic و Elliott، حداقل اعتبار بالاتر</li>
          <li>• <strong>سفارشی:</strong> وزن‌ها را به دلخواه خود تنظیم کنید</li>
          <li>• <strong>ذخیره در سرور:</strong> وزن‌های فعلی را در بکند ذخیره می‌کند</li>
          <li>• <strong>خروجی/ورودی:</strong> تمام تنظیمات شامل وزن‌ها، نمادها و بازه‌های زمانی</li>
        </ul>
      </div>
    </div>
  );
};

export default WeightPresetsPanel;
