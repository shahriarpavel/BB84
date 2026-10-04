import React, { useState } from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { calculateQBER } from '../../utils/quantum';
import { triggerQuantumConfetti } from '../../utils/audio';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import clsx from 'clsx';

const Step5Test: React.FC = () => {
  const { qubits, updateQubit } = useQuantumStore();
  const [tested, setTested] = useState(false);

  // We need to write state locally and then to store if we want to bypass zustand logic issues
  const [localQber, setLocalQber] = useState<number | null>(null);
  const [isSecure, setIsSecure] = useState<boolean | null>(null);
  const [keyStr, setKeyStr] = useState<string>('');

  const runTest = () => {
    // 1. Get all retained qubits
    const retained = qubits.filter(q => q.isRetained);
    
    // 2. Select a subset for testing (up to half)
    const testCount = Math.min(20, Math.floor(retained.length / 2));
    
    // We just take the first N for simplicity of visual tracking
    const testSubset = retained.slice(0, testCount);
    const keySubset = retained.slice(testCount);

    testSubset.forEach(q => updateQubit(q.id, { isTestBit: true }));

    // 3. Compare Alice's sent bit and Bob's received bit
    const aliceTestBits = testSubset.map(q => q.aliceBit);
    const bobTestBits = testSubset.map(q => q.bobBit!);

    const calculatedQber = calculateQBER(aliceTestBits, bobTestBits);
    setLocalQber(calculatedQber);

    // Theoretical threshold is ~11%, setting 5% for safety margin
    const secure = calculatedQber < 5;
    setIsSecure(secure);
    setTested(true);

    if (secure) {
      triggerQuantumConfetti();
      useQuantumStore.setState({ channelSecure: true, qber: calculatedQber, finalKey: keySubset.map(q => q.bobBit!) });
      setKeyStr(keySubset.map(q => q.bobBit!).join(''));
    } else {
      useQuantumStore.setState({ channelSecure: false, qber: calculatedQber, finalKey: [] });
      setKeyStr('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00f0ff] mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">STEP 5: EAVESDROPPER DETECTION</h2>
          <p className="text-gray-300 font-mono text-sm max-w-xl">
            To ensure Eve hasn't intercepted the key, Alice and Bob publicly compare a random subset of their retained bits. If they differ significantly, the channel is compromised, and they abort.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-panel p-6 rounded-xl flex flex-col justify-center items-center overflow-y-auto">
        {!tested ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            <ShieldCheck size={64} className="text-[#00f0ff]" />
            <div className="text-center font-mono text-gray-400 max-w-md">
              Sacrifice 20 bits from the Sifted Key to calculate the Quantum Bit Error Rate (QBER).
            </div>
            <button 
              onClick={runTest}
              className="px-8 py-4 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] rounded-xl font-mono text-xl font-bold tracking-wider hover:bg-[#00f0ff]/30 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              RUN SECURITY TEST
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            
            <div className={clsx(
              "text-center p-6 rounded-xl border-2 w-full max-w-2xl mb-8",
              isSecure 
                ? "bg-[#00ff66]/10 border-[#00ff66]" 
                : "bg-[#ff0055]/10 border-[#ff0055]"
            )}>
              <div className="flex justify-center mb-4">
                {isSecure ? (
                  <ShieldCheck size={48} className="text-[#00ff66] drop-shadow-[0_0_10px_#00ff66]" />
                ) : (
                  <ShieldAlert size={48} className="text-[#ff0055] drop-shadow-[0_0_10px_#ff0055]" />
                )}
              </div>
              <h3 className={clsx(
                "text-3xl font-bold font-mono tracking-widest mb-2",
                isSecure ? "text-[#00ff66]" : "text-[#ff0055]"
              )}>
                QBER: {localQber?.toFixed(2)}%
              </h3>
              
              {isSecure ? (
                <p className="text-lg text-[#00ff66] font-mono mt-4">
                  ✅ CHANNEL SECURE. NO EVE DETECTED.<br/>KEY ESTABLISHED.
                </p>
              ) : (
                <p className="text-lg text-[#ff0055] font-mono mt-4 animate-pulse">
                  🚨 EAVESDROPPER DETECTED!<br/>WAVE FUNCTION COLLAPSE INTRODUCED ERRORS.<br/>ABORT MISSION.
                </p>
              )}
            </div>

            {isSecure && (
              <div className="w-full max-w-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-[#00f0ff]">
                  <KeyRound size={24} />
                  <h4 className="text-xl font-bold font-mono tracking-wider text-[#00f0ff]">SHARED SECRET KEY</h4>
                </div>
                <div className="p-4 bg-black/60 rounded-xl border border-[#00f0ff]/30 font-mono text-xl tracking-[0.5em] text-white shadow-inner break-all">
                  {keyStr}
                </div>
                <p className="text-gray-400 font-mono text-xs mt-4">This key can now be used for One-Time Pad encryption.</p>
              </div>
            )}
            
          </div>
        )}
      </div>

    </div>
  );
};

export default Step5Test;
