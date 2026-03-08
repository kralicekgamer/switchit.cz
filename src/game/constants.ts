import type { DeviceDataField } from './types';

export const getRouterSettings = (overrides: Record<string, DeviceDataField> = {}) => {
  const base: Record<string, DeviceDataField> = {
    status: { type: 'info', label: 'Provozní Stav', value: 'Online (Uptime 14d)', category: 'system' },
    model: { type: 'info', label: 'Hardware Model', value: 'Univo Router Pro', category: 'system' },
    ssidEnabled: { type: 'toggle', label: 'Vysílat Wi-Fi (SSID)', value: true, category: 'wifi' },
    bandSelect: { type: 'select', label: 'Povolit Pásma', value: 'Dual-Band (Auto)', options: [{value:'Dual-Band (Auto)',label:'Dual-Band (Auto)'}, {value:'5 GHz',label:'Pouze 5 GHz'}, {value:'2.4 GHz',label:'Pouze 2.4 GHz'}], category: 'wifi' },
    nat: { type: 'toggle', label: 'NAT Překlad Adres', value: true, category: 'network' },
  };

  // 4 LAN porty pro router (vždy 4)
  for (let i = 1; i <= 4; i++) {
    base[`lan${i}vlan`] = { type: 'select', label: `LAN ${i} - VLAN`, value: 'Default', options: [{value:'Default',label:'Default (vlan1)'}, {value:'Guest',label:'Guest (vlan10)'}, {value:'IoT',label:'IoT (vlan20)'}, {value:'Cameras',label:'Cameras (vlan30)'}], category: 'ports' };
  }

  return { ...base, ...overrides };
};

export const getSwitchSettings = (overrides: Record<string, DeviceDataField> = {}) => {
  const base: Record<string, DeviceDataField> = {
    status: { type: 'info', label: 'Provozní Stav', value: 'Online', category: 'system' },
    temp: { type: 'info', label: 'Teplota Jádra', value: '42 °C', category: 'system' },
  };

  // 8 portů pro switch (vždy 8)
  for (let i = 1; i <= 8; i++) {
    base[`p${i}poe`] = { type: 'toggle', label: `Port ${i} - PoE Output`, value: false, category: 'ports' };
    base[`p${i}vlan`] = { type: 'select', label: `Port ${i} - VLAN Profile`, value: 'All', options: [{value:'All',label:'All (Trunk)'}, {value:'VLAN 1',label:'VLAN 1 (Default)'}, {value:'VLAN 10',label:'VLAN 10 (Guest)'}, {value:'VLAN 20',label:'VLAN 20 (IoT)'}, {value:'VLAN 30',label:'VLAN 30 (Cameras)'}], category: 'ports' };
  }

  return { ...base, ...overrides };
};

export const getApSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Stav Mesh', value: 'Connected (Gbe)', category: 'system' },
  ssidEnabled: { type: 'toggle', label: 'Vysílat Wi-Fi (SSID)', value: true, category: 'wifi' },
  bandSelect: { type: 'select', label: 'Pásmo', value: 'Dual-Band (Auto)', options: [{value:'Dual-Band (Auto)',label:'Dual-Band'}, {value:'5 GHz',label:'5 GHz'}, {value:'2.4 GHz',label:'2.4 GHz'}], category: 'wifi' },
  channel: { type: 'select', label: 'Wi-Fi Kanál', value: 'Auto', options: [{value:'Auto',label:'Auto'}, {value:'1',label:'Kanál 1'}, {value:'6',label:'Kanál 6'}, {value:'11',label:'Kanál 11'}], category: 'wifi' },
  meshUplink: { type: 'select', label: 'Uplink Typ', value: 'Kabel', options: [{value:'Kabel',label:'Ethernet (Kabel)'}, {value:'Wireless',label:'Wireless Mesh'}], category: 'network' },
  ...overrides
});

