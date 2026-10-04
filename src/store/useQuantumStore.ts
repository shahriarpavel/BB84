import { create } from 'zustand';
import type { Bit, Basis } from '../utils/quantum';
import { generateRandomBit, generateRandomBasis, encodePolarization } from '../utils/quantum';

export interface QubitState {
  id: number;
  aliceBit: Bit;
  aliceBasis: Basis;
  photonAngle: number;
  
  // Eve's interference
  isIntercepted: boolean;
  eveBasis?: Basis;
  eveBit?: Bit;
  
  // Bob's measurement
  bobBasis?: Basis;
  bobBit?: Bit;
  
  // Is this bit kept after reconciliation?
  isRetained: boolean;
  
  // Is this bit used for the QBER test?
  isTestBit: boolean;
}

interface QuantumStore {
  // Wizard State
  step: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Simulation Settings
  eveActive: boolean;
  setEveActive: (active: boolean) => void;
  
  // Qubits array
  qubits: QubitState[];
  generateAliceQubits: () => void;
  updateQubit: (id: number, updates: Partial<QubitState>) => void;
  
  // Bulk actions for Steps
  transmitPhotons: (eveActive: boolean) => void;
  bobMeasure: () => void;
  reconcileBases: () => void;
  performSecurityTest: () => void;
  
  // Results
  qber: number | null;
  channelSecure: boolean | null;
  finalKey: Bit[];
}

const TOTAL_QUBITS = 100;
export const useQuantumStore = create<QuantumStore>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  
  eveActive: false,
  setEveActive: (eveActive) => set({ eveActive }),
  
  qubits: [],
  
  generateAliceQubits: () => {
    const newQubits: QubitState[] = Array.from({ length: TOTAL_QUBITS }).map((_, i) => {
      const bit = generateRandomBit();
      const basis = generateRandomBasis();
      const angle = encodePolarization(bit, basis);
      
      return {
        id: i,
        aliceBit: bit,
        aliceBasis: basis,
        photonAngle: angle,
        isIntercepted: false,
        isRetained: false,
        isTestBit: false,
      };
    });
    set({ qubits: newQubits, qber: null, channelSecure: null, finalKey: [] });
  },
  
  updateQubit: (id, updates) => set((state) => ({
    qubits: state.qubits.map(q => q.id === id ? { ...q, ...updates } : q)
  })),
  
  transmitPhotons: (_eveActive) => {
    void _eveActive;
    // This is handled visually during Step 2, but we can set up the state if needed
    // The actual interception logic might be triggered photon by photon for animation sync.
    // For simplicity, we just keep the boolean flag and handle logic in the component layer or here.
  },
  
  bobMeasure: () => {
    // We defer actual measurement math to the component or run it all at once here
  },
  
  reconcileBases: () => {
    // Just a placeholder, we'll actually update the qubits manually in the component for step 4
  },
  
  performSecurityTest: () => {
    // Placeholder
  },
  
  qber: null,
  channelSecure: null,
  finalKey: [],
}));
