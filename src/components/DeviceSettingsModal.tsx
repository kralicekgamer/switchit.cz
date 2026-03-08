import type { Device } from '../game/types';

interface DeviceSettingsModalProps {
  device: Device;
  onClose: () => void;
  onUpdate: (deviceId: string, key: string, value: any) => void;
}

export default function DeviceSettingsModal({ device, onClose, onUpdate }: DeviceSettingsModalProps) {
  if (!device.data || Object.keys(device.data).length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#212529]/40 backdrop-blur-sm" onClick={onClose}>
      {/* Zastavení propagace kliknutí na okno */}
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#e9ecef] w-[450px] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="px-6 py-4 bg-[#f8f9fa] border-b border-[#e9ecef] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#212529]">{device.name}</h2>
            <p className="text-xs text-[#868e96] uppercase tracking-wider">{device.type}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e9ecef] transition-colors text-[#495057]"
          >
            ✕
          </button>
        </header>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[65vh]">
          {/* Renderování IP/MAC infa na začátku pro realismus */}
          {(device.ip || device.mac || device.model) && (
            <div className="grid grid-cols-2 gap-3 mb-2 bg-[#f8f9fa] p-4 rounded-xl border border-[#e9ecef]">
              {device.model && <div className="flex flex-col"><span className="text-[10px] text-gray-400 uppercase font-bold">Model</span><span className="text-xs font-mono">{device.model}</span></div>}
              {device.ip && <div className="flex flex-col"><span className="text-[10px] text-gray-400 uppercase font-bold">IP Adresa</span><span className="text-xs font-mono">{device.ip}</span></div>}
              {device.mac && <div className="flex flex-col col-span-2 mt-1"><span className="text-[10px] text-gray-400 uppercase font-bold">MAC Adresa</span><span className="text-xs font-mono">{device.mac}</span></div>}
            </div>
          )}

          {/* Seskupení polí podle kategorií */}
          {['system', 'network', 'wifi', 'ports'].map(category => {
            const fields = Object.entries(device.data!).filter(([_, f]) => f.category === category);
            if (fields.length === 0) return null;

            return (
              <div key={category} className="flex flex-col gap-3">
                <h3 className="text-[10px] font-black text-[#adb5bd] uppercase tracking-widest px-1">{category}</h3>
                <div className={`
                    ${category === 'ports' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-3'}
                  `}>
                  {fields.map(([key, field]) => {
                    if (field.type === 'toggle') {
                      return (
                        <div key={key} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#e9ecef] shadow-sm hover:border-[#339af0] transition-all group">
                          <span className="font-semibold text-[13px] text-[#343a40] group-hover:text-[#212529] truncate">{field.label}</span>
                          <button
                            onClick={() => onUpdate(device.id, key, !field.value)}
                            className={`w-10 h-5.5 rounded-full relative transition-all duration-300 flex-shrink-0 ${field.value ? 'bg-[#40c057]' : 'bg-[#dee2e6]'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all duration-300 ${field.value ? 'left-[1.35rem]' : 'left-[3px]'}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                          </button>
                        </div>
                      );
                    }

                    if (field.type === 'select' && field.options) {
                      return (
                        <div key={key} className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-[#e9ecef] shadow-sm">
                          <label className="font-bold text-[10px] text-[#868e96] uppercase tracking-wider">{field.label}</label>
                          <select
                            value={field.value}
                            onChange={(e) => onUpdate(device.id, key, e.target.value)}
                            className="w-full bg-[#f8f9fa] border-none rounded-lg p-2 text-[13px] font-medium focus:ring-2 focus:ring-[#339af0]/20 outline-none transition-all cursor-pointer hover:bg-[#e9ecef]"
                          >
                            {field.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === 'info') {
                      return (
                        <div key={key} className="flex flex-col gap-1 p-1">
                          <span className="text-[9px] text-[#adb5bd] uppercase font-bold tracking-widest">{field.label}</span>
                          <div className="text-sm font-semibold text-[#495057] flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${field.value?.includes('Online') || field.value?.includes('Up') ? 'bg-green-500 animate-pulse' : 'bg-[#339af0]'}`}></div>
                            {field.value}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="px-6 py-4 bg-[#f8f9fa] border-t border-[#e9ecef] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#339af0] hover:bg-[#228be6] text-white px-6 py-2 rounded shadow-sm text-sm font-semibold transition-colors focus:ring-4 focus:ring-blue-100"
          >
            Uložit & Zavřít
          </button>
        </footer>
      </div>
    </div>
  );
}
