import type { Level } from './types';
import { hasLink } from './engine';
import { 
  getRouterSettings, 
  getSwitchSettings, 
  getApSettings, 
  getControllerSettings, 
  getClientSettings, 
  getIspSettings,
  getPatchPanelSettings,
  getPoEInjectorSettings,
  getFirewallSettings,
  getPhoneSettings,
  getCameraSettings,
  getIoTSettings,
  getDockerSettings,
  getGenericSettings
} from './constants';

const R5 = [
  { id: 'wan', type: 'WAN', label: 'WAN' },
  { id: 'l1', type: 'ETH', label: '1' },
  { id: 'l2', type: 'ETH', label: '2' },
  { id: 'l3', type: 'ETH', label: '3' },
  { id: 'l4', type: 'ETH', label: '4' }
] as const;

const S8 = Array.from({ length: 8 }, (_, i) => ({ id: `p${i + 1}`, type: 'ETH', label: `${i + 1}` })) as any;
const S8P = Array.from({ length: 8 }, (_, i) => ({ id: `p${i + 1}`, type: i < 4 ? 'PoE' : 'ETH', label: `${i + 1}` })) as any;
const PP12 = Array.from({ length: 12 }, (_, i) => ({ id: `p${i + 1}`, type: 'ETH', label: `${i + 1}` })) as any;
const WALL1 = [{ id: 'p1', type: 'ETH', label: '1' }] as any;
const WALL2 = [{ id: 'p1', type: 'ETH', label: '2' }] as any;