export const getControllerSettings = (overrides: Record<string, DeviceDataField> = {}) => {
  const base: Record<string, DeviceDataField> = {
    status: { type: 'info', label: 'Uptime', value: '12d 4h', category: 'system' },
    adoption: { type: 'toggle', label: 'Automatická Adopce', value: true, category: 'system' },
  };

  // 12 portů pro patch panel logiku v controlleru (pokud by se vázalo)
  for (let i = 1; i <= 12; i++) {
    base[`p${i}label`] = { type: 'info', label: `Dírka ${i}`, value: 'Ready', category: 'ports' };
  }

  return { ...base, ...overrides };
};

export const getClientSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Signál', value: '95%', category: 'wifi' },
  ...overrides
});

export const getIspSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Link State', value: 'Up', category: 'network' },
  speed: { type: 'info', label: 'Sjednaná rychlost', value: '1000/1000 Mbps', category: 'network' },
  ...overrides
});

export const getGenericSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Stav', value: 'Online', category: 'system' },
  ...overrides
});

export const getPatchPanelSettings = (overrides: Record<string, DeviceDataField> = {}) => {
  const base: Record<string, DeviceDataField> = {
    status: { type: 'info', label: 'Typ', value: 'Cat6 Patch Panel', category: 'system' },
  };
  for (let i = 1; i <= 12; i++) {
    base[`pp${i}label`] = { type: 'info', label: `Port ${i}`, value: `Nepropojeno`, category: 'ports' };
  }
  return { ...base, ...overrides };
};

export const getPoEInjectorSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Stav', value: 'Napájí', category: 'system' },
  poeOutput: { type: 'toggle', label: 'PoE Výstup (802.3af)', value: true, category: 'ports' },
  wattage: { type: 'info', label: 'Max Výkon', value: '30W (802.3at)', category: 'system' },
  ...overrides
});

export const getDockerSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Docker Engine', value: 'Running', category: 'system' },
  containerRunning: { type: 'toggle', label: 'Univo Controller (kontejner)', value: true, category: 'system' },
  informUrl: { type: 'select', label: 'Inform URL', value: 'Nenastaveno', options: [{value:'Nenastaveno',label:'Nenastaveno'}, {value:'http://controller:8080/inform',label:'http://controller:8080/inform'}], category: 'network' },
  ...overrides
});

export const getFirewallSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Provozní Stav', value: 'Online', category: 'system' },
  model: { type: 'info', label: 'Hardware Model', value: 'Univo Security Gateway', category: 'system' },
  wanInBlock: { type: 'toggle', label: 'WAN-IN: Blokovat vše', value: false, category: 'network' },
  portForward: { type: 'toggle', label: 'Port Forward (25565 → Server)', value: false, category: 'network' },
  lanIsolation: { type: 'toggle', label: 'LAN Izolace (VLAN ↔ VLAN)', value: false, category: 'network' },
  nat: { type: 'toggle', label: 'NAT Překlad Adres', value: true, category: 'network' },
  ssidEnabled: { type: 'toggle', label: 'Vysílat Wi-Fi (SSID)', value: true, category: 'wifi' },
  ...overrides
});

export const getPhoneSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Signál Wi-Fi', value: 'Skvělý', category: 'wifi' },
  band: { type: 'select', label: 'Preferované pásmo', value: 'Auto', options: [{value:'Auto',label:'Auto'}, {value:'5 GHz',label:'5 GHz'}, {value:'2.4 GHz',label:'2.4 GHz'}], category: 'wifi' },
  ...overrides
});

export const getCameraSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Stav', value: 'Offline (Bez napájení)', category: 'system' },
  poeRequired: { type: 'info', label: 'Napájení', value: 'Vyžaduje PoE (802.3af)', category: 'system' },
  ...overrides
});

export const getIoTSettings = (overrides: Record<string, DeviceDataField> = {}) => ({
  status: { type: 'info', label: 'Stav', value: 'Online', category: 'system' },
  network: { type: 'info', label: 'Připojeno na', value: 'Hlavní síť (nebezpečné!)', category: 'network' },
  ...overrides
});
