import { useState } from 'react';
import type { Device, Cable } from '../game/types';
import DeviceNode from './DeviceNode';
import DeviceSettingsModal from './DeviceSettingsModal';

interface PlaygroundProps {
  devices: Device[];
  cables: Cable[];
  onPortClick: (deviceId: string, portId: string) => void;
  selectedPort: { deviceId: string, portId: string } | null;
  isTestRunning: boolean;
  onDeviceDataUpdate: (deviceId: string, key: string, value: any) => void;
}

export default function Playground({ devices, cables, onPortClick, selectedPort, isTestRunning, onDeviceDataUpdate }: PlaygroundProps) {
  const [selectedSettingsDeviceId, setSelectedSettingsDeviceId] = useState<string | null>(null);

  return (
    <main className="flex-1 relative overflow-hidden bg-[#f8f9fa]" id="canvas-container">
      
      {/* Mřížka pozadí */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #adb5bd 1px, transparent 0)', backgroundSize: '24px 24px' }}>
      </div>
      
      {/* Vykresleni kabelu (SVG SVG layer) */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* We would draw bezier curves here between ports based on DOM coordinates.
            For now we render semantic lines if we have real coordinates, but since positions are percentage-based: */}
        {cables.map(cable => {
           const fromDev = devices.find(d => d.id === cable.fromDevice);
           const toDev = devices.find(d => d.id === cable.toDevice);
           if (!fromDev || !toDev) return null;

           const x1 = `${fromDev.position.x}%`;
           const y1 = `calc(${fromDev.position.y}% + 2rem)`; // offset for port approx
           const x2 = `${toDev.position.x}%`;
           const y2 = `calc(${toDev.position.y}% + 2rem)`;

           return (
             <g key={cable.id}>
               <line 
                 x1={x1} y1={y1} x2={x2} y2={y2} 
                 stroke="#40c057" 
                 strokeWidth="4" 
                 className="opacity-20"
               />
               <line 
                 x1={x1} y1={y1} x2={x2} y2={y2} 
                 stroke={isTestRunning ? "#339af0" : "#40c057"} 
                 strokeWidth="3" 
                 strokeDasharray={isTestRunning ? "10 10" : "0"}
                 className={isTestRunning ? "animate-[flow_0.5s_linear_infinite]" : ""}
                 style={isTestRunning ? { strokeDashoffset: '20' } : {}}
               />
             </g>
           )
        })}
      </svg>


      {/* Zařízení */}
      {devices.map(device => {
        const connectedPorts = cables.reduce((acc, cable) => {
          if (cable.fromDevice === device.id) acc.push(cable.fromPort);
          if (cable.toDevice === device.id) acc.push(cable.toPort);
          return acc;
        }, [] as string[]);

        return (
          <DeviceNode 
            key={device.id} 
            device={device} 
            onPortClick={onPortClick} 
            selectedPort={selectedPort}
            onOpenSettings={(d) => setSelectedSettingsDeviceId(d.id)}
            connectedPorts={connectedPorts}
          />
        );
      })}

      {/* Nastavení (Modal) přeplácne celý obsah playgroundu, protože to smí blokovat tahání kabelů */}
      {selectedSettingsDeviceId && (() => {
         const activeDevice = devices.find(d => d.id === selectedSettingsDeviceId);
         if (!activeDevice) return null;
         return (
           <DeviceSettingsModal 
             device={activeDevice}
             onUpdate={onDeviceDataUpdate}
             onClose={() => setSelectedSettingsDeviceId(null)}
           />
         );
      })()}
    </main>
  );
}
