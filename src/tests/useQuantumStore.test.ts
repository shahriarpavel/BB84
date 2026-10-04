import { describe, it, expect, beforeEach } from 'vitest';
import { useQuantumStore } from '../store/useQuantumStore';
import { encodePolarization } from '../utils/quantum';
import type { Bit, Basis } from '../utils/quantum';

// Reset the Zustand store state to initial values before each test
beforeEach(() => {
  useQuantumStore.setState({
    step: 1,
    eveActive: false,
    qubits: [],
    qber: null,
    channelSecure: null,
    finalKey: [],
  });
});

// ─── Wizard Step Navigation ───────────────────────────────────────────────────

describe('Wizard Step Navigation', () => {
  it('starts on step 1', () => {
    expect(useQuantumStore.getState().step).toBe(1);
  });

  it('nextStep increments to step 2', () => {
    useQuantumStore.getState().nextStep();
    expect(useQuantumStore.getState().step).toBe(2);
  });

  it('nextStep does not go beyond step 5', () => {
    const store = useQuantumStore.getState();
    store.setStep(5);
    store.nextStep();
    expect(useQuantumStore.getState().step).toBe(5);
  });

  it('prevStep decrements from step 3 to step 2', () => {
    useQuantumStore.getState().setStep(3);
    useQuantumStore.getState().prevStep();
    expect(useQuantumStore.getState().step).toBe(2);
  });

  it('prevStep does not go below step 1', () => {
    useQuantumStore.getState().prevStep();
    expect(useQuantumStore.getState().step).toBe(1);
  });

  it('setStep jumps directly to a step', () => {
    useQuantumStore.getState().setStep(4);
    expect(useQuantumStore.getState().step).toBe(4);
  });
});

// ─── Eve Toggle ───────────────────────────────────────────────────────────────

describe('Eve Toggle', () => {
  it('starts with Eve inactive', () => {
    expect(useQuantumStore.getState().eveActive).toBe(false);
  });

  it('setEveActive(true) activates Eve', () => {
    useQuantumStore.getState().setEveActive(true);
    expect(useQuantumStore.getState().eveActive).toBe(true);
  });

  it('setEveActive(false) deactivates Eve', () => {
    useQuantumStore.getState().setEveActive(true);
    useQuantumStore.getState().setEveActive(false);
    expect(useQuantumStore.getState().eveActive).toBe(false);
  });
});

// ─── generateAliceQubits ─────────────────────────────────────────────────────

describe('generateAliceQubits', () => {
  it('generates exactly 100 qubits', () => {
    useQuantumStore.getState().generateAliceQubits();
    expect(useQuantumStore.getState().qubits).toHaveLength(100);
  });

  it('each qubit has a unique sequential id', () => {
    useQuantumStore.getState().generateAliceQubits();
    const ids = useQuantumStore.getState().qubits.map(q => q.id);
    ids.forEach((id, index) => expect(id).toBe(index));
  });

  it('each qubit has a valid aliceBit (0 or 1)', () => {
    useQuantumStore.getState().generateAliceQubits();
    useQuantumStore.getState().qubits.forEach(q => {
      expect([0, 1]).toContain(q.aliceBit);
    });
  });

  it('each qubit has a valid aliceBasis ("+" or "x")', () => {
    useQuantumStore.getState().generateAliceQubits();
    useQuantumStore.getState().qubits.forEach(q => {
      expect(['+', 'x']).toContain(q.aliceBasis);
    });
  });

  it('each qubit photonAngle matches encoding of its bit/basis', () => {
    useQuantumStore.getState().generateAliceQubits();
    useQuantumStore.getState().qubits.forEach(q => {
      const expected = encodePolarization(q.aliceBit, q.aliceBasis);
      expect(q.photonAngle).toBe(expected);
    });
  });

  it('all qubits start with isRetained=false and isTestBit=false', () => {
    useQuantumStore.getState().generateAliceQubits();
    useQuantumStore.getState().qubits.forEach(q => {
      expect(q.isRetained).toBe(false);
      expect(q.isTestBit).toBe(false);
    });
  });

  it('resets qber, channelSecure and finalKey on regeneration', () => {
    useQuantumStore.setState({ qber: 25, channelSecure: false, finalKey: [0, 1] as Bit[] });
    useQuantumStore.getState().generateAliceQubits();
    const state = useQuantumStore.getState();
    expect(state.qber).toBeNull();
    expect(state.channelSecure).toBeNull();
    expect(state.finalKey).toHaveLength(0);
  });

  it('produces a mix of bases (not all "+" or all "x")', () => {
    useQuantumStore.getState().generateAliceQubits();
    const bases = useQuantumStore.getState().qubits.map(q => q.aliceBasis);
    const plusCount = bases.filter(b => b === '+').length;
    // With 100 bits, the probability of all being same is astronomically low
    expect(plusCount).toBeGreaterThan(10);
    expect(plusCount).toBeLessThan(90);
  });
});

// ─── updateQubit ─────────────────────────────────────────────────────────────

describe('updateQubit', () => {
  beforeEach(() => {
    useQuantumStore.getState().generateAliceQubits();
  });

  it('updates the correct qubit by id', () => {
    useQuantumStore.getState().updateQubit(5, { bobBit: 1, bobBasis: 'x' });
    const qubit = useQuantumStore.getState().qubits[5];
    expect(qubit.bobBit).toBe(1);
    expect(qubit.bobBasis).toBe('x');
  });

  it('does not affect other qubits', () => {
    const before = useQuantumStore.getState().qubits[0].aliceBit;
    useQuantumStore.getState().updateQubit(5, { bobBit: 1 });
    expect(useQuantumStore.getState().qubits[0].aliceBit).toBe(before);
  });

  it('can mark a qubit as retained', () => {
    useQuantumStore.getState().updateQubit(3, { isRetained: true });
    expect(useQuantumStore.getState().qubits[3].isRetained).toBe(true);
  });

  it('can mark a qubit as intercepted with Eve basis', () => {
    useQuantumStore.getState().updateQubit(7, { isIntercepted: true, eveBasis: '+' as Basis });
    const q = useQuantumStore.getState().qubits[7];
    expect(q.isIntercepted).toBe(true);
    expect(q.eveBasis).toBe('+');
  });

  it('preserves existing fields when updating a single field', () => {
    const originalBit = useQuantumStore.getState().qubits[10].aliceBit;
    useQuantumStore.getState().updateQubit(10, { isRetained: true });
    expect(useQuantumStore.getState().qubits[10].aliceBit).toBe(originalBit);
  });
});

// ─── Initial Results State ────────────────────────────────────────────────────

describe('Initial Results State', () => {
  it('qber starts as null', () => {
    expect(useQuantumStore.getState().qber).toBeNull();
  });

  it('channelSecure starts as null', () => {
    expect(useQuantumStore.getState().channelSecure).toBeNull();
  });

  it('finalKey starts as empty array', () => {
    expect(useQuantumStore.getState().finalKey).toHaveLength(0);
  });
});
