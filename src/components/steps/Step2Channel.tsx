import React, { useState, useEffect } from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { simulateEveIntercept, getArrowSymbol } from '../../utils/quantum';
import { playGlitchSound } from '../../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, Activity, Eye } from 'lucide-react';
import clsx from 'clsx';

const FlyingPhoton = ({ 
  isActive, startAngle, onIntercept, isEve, isComplete 
}: { 
  delay: number; 
  isActive: boolean;
  startAngle: number;
  onIntercept: () => void;
  isEve: boolean;
  isComplete: () => void;
}) => {
  const [currentAngle, setCurrentAngle] = useState(startAngle);
  const [intercepted, setIntercepted] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isActive) {
      if (isEve) {
        // Intercept midway
        timeout = setTimeout(() => {
          setIntercepted(true);
          onIntercept();
          playGlitchSound();
          
          // Eve changes it
          const { angle } = simulateEveIntercept(startAngle);
          setCurrentAngle(angle);

          // Continue to bob
          setTimeout(() => {
            setIntercepted(false);
          }, 600);
        }, 1000);
      }
      
      // Total flight time
      setTimeout(() => {
        isComplete();
      }, 2000);
    }
    
    return () => clearTimeout(timeout);
  }, [isActive, isEve, startAngle]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ x: '-10%', opacity: 0 }}
      animate={
        intercepted 
          ? { x: '50%', y: [0, -10, 10, -5, 5, 0], opacity: 1, scale: 1.5, filter: 'blur(4px)' }
          : { x: '110%', opacity: [0, 1, 1, 0], scale: 1, filter: 'blur(1px)' }
      }
      transition={{ duration: intercepted ? 0.6 : 2, ease: "linear" }}
      className={clsx(
        "absolute top-1/2 -mt-6 rounded-full w-12 h-12 flex items-center justify-center border",
        intercepted ? "bg-[#ff0055]/30 border-[#ff0055] text-[#ff0055]" : "bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]",
        intercepted ? "shadow-[0_0_30px_#ff0055]" : "shadow-[0_0_20px_#00f0ff]"
      )}
    >
      <span className="text-2xl font-bold">{getArrowSymbol(currentAngle)}</span>
    </motion.div>
  );
};


