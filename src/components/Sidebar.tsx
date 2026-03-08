import type { Level } from '../game/types';

interface SidebarProps {
  level: Level;
  onTestConnection: () => void;
  testResult: 'success' | 'fail' | null;
  isTestRunning: boolean;
  onNextLevel: () => void;
  hasNextLevel: boolean;
}

export default function Sidebar({ level, onTestConnection, testResult, isTestRunning, onNextLevel, hasNextLevel }: SidebarProps) {
  return (
    <aside className="w-[400px] flex-shrink-0 bg-white border-r border-[#e9ecef] flex flex-col shadow-sm z-10">
      
      {/* Hlavička */}
      <header className="p-6 border-b border-[#e9ecef]">
        <h1 className="text-xl font-bold tracking-tight text-[#212529]">Univo Network</h1>
        <p className="text-sm text-[#868e96] mt-1">Level {level.id}</p>
      </header>

      {/* Sekce Zadání */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">{level.title}</h2>
          <p className="text-sm text-[#343a40] leading-relaxed mb-4">
            {level.description}
          </p>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
            <strong>Úkol:</strong> {level.task}
          </div>
        </section>

        {/* Úspěch/Selhnání Tipy */}
        {testResult === 'success' && (
          <section className="p-4 bg-green-50 text-green-900 rounded-xl border border-green-200">
            <h3 className="font-bold mb-1 flex items-center gap-2"><span>✅</span> Úspěšně Spojeno!</h3>
            <p className="text-sm">{level.explanation}</p>
          </section>
        )}

        {testResult === 'fail' && (
          <section className="p-4 bg-red-50 text-red-900 rounded-xl border border-red-200">
            <h3 className="font-bold mb-1 flex items-center gap-2"><span>❌</span> Spojení Selhalo</h3>
            <p className="text-sm">Zkus překontrolovat kabely. Správný port dělá zázraky.</p>
          </section>
        )}

      </div>

      {/* Spodní patice s akcí */}
      <footer className="p-6 border-t border-[#e9ecef] bg-white flex flex-col gap-3">
        {testResult === 'success' && hasNextLevel && (
          <button 
            onClick={onNextLevel}
            className="w-full bg-[#40c057] hover:bg-[#37b24d] text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-green-100 flex items-center justify-center gap-2"
          >
            Další Level ➡️
          </button>
        )}
        <button 
          onClick={onTestConnection}
          disabled={isTestRunning}
          className={`w-full font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:ring-4 flex items-center justify-center gap-2
            ${isTestRunning 
              ? 'bg-[#dee2e6] text-[#868e96] cursor-not-allowed' 
              : 'bg-[#339af0] hover:bg-[#228be6] text-white focus:ring-blue-100'}`}
        >
          <span>{isTestRunning ? 'Testuji...' : 'Otestovat Spojení'}</span>
          {!isTestRunning && <span className="text-xl">🚀</span>}
        </button>
      </footer>

    </aside>
  );
}
