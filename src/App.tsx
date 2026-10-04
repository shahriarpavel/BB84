import { useState } from 'react';
import { useQuantumStore } from './store/useQuantumStore';
import BlochSphere from './components/BlochSphere';
import Step1Alice from './components/steps/Step1Alice';
import Step2Channel from './components/steps/Step2Channel';
import Step3Bob from './components/steps/Step3Bob';
import Step4Reconciliation from './components/steps/Step4Reconciliation';
import Step5Test from './components/steps/Step5Test';
import { Activity } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const { step, setStep } = useQuantumStore();

  const [activeAngle, setActiveAngle] = useState<number | null>(null);
  const [activeIsEve, setActiveIsEve] = useState<boolean>(false);

  const handleActivePhoton = (angle: number | null, isEve: boolean) => {
    setActiveAngle(angle);
    setActiveIsEve(isEve);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Alice />;
      case 2: return <Step2Channel activePhotonAngle={handleActivePhoton} />;
      case 3: return <Step3Bob />;
      case 4: return <Step4Reconciliation />;
      case 5: return <Step5Test />;
      default: return <Step1Alice />;
    }
  };

  return (
    /*
     * Layout strategy:
     *   - The page is NOT locked to h-screen globally; that breaks on short screens.
     *   - Instead we let the page scroll naturally via overflow-y-auto on body.
     *   - On large screens (lg+) we snap the main area to the remaining viewport
     *     height with a min-h constraint so both columns are always fully visible.
     *   - On smaller screens both panels stack, Bloch Sphere first (always visible),
     *     wizard steps below (naturally scrollable).
     */
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] text-white font-sans flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-md px-4 sm:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="text-[#00f0ff] shrink-0" />
          <h1 className="text-base sm:text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#00ff66]">
            BB84 QUANTUM SIMULATION
          </h1>
        </div>
        <div className="font-mono text-[10px] sm:text-xs text-gray-500 tracking-widest hidden sm:block">
          PROTOCOL IN PROGRESS | SECURE KEY DISTRIBUTION
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      {/*
       *  Mobile / tablet  (<lg): single column, stacked, page scrolls naturally.
       *  Desktop (≥lg):   two-column. Left wizard scrolls; right sphere is
       *                   sticky so it always stays within the viewport.
       */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4
                        max-w-[1600px] w-full mx-auto lg:items-start">

        {/* ── Left Column: Wizard ────────────────────────────────────── */}
        {/* lg: flex-1, naturally tall — drives the page scroll */}
        <div className="flex flex-col gap-4 min-w-0 lg:flex-1">

          {/* Progress Timeline */}
          <div className="shrink-0 glass-panel px-4 sm:px-6 py-3 rounded-xl
                           flex justify-between items-center relative">
            {/* connector rail */}
            <div className="absolute top-1/2 left-8 right-8 h-px bg-white/10 pointer-events-none -translate-y-1/2" />
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className="relative z-10 flex flex-col items-center gap-1 cursor-pointer"
                onClick={() => setStep(s)}
              >
                <div className={clsx(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                  'font-mono font-bold text-base sm:text-lg border-2 transition-all duration-300',
                  step === s
                    ? 'bg-[#00f0ff] border-[#00f0ff] text-black shadow-[0_0_20px_#00f0ff]'
                    : step > s
                    ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                    : 'bg-black border-white/20 text-gray-500',
                )}>
                  {s}
                </div>
                <span className={clsx(
                  'text-[9px] sm:text-[10px] font-mono tracking-wider hidden sm:block transition-colors',
                  step === s ? 'text-[#00f0ff]' : 'text-gray-500',
                )}>
                  {['ALICE', 'CHANNEL', 'BOB', 'RECONCILE', 'SECURITY'][s - 1]}
                </span>
              </div>
            ))}
          </div>

          {/* Step content scrolls naturally with the page */}
          <div className="flex-1">
            {renderStep()}
          </div>
        </div>

        {/* ── Right Column: Bloch Sphere ─────────────────────────────── */}
        {/*
         *  Mobile (<lg): compact strip always above the wizard (order-first).
         *  Desktop (≥lg): sticky panel — stays fixed inside the viewport however
         *                 tall the left column grows. top accounts for header height.
         */}
        <div className="order-first lg:order-none
                         w-full h-[220px] sm:h-[260px]
                         lg:sticky lg:top-[57px]
                         lg:w-[360px] xl:w-[440px]
                         lg:[height:calc(100vh-57px-2rem)] lg:shrink-0">
          <BlochSphere activeAngle={activeAngle} isEve={activeIsEve} />
        </div>

      </main>
    </div>
  );
}

export default App;
