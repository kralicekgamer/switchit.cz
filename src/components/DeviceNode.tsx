import type { Device } from '../game/types';

interface DeviceNodeProps {
  device: Device;
  onPortClick: (deviceId: string, portId: string) => void;
  selectedPort: { deviceId: string, portId: string } | null;
  onOpenSettings?: (device: Device) => void;
  connectedPorts?: string[];
}

export default function DeviceNode({ device, onPortClick, selectedPort, onOpenSettings, connectedPorts }: DeviceNodeProps) {
  const hasSettings = (device.data && Object.keys(device.data).length > 0) || device.type === 'internet';
  const isSelected = selectedPort?.deviceId === device.id;

  // Internet type has a special circular look
  if (device.type === 'internet') {
    return (
      <div 
        className={`absolute w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-lg flex-col text-3xl transition-all
          ${isSelected ? 'border-[#339af0] bg-blue-50 scale-110 z-20' : 'border-[#dee2e6] bg-white hover:border-[#adb5bd]'}`}
        style={{ left: `${device.position.x}%`, top: `${device.position.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        ☁️
        <div className="text-[10px] font-black mt-1 text-[#adb5bd] uppercase">INTERNET</div>
        <div className="flex gap-2 mt-2">
           {device.ports.map(p => {
             const isPortConnected = connectedPorts?.includes(p.id);
             const isPortSelected = selectedPort?.deviceId === device.id && selectedPort?.portId === p.id;
             return (
               <div 
                 key={p.id} 
                 className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all
                   ${isPortSelected ? 'bg-[#339af0] border-[#339af0] scale-125' : 
                     isPortConnected ? 'bg-[#40c057] border-[#40c057]' : 'bg-[#e9ecef] border-[#adb5bd]'}`}
                 onClick={(e) => { e.stopPropagation(); onPortClick(device.id, p.id); }}
                 title={p.label}
               />
             );
           })}
        </div>
        
        {hasSettings && (
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenSettings?.(device); }}
            className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white hover:bg-[#f8f9fa] flex items-center justify-center transition-colors text-[10px] shadow-sm border border-[#dee2e6] z-10"
          >
            ⚙️
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute"
      style={{ left: `${device.position.x}%`, top: `${device.position.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Wi-Fi Waves */}
      {device.data?.ssidEnabled?.value && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          {/* 2.4 GHz Wave (Green) - Larger Outer, Slower Pulse */}
          {(device.data?.bandSelect?.value?.includes('2.4 GHz') || device.data?.bandSelect?.value?.includes('Dual')) && (
            <div className="absolute w-72 h-72 rounded-full border-2 border-[#40c057]/20 animate-[ping_5s_linear_infinite]"></div>
          )}
          {/* 5 GHz Wave (Blue) - Smaller Inner, Faster Pulse */}
          {(device.data?.bandSelect?.value?.includes('5 GHz') || device.data?.bandSelect?.value?.includes('Dual')) && (
            <div className="absolute w-48 h-48 rounded-full border-2 border-[#339af0]/20 animate-[ping_1.5s_linear_infinite]"></div>
          )}
        </div>
      )}

      {/* Main Chassis */}
      <div className={`
        relative bg-white rounded-xl shadow-xl border-2 transition-all duration-300
        ${isSelected ? 'border-[#339af0] scale-105 z-20' : 'border-[#e9ecef] hover:border-[#dee2e6]'}
        ${device.type === 'switch' || device.type === 'router' ? 'w-64' : 'w-40'}
      `}>
        {/* Header */}
        <div className="px-4 py-2 border-b border-[#f1f3f5] bg-[#f8f9fa] rounded-t-xl flex justify-between items-center">
           <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xl">
                {device.type === 'phone' ? '📱' : 
                 device.type === 'patchpanel' ? '🔲' : 
                 device.type === 'poe-injector' ? '⚡' : 
                 device.type === 'docker' ? '🐳' : 
                 device.type === 'camera' ? '📷' :
                 device.type === 'server' ? '🖥️' : 
                 device.type === 'pc' ? '💻' : 
                 device.type === 'ap' ? '📡' : '📦'}
              </span>
              <div className="flex flex-col min-w-0">
                 <span className="text-[8px] font-black text-[#adb5bd] uppercase tracking-wider truncate">{device.model || device.type}</span>
                 <span className="text-xs font-bold text-[#495057] truncate">{device.name}</span>
              </div>
           </div>
           
           {hasSettings && (
             <button 
               onClick={(e) => { e.stopPropagation(); onOpenSettings?.(device); }}
               className="w-6 h-6 rounded-full bg-white hover:bg-[#f8f9fa] flex items-center justify-center transition-colors text-[10px] shadow-sm border border-[#dee2e6] flex-shrink-0"
             >
               ⚙️
             </button>
           )}
        </div>

        {/* Ports Panel */}
        <div className="p-3 flex flex-wrap gap-3 justify-center bg-white rounded-b-xl">
          {device.ports.map(port => {
            const isPortConnected = connectedPorts?.includes(port.id);
            const isPortSelected = selectedPort?.deviceId === device.id && selectedPort?.portId === port.id;
            
            return (
              <div 
                key={port.id} 
                className="flex flex-col items-center gap-1"
                onClick={(e) => { e.stopPropagation(); onPortClick(device.id, port.id); }}
              >
                {/* Port Type Indicator & PoE Active LED */}
                <div className="flex gap-1 items-center">
                  <div className={`w-3 h-1 rounded-full ${
                    port.type === 'WAN' ? 'bg-[#ffd43b]' : 
                    port.type === 'PoE' ? 'bg-[#40c057]' : 'bg-transparent'
                  }`}></div>
                  
                  {/* Status Circle (Green if PoE active) */}
                  {(() => {
                    const isPoEActive = port.type === 'PoE' && (
                      (device.type === 'poe-injector' && device.data?.poeOutput?.value === true && port.id === 'out') ||
                      (device.data?.[port.id + 'poe']?.value === true)
                    );
                    
                    if (isPoEActive) {
                      return <div className="w-1.5 h-1.5 rounded-full bg-[#40c057] shadow-[0_0_3px_#40c057] animate-pulse"></div>;
                    }
                    return null;
                  })()}
                </div>

                {/* RJ45 Connector */}
                <div 
                  className={`
                    w-9 h-9 rounded-md border-2 flex flex-col items-center justify-end p-1 transition-all cursor-pointer shadow-inner
                    ${isPortSelected ? 'border-[#339af0] bg-blue-50' : 
                      isPortConnected ? 'border-[#40c057] bg-green-50' : 'border-[#dee2e6] bg-[#f8f9fa] hover:border-[#adb5bd]'}
                  `}
                >
                  <div className="flex gap-0.5 mb-1">
                    <div className={`w-1 h-0.5 rounded-full ${isPortConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
                    <div className={`w-1 h-0.5 rounded-full ${isPortConnected ? 'bg-yellow-400 opacity-50' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className={`w-3 h-1 rounded-sm ${isPortConnected ? 'bg-[#40c057]' : 'bg-[#dee2e6]'}`}></div>
                </div>

                <span className="text-[9px] font-bold text-[#adb5bd] uppercase tracking-tighter">{port.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
