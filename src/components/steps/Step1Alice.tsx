import React, { useEffect } from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { getArrowSymbol } from '../../utils/quantum';
import { RefreshCw, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const Step1Alice: React.FC = () => {
  const { qubits, generateAliceQubits, nextStep } = useQuantumStore();

  useEffect(() => {
    if (qubits.length === 0) {
      generateAliceQubits();
    }
  }, [qubits.length, generateAliceQubits]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00f0ff] mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">STEP 1: ALICE PREPARES QUBITS</h2>
          <p className="text-gray-300 font-mono text-sm max-w-xl">
            Alice generates 100 random bits (0 or 1) and chooses a random measurement basis (Rectilinear '+' or Diagonal 'x') for each. She then encodes the bits into photon polarizations.
          </p>
        </div>
        <button 
          onClick={generateAliceQubits}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 transition-all font-mono text-sm"
        >
          <RefreshCw size={16} /> REGeneRATE
        </button>
      </div>

      <div className="flex-1 glass-panel p-4 rounded-xl overflow-y-auto">
        <div className="grid grid-cols-10 gap-2">
          {qubits.map((qubit) => (
            <div 
              key={qubit.id} 
              className={clsx(
                "relative group flex flex-col items-center justify-center p-2 rounded border border-white/10 bg-black/40 hover:bg-white/10 transition-colors",
                "shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              )}
            >
              <div className="text-xs text-gray-500 absolute top-1 left-1.5">{qubit.id + 1}</div>
              
              <div className="text-2xl text-[#00f0ff] font-bold drop-shadow-[0_0_5px_rgba(0,240,255,0.8)] my-1">
                {getArrowSymbol(qubit.photonAngle)}
              </div>
              
              <div className="flex space-x-2 text-[10px] font-mono mt-1 opacity-60 group-hover:opacity-100">
                <span className="text-gray-300">Bit: {qubit.aliceBit}</span>
                <span className="text-[#00f0ff]">{qubit.aliceBasis}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 rounded-lg font-mono font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]"
        >
          SEND THROUGH QUANTUM CHANNEL <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step1Alice;