const Step2Channel: React.FC<{ activePhotonAngle: (angle: number | null, isEve: boolean) => void }> = ({ activePhotonAngle }) => {
  const { qubits, eveActive, setEveActive, updateQubit, nextStep } = useQuantumStore();
  const [transmitting, setTransmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activePhotonIndex, setActivePhotonIndex] = useState(-1);

  const startTransmission = () => {
    setTransmitting(true);
    setActivePhotonIndex(0);
  };

  useEffect(() => {
    if (transmitting && activePhotonIndex >= 0 && activePhotonIndex < qubits.length) {
      activePhotonAngle(qubits[activePhotonIndex].photonAngle, false);
    } else if (activePhotonIndex >= qubits.length) {
      setTimeout(() => {
        setTransmitting(false);
        setComplete(true);
        activePhotonAngle(null, false);
      }, 1000);
    }
  }, [transmitting, activePhotonIndex]);

  const handleIntercept = (index: number) => {
    const q = qubits[index];
    const { angle, eavesdroppedBasis } = simulateEveIntercept(q.photonAngle);
    activePhotonAngle(angle, true);
    
    updateQubit(q.id, {
      isIntercepted: true,
      photonAngle: angle,
      eveBasis: eavesdroppedBasis,
    });
  };

  const handleComplete = () => {
    setActivePhotonIndex((prev) => prev + 1);
  };

  // For the sake of UX, we might only animate the first ~10 or fast forward.
  // We'll animate rapid fire.
  
  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#00f0ff] mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">STEP 2: THE QUANTUM CHANNEL</h2>
          <p className="text-gray-300 font-mono text-sm max-w-xl">
            Photons are sent to Bob over an optical fiber. Eve might try to intercept and measure them. Because of the No-Cloning Theorem, she cannot copy them perfectly and introduces errors.
          </p>
        </div>
      </div>

      <div className="flex-1 glass-panel p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
        
        {/* Toggle Eve */}
        <div className="absolute top-4 right-4 z-20">
          <button
            disabled={transmitting || complete}
            onClick={() => setEveActive(!eveActive)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm transition-all shadow-lg",
              eveActive 
                ? "bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.4)]" 
                : "bg-white/5 border-white/20 text-gray-400 hover:border-white/50"
            )}
          >
            {eveActive ? <ShieldAlert size={18} /> : <ShieldAlert size={18} opacity={0.5} />}
            EVE EAVESDROPPING {eveActive ? '[ON]' : '[OFF]'}
          </button>
        </div>

        {/* The Channel Visualization */}
        <div className="w-full max-w-3xl h-48 relative border-y border-white/10 flex items-center bg-black/40">
          {/* Fiber Optic background lines */}
          <div className="absolute inset-0 flex flex-col justify-evenly opacity-20">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>
          </div>

          {/* Alice node */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/80 to-transparent flex flex-col items-center justify-center border-r border-[#00f0ff]/30 z-10">
            <span className="font-mono text-[#00f0ff] font-bold">ALICE</span>
            <Activity className="text-[#00f0ff] animate-pulse mt-2" />
          </div>

          {/* Bob node */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/80 to-transparent flex flex-col items-center justify-center border-l border-[#00f0ff]/30 z-10">
            <span className="font-mono text-[#00f0ff] font-bold">BOB</span>
            <Activity className="text-[#00f0ff] animate-pulse mt-2" />
          </div>

          {/* Eve Node */}
          <AnimatePresence>
            {eveActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute left-1/2 top-0 bottom-0 w-32 -ml-16 flex flex-col items-center justify-center z-10"
              >
                <div className="w-[1px] h-full absolute left-1/2 bg-[#ff0055]/50"></div>
                <div className="bg-[#ff0055]/20 p-3 rounded-full border border-[#ff0055] shadow-[0_0_20px_#ff0055] backdrop-blur-md">
                  <Eye className="text-[#ff0055]" size={32} />
                </div>
                <span className="mt-2 font-mono text-[#ff0055] font-bold drop-shadow-[0_0_5px_#ff0055]">EVE</span>
                {eveActive && transmitting && activePhotonIndex % 3 === 0 && (
                   <span className="absolute -bottom-6 text-[10px] text-[#ff0055] animate-pulse text-nowrap font-mono string">WAVE FUNCTION COLLAPSED</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flying photon */}
          {transmitting && activePhotonIndex < qubits.length && (
            <FlyingPhoton 
              key={activePhotonIndex}
              delay={0}
              isActive={true}
              startAngle={qubits[activePhotonIndex].photonAngle}
              isEve={eveActive}
              onIntercept={() => handleIntercept(activePhotonIndex)}
              isComplete={handleComplete}
            />
          )}

        </div>

        {/* Controls */}
        <div className="mt-12 text-center text-sm font-mono text-gray-400">
          {!transmitting && !complete && "Configure the channel above and start transmission."}
          {transmitting && `Transmitting Qubit ${activePhotonIndex + 1} / ${qubits.length}...`}
          {complete && <span className="text-[#00ff66] drop-shadow-[0_0_5px_#00ff66]">Transmission Complete! All 100 qubits safely (?) reached Bob.</span>}
        </div>

      </div>

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          {!transmitting && !complete && (
            <button 
              onClick={startTransmission}
              className="px-6 py-3 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] rounded-lg font-mono font-bold tracking-wider hover:bg-[#00f0ff]/30 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              START TRANSMISSION
            </button>
          )}
        </div>
        <button 
          onClick={nextStep}
          disabled={!complete}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold tracking-wider transition-all",
            complete 
              ? "bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]" 
              : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
          )}
        >
          PROCEED TO BOB <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step2Channel;
