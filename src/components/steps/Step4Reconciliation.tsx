import React, { useState } from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { ArrowRight, Phone } from 'lucide-react';
import clsx from 'clsx';

const Step4Reconciliation: React.FC = () => {
  const { qubits, updateQubit, nextStep } = useQuantumStore();
  const [reconciled, setReconciled] = useState(false);
  
  const retainedCount = qubits.filter(q => q.isRetained).length;

  const handleReconcile = () => {
    qubits.forEach((q) => {
      const match = q.aliceBasis === q.bobBasis;
      updateQubit(q.id, { isRetained: match });
    });
    setReconciled(true);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00f0ff] mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">STEP 4: BASIS RECONCILIATION</h2>
          <p className="text-gray-300 font-mono text-sm max-w-xl">
            Alice and Bob communicate over a public, unencrypted classical channel (like a phone call). They exchange only the <span className="font-bold text-white">bases</span> they used, discarding bits where the bases did not match.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-panel p-4 rounded-xl overflow-y-auto">
        {!reconciled ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <Phone size={64} className="text-[#00f0ff] animate-bounce" />
            <div className="text-center font-mono text-gray-400 max-w-md">
              Initiate the public classical channel to compare bases...
            </div>
            <button 
              onClick={handleReconcile}
              className="px-8 py-4 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] rounded-xl font-mono text-xl font-bold tracking-wider hover:bg-[#00f0ff]/30 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              COMPARE BASES
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-center font-mono">
              <span className="text-[#00ff66] text-xl font-bold drop-shadow-[0_0_5px_#00ff66]">{retainedCount}</span>
              <span className="text-gray-400 ml-2">bits retained (Sifted Key)</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              <table className="w-full font-mono text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-gray-400">
                    <th className="py-2">ID</th>
                    <th className="py-2">Alice Basis</th>
                    <th className="py-2">Bob Basis</th>
                    <th className="py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {qubits.map((q) => {
                    const match = q.aliceBasis === q.bobBasis;
                    return (
                      <tr key={q.id} className={clsx(
                        "border-b border-white/5 transition-colors",
                        match ? "bg-[#00ff66]/10 text-white" : "bg-black/40 text-gray-600 opacity-50"
                      )}>
                        <td className="py-1">{q.id + 1}</td>
                        <td className="py-1 text-[#00f0ff]">{q.aliceBasis}</td>
                        <td className="py-1 text-[#00ff66]">{q.bobBasis}</td>
                        <td className="py-1 font-bold">
                          {match ? <span className="text-[#00ff66]">KEEP</span> : <span className="text-gray-500">DISCARD</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={nextStep}
          disabled={!reconciled}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all",
            reconciled 
              ? "bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]" 
              : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
          )}
        >
          SECURITY TEST <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step4Reconciliation;
