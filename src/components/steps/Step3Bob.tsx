import React, { useState } from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { measurePhoton, generateRandomBasis, getArrowSymbol } from '../../utils/quantum';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const Step3Bob: React.FC = () => {
  const { qubits, updateQubit, nextStep } = useQuantumStore();
  const [measured, setMeasured] = useState(false);

  const handleMeasure = () => {
    qubits.forEach((q) => {
      const bobBasis = generateRandomBasis();
      const { bit } = measurePhoton(q.photonAngle, bobBasis);
      
      updateQubit(q.id, {
        bobBasis,
        bobBit: bit,
      });
    });
    setMeasured(true);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00f0ff] mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">STEP 3: BOB MEASURES</h2>
          <p className="text-gray-300 font-mono text-sm max-w-xl">
            Bob receives the photons. He doesn't know which basis Alice used, so he randomly guesses a measurement basis for each incoming photon.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-panel p-4 rounded-xl overflow-y-auto">
        {!measured ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center font-mono text-gray-400 max-w-md">
              Waiting for Bob to measure the incoming photons...
            </div>
            <button 
              onClick={handleMeasure}
              className="px-8 py-4 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] rounded-xl font-mono text-xl font-bold tracking-wider hover:bg-[#00f0ff]/30 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              MEASURE QUBITS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-2">
            {qubits.map((qubit) => (
              <div 
                key={qubit.id} 
                className="relative group flex flex-col items-center justify-center p-2 rounded border border-white/10 bg-black/40 hover:bg-white/10 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              >
                <div className="text-[10px] text-gray-500 absolute top-1 left-1.5">{qubit.id + 1}</div>
                
                <div className="text-xl text-[#00f0ff] font-bold mt-1">
                  {getArrowSymbol(qubit.photonAngle)}
                </div>
                
                <div className="flex flex-col items-center text-[10px] font-mono mt-1 w-full border-t border-white/10 pt-1">
                  <span className="text-gray-400">Measure:</span>
                  <div className="flex space-x-2">
                    <span className="text-[#00ff66]">{qubit.bobBasis}</span>
                    <span className="text-white font-bold">{qubit.bobBit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={nextStep}
          disabled={!measured}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all",
            measured 
              ? "bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]" 
              : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
          )}
        >
          CALL ALICE (RECONCILIATION) <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step3Bob;
