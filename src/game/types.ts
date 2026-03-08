export type PortType = 'LAN' | 'WAN' | 'PoE' | 'Fiber' | 'ETH';
export type DeviceType = 'internet' | 'router' | 'switch' | 'ap' | 'pc' | 'camera' | 'server' | 'phone' | 'patchpanel' | 'poe-injector' | 'docker';

export interface Port {
  id: string;
  type: PortType;
  label: string;
  connected?: boolean;
}

export interface DeviceDataField {
  type: 'toggle' | 'select' | 'info';
  label: string;
  value: any;
  options?: { value: string; label: string }[];
  category?: 'network' | 'system' | 'wifi' | 'ports'; // Pro lepší organizaci v modálu
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  position: { x: number; y: number };
  ports: Port[];
  data?: Record<string, DeviceDataField>;
  // Nová pole pro realismus
  ip?: string;
  mac?: string;
  model?: string;
  serial?: string;
}

export interface Cable {
  id: string;
  type?: 'copper' | 'fiber' | 'broken';
  fromDevice: string;
  fromPort: string;
  toDevice: string;
  toPort: string;
  color?: string;
  length?: number;
}

export interface Level {
  id: string;
  chapter: number;
  title: string;
  description: string;
  task: string;
  explanation: string;
  initialDevices: Device[];
  initialCables?: Cable[];
  availableTools: string[];
  checkWinCondition: (devices: Device[], cables: Cable[]) => boolean;
}

export interface GameState {
  currentLevelId: string;
  devices: Device[];
  cables: Cable[];
  isTestRunning: boolean;
  testResult: 'success' | 'fail' | null;
}