export const levels: Level[] = [
  // --- KAPITOLA 1: Router & první internet ---
  {
    id: '1-1', chapter: 1, title: 'WAN připojení',
    description: 'Vítej v první lekci! Každá síť začíná u zdroje – tvého poskytovatele internetu (ISP). Aby se internet dostal do tvého domu, musíš propojit ISP zásuvku s portem WAN na tvém routeru. Port WAN je bránou mezi vnějším světem a tvou vnitřní sítí.',
    task: 'Propoj ISP zdířku s portem WAN na Univo Routeru.',
    explanation: 'Port WAN (Wide Area Network) slouží k příjmu internetové konektivity. Na tomto portu router obvykle získá veřejnou IP adresu a zahájí NAT (překlad adres) pro tvá vnitřní zařízení.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'internet', type: 'internet', name: 'Internet', position: { x: 20, y: 50}, ports: [{ id: 'isp', type: 'WAN', label: 'ISP' }], data: getIspSettings() as any },
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 60, y: 50}, ports: [...R5], data: getRouterSettings() as any }
    ],
    checkWinCondition: (_, cables) => hasLink(cables, 'internet', 'isp', 'gw', 'wan')
  },
  {
    id: '1-2', chapter: 1, title: 'První klient v LAN',
    description: 'Internet už máš v routeru, ale tvůj počítač je stále offline. Teď musíš propojit síťovou kartu svého PC s jedním z LAN portů na routeru. LAN porty fungují jako vnitřní rozvaděč, který distribuuje internet do tvých domácích zařízení.',
    task: 'Propoj PC s LAN portem na Univo Routeru.',
    explanation: 'LAN (Local Area Network) je tvá soukromá domácí síť. Všechna zařízení v LAN na sebe vidí a mohou sdílet data, zatímco router je chrání před útoky z internetu.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'internet', type: 'internet', name: 'Internet', position: { x: 15, y: 50}, ports: [{ id: 'isp', type: 'WAN', label: 'ISP' }], data: getIspSettings() as any },
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 50, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'pc', type: 'pc', name: 'Stolní PC', position: { x: 80, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH'}], data: getClientSettings() as any }
    ],
    initialCables: [{ id: 'c1', fromDevice: 'internet', fromPort: 'isp', toDevice: 'gw', toPort: 'wan'}],
    checkWinCondition: (_, cables) => hasLink(cables, 'gw', null, 'pc', 'eth')
  },
  {
    id: '1-3', chapter: 1, title: 'Smyčka v síti',
    description: 'Pozor, síť se hroutí! Někdo omylem zapojil oba konce jednoho kabelu do stejného zařízení (nebo vytvořil kruh mezi dvěma switchi). V Ethernetovém světě to způsobí "Broadcast Storm" – pakety se začnou nekonečně množit a síť úplně zahltí.',
    task: 'Najdi a odstraň chybnou smyčku na switchi.',
    explanation: 'Smyčky v síti jsou kritickou chybou. Moderní switche sice umí používat protokol STP (Spanning Tree Protocol) k automatickému odpojení smyčky, ale je vždy lepší zapojovat kabely s rozmyslem.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 20, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 60, y: 50}, ports: [...S8], data: getSwitchSettings() as any }
    ],
    initialCables: [
      { id: 'c1', fromDevice: 'gw', fromPort: 'l1', toDevice: 'sw', toPort: 'p1'},
      { id: 'loop', fromDevice: 'sw', fromPort: 'p3', toDevice: 'sw', toPort: 'p4'}
    ],
    checkWinCondition: (_, cables) => {
      const portsOnSw = cables.filter(c => (c.fromDevice === 'sw' || c.toDevice === 'sw') && c.id !== 'loop');
      const hasSelfLoop = cables.some(c => c.fromDevice === 'sw' && c.toDevice === 'sw');
      return !hasSelfLoop && portsOnSw.length > 0;
    }
  },

  // --- KAPITOLA 2: WLAN (bezdrátová síť) ---
  {
    id: '2-1', chapter: 2, title: 'Zapnutí Wi-Fi (SSID)',
    description: 'Chceš mít v domě Wi-Fi? Prvním krokem je její aktivace v nastaveních routeru. Musíš povolit vysílání SSID (Service Set Identifier) – to je název sítě, který uvidí tvůj telefon.',
    task: 'Vlez do nastavení routeru a aktivuj SSID.',
    explanation: 'SSID je jméno Wi-Fi sítě. Pokud ho vypneš, síť se stane "skrytou", což sice zvýší soukromí, ale zkomplikuje připojování nových zařízení.',
    availableTools: [],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 30, y: 50 }, ports: [...R5], data: getRouterSettings({ ssidEnabled: { type: 'toggle', label: 'Vysílat Wi-Fi (SSID)', value: false, category: 'wifi' } }) as any },
      { id: 'phone', type: 'phone', name: 'Smartphone', position: { x: 70, y: 50 }, ports: [], data: getPhoneSettings() as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'gw')?.data?.ssidEnabled.value
  },
  {
    id: '2-2', chapter: 2, title: '2.4 GHz vs 5 GHz',
    description: 'Máš moderní router, který vysílá ve dvou pásmech. 2.4 GHz má větší dosah a lépe prostupuje zdmi, ale je pomalejší a často rušené (mikrovlnky, sousedé). 5 GHz je extrémně rychlé, ale má malý dosah. Přidělme tvým zařízením správná pásma.',
    task: 'V nastavení routeru zvol pásmo "Pouze 5 GHz" pro maximální výkon u telefonu.',
    explanation: 'Pásmo 5 GHz nabízí mnohem více kanálů a vyšší rychlosti, ale je náchylnější na útlum materiálem. Většina moderních systémů používá "Band Steering" k automatickému přepínání.',
    availableTools: [],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 30, y: 50 }, ports: [...R5], data: getRouterSettings({ ssidEnabled: { type: 'toggle', label: 'Vysílat Wi-Fi (SSID)', value: true, category: 'wifi' }, bandSelect: { type: 'select', label: 'Pásmo', value: '2.4 GHz', options: [{value:'2.4 GHz',label:'Pouze 2.4 GHz'}, {value:'5 GHz',label:'Pouze 5 GHz'}], category: 'wifi' } }) as any },
      { id: 'phone', type: 'phone', name: 'Smartphone', position: { x: 70, y: 50 }, ports: [], data: getPhoneSettings() as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'gw')?.data?.bandSelect.value === '5 GHz'
  },

  // --- KAPITOLA 3: Switch (přepínání) ---
  {
    id: '3-1', chapter: 3, title: 'Nedostatek portů',
    description: 'Všechny LAN porty na routeru jsou plné, ale ty potřebuješ připojit herní konzoli a televizi. K tomu slouží Univo Switch. Switch "rozmnoží" jeden port na mnoho dalších, aniž by docházelo ke kolizím dat.',
    task: 'Propoj router se switchem a k němu obě PC.',
    explanation: 'Switch pracuje na L2 vrstvě OSI modelu a posílá data jen tam, kam patří, na základě MAC adresy cílového zařízení.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 20, y: 30}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 50, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'pc1', type: 'pc', name: 'Herní PC', position: { x: 80, y: 20}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any },
      { id: 'pc2', type: 'pc', name: 'Smart TV', position: { x: 80, y: 80}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any }
    ],
    checkWinCondition: (_, cables) => 
      hasLink(cables, 'gw', 'l1', 'sw', null) && 
      hasLink(cables, 'sw', null, 'pc1', 'eth') && 
      hasLink(cables, 'sw', null, 'pc2', 'eth')
  },
  {
    id: '3-2', chapter: 3, title: 'Rychlost linky',
    description: 'Někdy switch ukazuje oranžovou barvu u portu namísto zelené. To znamená, že linka jede jen 100 Mbps namísto 1 Gbps. Často je na vině špatný nebo starý kabel. Vyměňme ho za gigabitový!',
    task: 'Smaž stávající špatný kabel (kliknutím na port) a nahraď ho novým Gbit kabelem.',
    explanation: 'Pro Gigabit Ethernet je nutné mít všech 8 žil v kabelu v pořádku. Pokud jsou zapojeny jen 4, linka se spadne na 100 Mbps Fast Ethernet.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 30, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'pc', type: 'pc', name: 'Výkonný Server', position: { x: 70, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any }
    ],
    initialCables: [{ id: 'broken-cable', fromDevice: 'sw', fromPort: 'p1', toDevice: 'pc', toPort: 'eth', color: 'orange' }],
    checkWinCondition: (_, cables) => {
       const c = cables.find(c => (c.fromDevice === 'sw' && c.toDevice === 'pc') || (c.toDevice === 'sw' && c.fromDevice === 'pc'));
       return !!c && c.id !== 'broken-cable';
    }
  },
  {
    id: '3-3', chapter: 3, title: 'První VLAN',
    description: 'VLAN (Virtual LAN) ti umožní rozdělit jeden switch na několik logických sítí. Představ si, že chceš oddělit domácí PC od kamerového systému, aby se k nim nikdo zvenčí nedostal. Nastavíme portu 3 profil "VLAN 30 (Cameras)".',
    task: 'Změň VLAN profil na portu 3 switche na "VLAN 30 (Cameras)".',
    explanation: 'VLAN tagování (802.1Q) přidá do hlavičky paketu ID sítě. Switch se pak stará o to, aby pakety z jedné VLAN neputovaly do druhé, pokud k tomu nemá svolení od routeru.',
    availableTools: [],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 50, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'cam', type: 'camera', name: 'IP Kamera', position: { x: 80, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getCameraSettings() as any }
    ],
    initialCables: [{ id: 'c1', fromDevice: 'sw', fromPort: 'p3', toDevice: 'cam', toPort: 'eth'}],
    checkWinCondition: (devices) => devices.find(d => d.id === 'sw')?.data?.p3vlan.value === 'VLAN 30'
  },

  // --- KAPITOLA 4: Access Point (AP) ---
  {
    id: '4-1', chapter: 4, title: 'Připojení AP k síti',
    description: 'Router má slabou Wi-Fi, tak jsi koupil samostatný Access Point (AP), který umístíš doprostřed domu. AP musí být propojen kabelem do routeru nebo switche, aby mohl vysílat internet bezdrátově.',
    task: 'Zapoj AP do LAN portu na Univo Routeru.',
    explanation: 'Na rozdíl od routeru se Access Point obvykle nestará o IP adresy, jen převádí data mezi kabelem a vzduchem. Funguje jako bezdrátový prodlužovák sítě.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 30, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'ap', type: 'ap', name: 'Univo AP', position: { x: 70, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getApSettings() as any }
    ],
    checkWinCondition: (_, cables) => hasLink(cables, 'gw', 'l1', 'ap', 'eth')
  },
  {
    id: '4-2', chapter: 4, title: 'Mesh uplink',
    description: 'Někdy nemůžeš protáhnout kabel. V tom případě můžeš použít "Wireless Mesh". Druhé AP se připojí k prvnímu bezdrátově a bude předávat signál dál.',
    task: 'V nastavení AP Terasa změň "Uplink Typ" na "Wireless Mesh".',
    explanation: 'Mesh sítě jsou pohodlné, ale pamatuj, že bezdrátové propojení AP ubírá část kapacity sítě pro samotný přenos mezi nimi. Kabel je vždy jistota.',
    availableTools: [],
    initialDevices: [
      { id: 'ap1', type: 'ap', name: 'AP Obývák', position: { x: 30, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getApSettings() as any },
      { id: 'ap2', type: 'ap', name: 'AP Terasa', position: { x: 70, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getApSettings() as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'ap2')?.data?.meshUplink.value === 'Wireless'
  },
  {
    id: '4-3', chapter: 4, title: 'Kolize kanálů',
    description: 'Tvé Wi-Fi sítě se navzájem ruší, protože obě vysílají na stejném kanálu (např. Kanál 1). To způsobuje pomalý internet a výpadky. Musíme je rozprostřít.',
    task: 'Změň kanál u AP na Kanál 6 (jiný než má router).',
    explanation: 'V pásmu 2.4 GHz existují jen tři kanály, které se nepřekrývají: 1, 6 a 11. Pokud máš více AP, měl bys je nastavit tak, aby sousední AP neměla stejný kanál.',
    availableTools: [],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 30, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'ap', type: 'ap', name: 'Univo AP', position: { x: 70, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getApSettings({ channel: { type: 'select', label: 'Kanál', value: '1', options: [{value:'1',label:'1'}, {value:'6',label:'6'}, {value:'11',label:'11'}], category: 'wifi' } }) as any }
    ],
    checkWinCondition: (devices, cables) => devices.find(d => d.id === 'ap')?.data?.channel.value === '6' && hasLink(cables, 'gw', 'l1', 'ap', 'eth')
  },

  // --- KAPITOLA 5: PoE (Napájení po ethernetu) ---
  {
    id: '5-1', chapter: 5, title: 'Mrtvý AP',
    description: 'Tvůj Access Point nesvítí. Zapomněl jsi, že potřebuje napájení, a u stropu není zásuvka! K tomu slouží PoE (Power over Ethernet). Pokud nemáš PoE switch, musíš do cesty vložit PoE Injektor.',
    task: 'Vlož PoE Injektor mezi switch a AP.',
    explanation: 'PoE Injektor "přibalí" elektřinu do datového kabelu. Na druhém konci si AP tuto elektřinu vezme a zapne se.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 20, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'poe', type: 'poe-injector', name: 'PoE Injektor', position: { x: 50, y: 50}, ports: [{ id: 'in', type: 'ETH', label: 'IN' }, { id: 'out', type: 'PoE', label: 'OUT' }], data: getPoEInjectorSettings() as any },
      { id: 'ap', type: 'ap', name: 'Univo AP', position: { x: 80, y: 50}, ports: [{ id: 'eth', type: 'PoE', label: 'ETH' }], data: getApSettings() as any }
    ],
    checkWinCondition: (_, cables) => 
      hasLink(cables, 'sw', null, 'poe', 'in') && 
      hasLink(cables, 'poe', 'out', 'ap', 'eth')
  },
  {
    id: '5-2', chapter: 5, title: 'Zapnutí PoE portu',
    description: 'PoE switch máš, ale kamera stále nejede. U některých switchů musíš napájení na konkrétním portu ručně povolit v administraci z bezpečnostních důvodů.',
    task: 'V nastavení switche zapni "Port 1 - PoE Output".',
    explanation: 'Aktivní PoE (802.3af/at) je chytré – switch se nejdříve zeptá zařízení, jestli napájení chce. Pokud ale máš starší pasivní PoE, switch tam "pouští proud" natvrdo, což může zničit zařízení, která na to nejsou stavěná.',
    availableTools: [],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 30, y: 50}, ports: [...S8P], data: getSwitchSettings({ p1poe: { type: 'toggle', label: 'Port 1 - PoE Output', value: false, category: 'ports' } }) as any },
      { id: 'cam', type: 'camera', name: 'IP Kamera', position: { x: 70, y: 50}, ports: [{ id: 'eth', type: 'PoE', label: 'ETH' }], data: getCameraSettings() as any }
    ],
    initialCables: [{ id: 'c1', fromDevice: 'sw', fromPort: 'p1', toDevice: 'cam', toPort: 'eth'}],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'sw')?.data?.p1poe.value
  },
  {
    id: '5-3', chapter: 5, title: 'PoE Switch',
    description: 'Injektory jsou nepraktické a zabírají místo v zásuvkách. Lepším řešením je PoE Switch, který má napájení zabudované přímo v sobě. Zapojme kamery přímo do něj.',
    task: 'Vyhoď injektory a zapoj obě kamery rovnou do PoE switche. Nezapomeň pak PoE na portech zapnout v nastavení!',
    explanation: 'PoE switch dokáže napájet mnoho zařízení najednou. Musíš si ale hlídat celkový "PoE Budget" – tedy kolik Wattů switch zvládne dodat celkem.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 20, y: 50}, ports: [...S8P], data: getSwitchSettings() as any },
      { id: 'cam1', type: 'camera', name: 'Kamera 1', position: { x: 70, y: 30}, ports: [{ id: 'eth', type: 'PoE', label: 'ETH' }], data: getCameraSettings() as any },
      { id: 'cam2', type: 'camera', name: 'Kamera 2', position: { x: 70, y: 70}, ports: [{ id: 'eth', type: 'PoE', label: 'ETH' }], data: getCameraSettings() as any }
    ],
    checkWinCondition: (devices, cables) => 
      hasLink(cables, 'sw', null, 'cam1', 'eth') && 
      hasLink(cables, 'sw', null, 'cam2', 'eth') &&
      !!devices.find(d => d.id === 'sw')?.data?.p1poe.value &&
      !!devices.find(d => d.id === 'sw')?.data?.p2poe.value
  },

  // --- KAPITOLA 6: Strukturovaná kabeláž ---
  {
    id: '6-1', chapter: 6, title: 'Zásuvka -> patch panel',
    description: 'V moderním domě nevedou kabely jen tak po zemi. Jsou schované ve zdi a končí v zásuvce. Druhý konec kabelu vede do centrálního rozvaděče (RACKu), kde je zapojen do Patch Panelu.',
    task: 'Propoj PC do zásuvky ve zdi a pak propoj odpovídající port na Patch Panelu se Switchem.',
    explanation: 'Patch panel je jen pasivní ukončení kabelů ze zdí. Pomocí krátkých kabelů (patchcordů) pak v racku přenášíš signál tam, kam potřebuješ.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'pc', type: 'pc', name: 'PC v Pokoji', position: { x: 10, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any },
      { id: 'wall', type: 'patchpanel', name: 'Zásuvka Zeď', position: { x: 30, y: 50}, ports: [...WALL1], data: getPatchPanelSettings() as any },
      { id: 'pp', type: 'patchpanel', name: 'Patch Panel (Rack)', position: { x: 60, y: 50}, ports: [...PP12], data: getPatchPanelSettings() as any },
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 90, y: 50}, ports: [...S8], data: getSwitchSettings() as any }
    ],
    checkWinCondition: (_, cables) => 
      hasLink(cables, 'pc', 'eth', 'wall', 'p1') && 
      hasLink(cables, 'pp', 'p1', 'sw', null)
  },
  {
    id: '6-2', chapter: 6, title: 'Hledání správného portu',
    description: 'Máš v racku 12 kabelů, ale nevíš, který vede do ložnice. Musíš použít zkoušečku (nebo prostě koukat na popisky). V simulaci najdi port 12 na patch panelu.',
    task: 'Propoj port 12 na patch panelu s Univo Switchem.',
    explanation: 'Označování kabelů je nejdůležitější částí instalace. Bez popisků se při řešení problému za rok zblázníš.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'pp', type: 'patchpanel', name: 'Patch Panel', position: { x: 30, y: 50}, ports: [...PP12], data: getPatchPanelSettings() as any },
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 70, y: 50}, ports: [...S8], data: getSwitchSettings() as any }
    ],
    checkWinCondition: (_, cables) => hasLink(cables, 'pp', 'p12', 'sw', null)
  },
  {
    id: '6-3', chapter: 6, title: 'Propojení dvou místností',
    description: 'Potřebuješ propojit dvě PC v různých místnostech přes patch panel v racku. Každý počítač je zapojen do své zásuvky ve zdi, které vedou do patch panelu v centrálním racku.',
    task: 'Propoj oba počítače do jejich zásuvek a pak v racku na patch panelu propojte porty 1 a 2 kabelem.',
    explanation: 'Patch panel umožňuje "přemostění" mezi místnostmi. Signál projde kabelem ze zdi do racku a druhým kabelem se vrátí zpět do jiné místnosti.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'pc1', type: 'pc', name: 'PC Obývák', position: { x: 10, y: 20}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any },
      { id: 'w1', type: 'patchpanel', name: 'Zásuvka Obývák', position: { x: 30, y: 20}, ports: [...WALL1], data: getPatchPanelSettings() as any },
      { id: 'pc2', type: 'pc', name: 'PC Ložnice', position: { x: 10, y: 80}, ports: [{ id: 'eth', type: 'ETH', label: 'ETH' }], data: getClientSettings() as any },
      { id: 'w2', type: 'patchpanel', name: 'Zásuvka Ložnice', position: { x: 30, y: 80}, ports: [...WALL2], data: getPatchPanelSettings() as any },
      { id: 'pp', type: 'patchpanel', name: 'Rack Patch Panel', position: { x: 60, y: 50}, ports: [...PP12], data: getPatchPanelSettings() as any }
    ],
    initialCables: [],
    checkWinCondition: (_, cables) => 
      hasLink(cables, 'pc1', 'eth', 'w1', 'p1') && 
      hasLink(cables, 'pc2', 'eth', 'w2', 'p1') &&
      hasLink(cables, 'pp', 'p1', 'pp', 'p2')
  },

  // --- KAPITOLA 7: Docker & instalace controlleru ---
  {
    id: '7-1', chapter: 7, title: 'Kontejnerizace sítě',
    description: 'V moderních profesionálních sítích už nenastavuješ každý prvek (AP, Switch) zvlášť přes webové rozhraní. Používá se centrální "Univo Network Application" (Controller). Ten může běžet buď na vyhrazeném HW (Cloud Key), nebo ho můžeš spustit jako izolovaný kontejner v Dockeru na svém domácím serveru (NAS).',
    task: 'Vlez do správy Docker Serveru a v sekci kontejnerů zapni "Univo Controller".',
    explanation: 'Docker umožňuje spouštět aplikace v izolovaných "kontejnerech", které sdílejí jádro systému, ale mají vlastní souborový systém. Je to standard pro moderní domácí automatizaci a správu sítí.',
    availableTools: [],
    initialDevices: [
      { id: 'srv', type: 'docker', name: 'Docker Server', position: { x: 40, y: 50}, ports: [{ id: 'eth', type: 'ETH', label: 'LAN' }], data: getDockerSettings({ containerRunning: { type: 'toggle', label: 'Univo Controller (kontejner)', value: false, category: 'system' } }) as any },
      { id: 'ctl', type: 'server', name: 'Univo Controller', position: { x: 75, y: 50}, ports: [], data: getControllerSettings() as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'srv')?.data?.containerRunning.value
  },
  {
    id: '7-2', chapter: 7, title: 'Inform URL: Volání domů',
    description: 'Controller běží, ale tvá zařízení (switche, AP) o něm zatím neví. Musíš jim "pošeptat" adresu, na které controller naslouchá. Této adrese se říká Inform URL. Jakmile ji zařízení dostane, začne na ni v pravidelných intervalech posílat svůj stav (heartbeat).',
    task: 'V nastavení Univo AP zvol správnou Inform URL: "http://controller:8080/inform".',
    explanation: 'Inform URL je klíčem k centralizované správě. Díky ní můžeš spravovat zařízení klidně i na druhém konci světa (L3 Adoption), pokud je controller dostupný přes internet.',
    availableTools: [],
    initialDevices: [
      { id: 'ap', type: 'ap', name: 'Univo AP', position: { x: 30, y: 50}, ports: [{id:'eth',type:'ETH',label:'ETH'}], data: getApSettings({ informUrl: { type: 'select', label: 'Inform URL', value: 'Nenastaveno', options: [{value:'Nenastaveno',label:'Nenastaveno'}, {value:'http://controller:8080/inform',label:'http://controller:8080/inform'}], category: 'network' } }) as any },
      { id: 'ctl', type: 'server', name: 'Univo Controller', position: { x: 70, y: 50}, ports: [], data: getControllerSettings() as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'ap')?.data?.informUrl.value?.includes('http')
  },
  {
    id: '7-3', chapter: 7, title: 'Adopce: Navázání důvěry',
    description: 'Zařízení už na controller "ťuká" (vidíš ho v seznamu jako Pending), ale controller ho z bezpečnostních důvodů zatím ignoruje. Musíš proces potvrdit – provést "Adopci". Tím se mezi controllerem a zařízením vytvoří šifrovaný tunel a zařízení se stane součástí tvé centrálně spravované sítě.',
    task: 'V nastavení Controlleru aktivuj "Automatická Adopce" pro schválení všech čekajících zařízení.',
    explanation: 'Jakmile je zařízení adoptováno, "patří" danému controlleru. Pokud bys ho chtěl přidat k jinému, musel bys ho fyzicky resetovat (Factory Reset). To chrání tvou síť před odcizením kontroly cizím člověkem.',
    availableTools: [],
    initialDevices: [
      { id: 'ctl', type: 'server', name: 'Univo Controller', position: { x: 50, y: 50}, ports: [], data: getControllerSettings({ adoption: { type: 'toggle', label: 'Automatická Adopce', value: false, category: 'system' } }) as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'ctl')?.data?.adoption.value
  },

  // --- KAPITOLA 8: Controller (správa sítě) ---
  {
    id: '8-1', chapter: 8, title: 'Kompletní oživení sítě',
    description: 'Teď si to vyzkoušíme v praxi na reálném scénáři. Máš nainstalovaný router, switch a jeden Access Point. Tvým úkolem je celou síť fyzicky propojit kabelem a následně v Univo Controlleru zajistit, aby byla všechna zařízení pod správou (Adoption).',
    task: 'Propoj všechna zařízení s routerem (přímo nebo přes switch) a v nastavení Controlleru aktivuj "Automatická Adopce".',
    explanation: 'Centralizovaná správa ti umožní měnit nastavení (update firmware, hesla Wi-Fi, VLANy) na desítkách switchů a AP najednou z jednoho "velitelského centra", aniž bys musel ke každému zařízení chodit s notebookem.',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 20, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 50, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'ap', type: 'ap', name: 'Univo AP', position: { x: 80, y: 50}, ports: [{id:'e1',type:'ETH',label:'ETH'}], data: getApSettings({ informUrl: { type: 'select', label: 'Inform URL', value: 'http://controller:8080/inform', options: [{value:'http://controller:8080/inform',label:'http://controller:8080/inform'}], category: 'network' } }) as any },
      { id: 'ctl', type: 'server', name: 'Univo Controller', position: { x: 50, y: 15}, ports: [], data: getControllerSettings({ adoption: { type: 'toggle', label: 'Automatická Adopce', value: false, category: 'system' } }) as any }
    ],
    checkWinCondition: (devices, cables) => 
      hasLink(cables, 'gw', 'l1', 'sw', null) && 
      hasLink(cables, 'sw', null, 'ap', 'e1') &&
      !!devices.find(d => d.id === 'ctl')?.data?.adoption.value
  },
  {
    id: '8-2', chapter: 8, title: 'Hromadná konfigurace Wi-Fi',
    description: 'Wi-Fi v celém domě má stále výchozí jméno a lidé si pletou své sítě se sousedy. V controlleru můžeš definovat parametry bezdrátové sítě jednou a ty se automaticky "propasírují" do všech Access Pointů v domě. Změňme název SSID na něco unikátního.',
    task: 'Najdi v nastavení (u kteréhokoliv AP) políčko SSID a přepni ho na "SuperNet".',
    explanation: 'Toto je hlavní síla controlleru – "Provisioning". Jakmile v něm něco změníš, controller kontaktuje všechna dotčená zařízení a nahraje do nich novou konfiguraci. Už žádné obcházení APček s kabelem!',
    availableTools: [],
    initialDevices: [
      { id: 'ap1', type: 'ap', name: 'AP Patro', position: { x: 15, y: 50}, ports: [], data: getApSettings({ ssidName: { type: 'select', label: 'Název SSID', value: 'Univo-Default', options: [{value:'Univo-Default',label:'Univo-Default'}, {value:'SuperNet',label:'SuperNet'}], category: 'wifi' } }) as any },
      { id: 'ap2', type: 'ap', name: 'AP Přízemí', position: { x: 45, y: 50}, ports: [], data: getApSettings() as any },
      { id: 'ctl', type: 'server', name: 'Univo Controller', position: { x: 75, y: 50}, ports: [], data: getControllerSettings() as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'ap1')?.data?.ssidName.value === 'SuperNet'
  },

  // --- KAPITOLA 9: Více switchů & trunk ---
  {
    id: '9-1', chapter: 9, title: 'Uplink mezi switche',
    description: 'Máš v domě dva rozvaděče – jeden v přízemí a jeden v patře. Musíš je propojit kabelem, kterému se říká "Uplink".',
    task: 'Propoj port 8 Univo Switche 1 s portem 8 Univo Switche 2.',
    explanation: 'Uplink je linka, která nese data z jednoho switche do druhého. Obvykle bývá rychlejší než ostatní porty (např. 10 Gbps optika).',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'sw1', type: 'switch', name: 'Univo Switch', position: { x: 30, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'sw2', type: 'switch', name: 'Univo Switch', position: { x: 70, y: 50}, ports: [...S8], data: getSwitchSettings() as any }
    ],
    checkWinCondition: (_, cables) => hasLink(cables, 'sw1', 'p8', 'sw2', 'p8')
  },
  {
    id: '9-2', chapter: 9, title: 'Omezení VLAN na trunku',
    description: 'Standardně trunk (propojení switchů) nese všechny VLANy. Někdy ale chceš z bezpečnostních důvodů povolit jen některé.',
    task: 'Na portu 8 (trunk) nastav VLAN Profile na "VLAN 1 (Default)".',
    explanation: 'Tímto odebereš přístup k ostatním VLANám (třeba kamerám) na druhý switch. Je to forma zabezpečení sítě.',
    availableTools: [],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 50, y: 50}, ports: [...S8], data: getSwitchSettings({ p8vlan: { type: 'select', label: 'Port 8 - VLAN Profile', value: 'All', options: [{value:'All',label:'All (Trunk)'}, {value:'VLAN 1',label:'VLAN 1 (Default)'}], category: 'ports' } }) as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'sw')?.data?.p8vlan.value === 'VLAN 1'
  },
  {
    id: '9-3', chapter: 9, title: 'Více pater domu',
    description: 'Postavme celou páteřní síť. Propoj router se switchem v přízemí a ten se switchem v patře.',
    task: 'Vytvoř řetězec: Univo Router -> Switch 1 -> Switch 2.',
    explanation: 'Toto je typická hvězdicovitá (nebo stromová) topologie. Je důležité, aby se v tomto řetězci nevytvořila smyčka!',
    availableTools: ['blue-cable'],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 15, y: 50}, ports: [...R5], data: getRouterSettings() as any },
      { id: 'sw1', type: 'switch', name: 'Univo Switch', position: { x: 50, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'sw2', type: 'switch', name: 'Univo Switch', position: { x: 85, y: 50}, ports: [...S8], data: getSwitchSettings() as any }
    ],
    checkWinCondition: (_, cables) => hasLink(cables, 'gw', 'l1', 'sw1', null) && hasLink(cables, 'sw1', null, 'sw2', null)
  },

  // --- KAPITOLA 10: Firewall & brána ---
  {
    id: '10-1', chapter: 10, title: 'Blokování útoku',
    description: 'Internet je nebezpečné místo. Firewall je jako vyhazovač u dveří. Musíme nastavit pravidlo, které zablokuje veškerý nevyžádaný provoz zvenčí.',
    task: 'V nastavení Firewallu zapni pravidlo "WAN-IN: Blokovat vše".',
    explanation: 'Firewall kontroluje každý příchozí paket. Pokud neodpovídá žádné povolené komunikaci, kterou jsi začal ty zevnitř, prostě ho zahodí.',
    availableTools: [],
    initialDevices: [
      { id: 'fw', type: 'router', name: 'Univo Router', position: { x: 50, y: 50}, ports: [...R5], data: getFirewallSettings({ wanInBlock: { type: 'toggle', label: 'WAN-IN: Blokovat vše', value: false, category: 'network' } }) as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'fw')?.data?.wanInBlock.value
  },
  {
    id: '10-2', chapter: 10, title: 'Port forwarding',
    description: 'Chceš si s kamarády zahrát Minecraft na svém serveru, ale tvůj firewall k němu nikoho nepustí. Musíš "otevřít port" a nasměrovat ho na IP adresu serveru.',
    task: 'Zapni "Port Forward (25565 -> Server)" v nastavení Univo Routeru.',
    explanation: 'Port Forwarding (NAT passthrough) říká routeru: "Když někdo přijde na port 25565, pošli ho na toto konkrétní PC ve vnitřní síti".',
    availableTools: [],
    initialDevices: [
      { id: 'fw', type: 'router', name: 'Univo Router', position: { x: 30, y: 50}, ports: [...R5], data: getFirewallSettings() as any },
      { id: 'srv', type: 'server', name: 'Minecraft Server', position: { x: 70, y: 50}, ports: [{id:'eth',type:'ETH',label:'ETH'}], data: getGenericSettings() as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'fw')?.data?.portForward.value
  },
  {
    id: '10-3', chapter: 10, title: 'LAN izolace',
    description: 'Máš síť pro hosty (Guest) a svou soukromou síť. Nechceš, aby hosté mohli vidět tvé fotky v NAS serveru. Musíš zapnout izolaci sítí.',
    task: 'Zapni "LAN Izolace (VLAN <-> VLAN)" v nastavení firewallu.',
    explanation: 'Izolace (Inter-VLAN block) zakáže routeru přeposílat pakety mezi dvěma lokálními sítěmi, i když obě mají internet.',
    availableTools: [],
    initialDevices: [
      { id: 'fw', type: 'router', name: 'Univo Router', position: { x: 50, y: 50}, ports: [...R5], data: getFirewallSettings({ lanIsolation: { type: 'toggle', label: 'LAN Izolace (VLAN ↔ VLAN)', value: false, category: 'network' } }) as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'fw')?.data?.lanIsolation.value
  },

  // --- KAPITOLA 11: Veřejná vs privátní IP ---
  {
    id: '11-1', chapter: 11, title: 'NAT překlad',
    description: 'V tvé síti má každé zařízení adresu jako 192.168.1.x. V internetu máš ale jen jednu adresu (např. 82.10.15.42). Router provádí NAT (Network Address Translation).',
    task: 'Ujisti se, že je NAT zapnutý v nastavení routeru.',
    explanation: 'NAT umožňuje tisícům zařízení v domě sdílet jednu jedinou veřejnou IP adresu. Router si pamatuje, kdo co chtěl, a vrací odpovědi správným lidem.',
    availableTools: [],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 50, y: 50}, ports: [...R5], data: getRouterSettings({ nat: { type: 'toggle', label: 'NAT Překlad Adres', value: false, category: 'network' } }) as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'gw')?.data?.nat.value
  },
  {
    id: '11-2', chapter: 11, title: 'Internet pro celou rodinu',
    description: 'Máš doma více počítačů a všichni chtějí být online. Musíš je všechny připojit k Univo Routeru, který je propojen s ISP zásuvkou.',
    task: 'Propoj ISP k routeru a oba počítače k LAN portům routeru.',
    explanation: 'Router díky NATu a DHCP serveru obslouží celou domácnost z jedné linky od poskytovatele.',
    availableTools: ['blue-cable'],
    initialDevices: [
       { id: 'isp', type: 'internet', name: 'Internet (ISP)', position: { x: 10, y: 50}, ports: [{id:'p1',type:'WAN',label:'ISP'}], data: getIspSettings() as any },
       { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 45, y: 50}, ports: [...R5], data: getRouterSettings() as any },
       { id: 'pc1', type: 'pc', name: 'PC 1', position: { x: 80, y: 25}, ports: [{id:'e1',type:'ETH',label:'ETH'}], data: getClientSettings() as any },
       { id: 'pc2', type: 'pc', name: 'PC 2', position: { x: 80, y: 75}, ports: [{id:'e1',type:'ETH',label:'ETH'}], data: getClientSettings() as any }
    ],
    checkWinCondition: (_, cables) => 
      hasLink(cables, 'isp', 'p1', 'gw', 'wan') && 
      hasLink(cables, 'gw', null, 'pc1', 'e1') &&
      hasLink(cables, 'gw', null, 'pc2', 'e1')
  },
  {
    id: '11-3', chapter: 11, title: 'Co je CGNAT',
    description: 'Někdy tvůj "veřejný" port na routeru dostane od poskytovatele adresu, která začíná na 100.x.x.x. To je CGNAT. V tom případě Port Forwarding NEBUDE fungovat.',
    task: 'Změň typ WAN adresy na "Veřejná (Standardní)" v nastavení Internetu.',
    explanation: 'Carrier-Grade NAT znamená, že poskytovatel dělá NAT ještě dříve, než signál dojde k tobě domů. Jsi "schovaný" za routerem svého poskytovatele spolu se stovkami sousedů.',
    availableTools: [],
    initialDevices: [
      { id: 'isp', type: 'internet', name: 'ISP', position: { x: 50, y: 50}, ports: [{id:'p1',type:'WAN',label:'ISP'}], data: getIspSettings({ ipType: { type: 'select', label: 'Typ přidělené IP', value: 'CGNAT (Sdílená)', options: [{value:'CGNAT (Sdílená)',label:'CGNAT (Sdílená)'}, {value:'Public',label:'Veřejná (Standardní)'}], category: 'network' } }) as any }
    ],
    checkWinCondition: (devices) => devices.find(d => d.id === 'isp')?.data?.ipType.value === 'Public'
  },

  // --- KAPITOLA 12: IoT síť ---
  {
    id: '12-1', chapter: 12, title: 'IoT VLAN',
    description: 'Chytré žárovky, vysavače a čínské kamery jsou často bezpečnostním rizikem. Je dobré je dát do úplně jiné, oddělené sítě – IoT VLAN.',
    task: 'Na portu 5 Univo Switche (kde je připojen vysavač) nastav profil "VLAN 20 (IoT)".',
    explanation: 'Segmentace sítě zajistí, že i když někdo hackne tvůj vysavač, nedostane se z něj do tvého počítače s bankovnictvím.',
    availableTools: [],
    initialDevices: [
      { id: 'sw', type: 'switch', name: 'Univo Switch', position: { x: 40, y: 50}, ports: [...S8], data: getSwitchSettings() as any },
      { id: 'iot', type: 'pc', name: 'Chytrý Vysavač', position: { x: 80, y: 50}, ports: [{id:'e1',type:'ETH',label:'ETH'}], data: getIoTSettings() as any }
    ],
    initialCables: [{ id: 'c1', fromDevice: 'sw', fromPort: 'p5', toDevice: 'iot', toPort: 'e1'}],
    checkWinCondition: (devices) => devices.find(d => d.id === 'sw')?.data?.p5vlan.value === 'VLAN 20'
  },
  {
    id: '12-3', chapter: 12, title: 'Izolace IoT zařízení',
    description: 'Poslední krok: Máme IoT síť, ale stále se z ní dá "dopingat" do hlavní sítě. Musíme nastavit firewall tak, aby IoT mohlo jen do internetu.',
    task: 'V nastavení brány zapni "Izolace IoT sítě".',
    explanation: 'Tohle je zlatý standard domácího síťařství. Bezpečná a moderní síť, kde se nepoužívaná nebo nespolehlivá zařízení nemohou šířit dál.',
    availableTools: [],
    initialDevices: [
      { id: 'gw', type: 'router', name: 'Univo Router', position: { x: 50, y: 50}, ports: [...R5], data: getRouterSettings({ iotIso: { type: 'toggle', label: 'Izolace IoT sítě', value: false, category: 'network' } }) as any }
    ],
    checkWinCondition: (devices) => !!devices.find(d => d.id === 'gw')?.data?.iotIso.value
  }
];
