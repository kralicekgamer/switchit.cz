import { useState, useEffect } from 'react';
import './App.css';
import type { Level, Device, Cable } from './game/types';
import { levels } from './game/levels';
import Sidebar from './components/Sidebar';
import Playground from './components/Playground';

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>(levels[0]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [cables, setCables] = useState<Cable[]>([]);
  const [selectedPort, setSelectedPort] = useState<{deviceId: string, portId: string} | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  // Inicializace levelu
  useEffect(() => {
    setDevices(currentLevel.initialDevices);
    setCables(currentLevel.initialCables || []);
    setSelectedPort(null);
    setTestResult(null);
  }, [currentLevel]);

  const handlePortClick = (deviceId: string, portId: string) => {
    // 1. Zkontroluj, zda na tomto portu už neleží nějaký kabel.
    // Pokud ano, tak ho prostě smažeme (odpojíme).
    const existingCableIndex = cables.findIndex(
      c => (c.fromDevice === deviceId && c.fromPort === portId) || 
           (c.toDevice === deviceId && c.toPort === portId)
    );

    if (existingCableIndex !== -1) {
      // Smazání kabelu
      const newCables = [...cables];
      newCables.splice(existingCableIndex, 1);
      setCables(newCables);
      setSelectedPort(null); // Zruš případný výběr tahání, uživatel zrovna mazal
      setTestResult(null);
      return;
    }

    // 2. Pokud tam kabel není, řešíme tahání nového kabelu.
    if (selectedPort) {
      if (selectedPort.deviceId === deviceId && selectedPort.portId === portId) {
        // Kliknutí na stejný (odkud zrovna táhneme) -> zrušit tahání
        setSelectedPort(null);
      } else {
        // Máme vybraný první bod a teď klikáme na druhý prázdný -> Propojit!
        const newCable: Cable = {
          id: `cable-${Date.now()}`,
          fromDevice: selectedPort.deviceId,
          fromPort: selectedPort.portId,
          toDevice: deviceId,
          toPort: portId,
          color: 'blue'
        };
        setCables([...cables, newCable]);
        setSelectedPort(null);
        setTestResult(null); // Reset result on change
      }
    } else {
      // Vybrání prvního bodu pro tažení
      setSelectedPort({ deviceId, portId });
    }
  };

  const handleNextLevel = () => {
    const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      setCurrentLevel(levels[currentIndex + 1]);
    }
  };

  const handleDeviceDataUpdate = (deviceId: string, key: string, value: any) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return { ...d, data: { ...d.data, [key]: { ...d.data![key], value } } };
      }
      return d;
    }));
    setTestResult(null); // Reset result on change
  };

  const handleTestConnection = () => {
    setIsTestRunning(true);
    setTestResult(null);

    // Simulace zpoždění sítě a spuštění animace paketu
    setTimeout(() => {
      const isWin = currentLevel.checkWinCondition(devices, cables);
      setTestResult(isWin ? 'success' : 'fail');
      setIsTestRunning(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-[#212529] font-sans">
      <Sidebar 
        level={currentLevel} 
        onTestConnection={handleTestConnection} 
        testResult={testResult} 
        isTestRunning={isTestRunning}
        onNextLevel={handleNextLevel}
        hasNextLevel={currentLevel.id !== levels[levels.length - 1].id}
      />
      <Playground 
        devices={devices} 
        cables={cables} 
        onPortClick={handlePortClick} 
        selectedPort={selectedPort} 
        isTestRunning={isTestRunning}
        onDeviceDataUpdate={handleDeviceDataUpdate}
      />
    </div>
  );
}

export default App;


