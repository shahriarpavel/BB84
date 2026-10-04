import { describe, it, expect, vi } from 'vitest';
import {
  encodePolarization,
  measurePhoton,
  simulateEveIntercept,
  calculateQBER,
  getArrowSymbol,
  type Bit,
  type Basis,
} from '../utils/quantum';

// ─── encodePolarization ───────────────────────────────────────────────────────

describe('encodePolarization', () => {
  it('encodes bit=0, basis="+" as 90°', () => {
    expect(encodePolarization(0, '+')).toBe(90);
  });

  it('encodes bit=1, basis="+" as 0°', () => {
    expect(encodePolarization(1, '+')).toBe(0);
  });

  it('encodes bit=0, basis="x" as 45°', () => {
    expect(encodePolarization(0, 'x')).toBe(45);
  });

  it('encodes bit=1, basis="x" as 135°', () => {
    expect(encodePolarization(1, 'x')).toBe(135);
  });

  it('produces only valid angles', () => {
    const validAngles = [0, 45, 90, 135];
    const bits: Bit[] = [0, 1];
    const bases: Basis[] = ['+', 'x'];
    for (const bit of bits) {
      for (const basis of bases) {
        expect(validAngles).toContain(encodePolarization(bit, basis));
      }
    }
  });
});

// ─── measurePhoton ────────────────────────────────────────────────────────────

describe('measurePhoton', () => {
  // Correct basis → deterministic result, no collapse
  it('measures 90° with "+" basis correctly as bit=0', () => {
    const result = measurePhoton(90, '+');
    expect(result.bit).toBe(0);
    expect(result.collapsed).toBe(false);
  });

  it('measures 0° with "+" basis correctly as bit=1', () => {
    const result = measurePhoton(0, '+');
    expect(result.bit).toBe(1);
    expect(result.collapsed).toBe(false);
  });

  it('measures 45° with "x" basis correctly as bit=0', () => {
    const result = measurePhoton(45, 'x');
    expect(result.bit).toBe(0);
    expect(result.collapsed).toBe(false);
  });

  it('measures 135° with "x" basis correctly as bit=1', () => {
    const result = measurePhoton(135, 'x');
    expect(result.bit).toBe(1);
    expect(result.collapsed).toBe(false);
  });

  // Wrong basis → collapses, returned bit is still valid (0 or 1)
  it('collapses when measuring a "+" photon with "x" basis', () => {
    const result = measurePhoton(90, 'x');
    expect(result.collapsed).toBe(true);
    expect([0, 1]).toContain(result.bit);
  });

  it('collapses when measuring a "x" photon with "+" basis', () => {
    const result = measurePhoton(45, '+');
    expect(result.collapsed).toBe(true);
    expect([0, 1]).toContain(result.bit);
  });

  it('collapses when measuring 0° with "x" basis', () => {
    const result = measurePhoton(0, 'x');
    expect(result.collapsed).toBe(true);
    expect([0, 1]).toContain(result.bit);
  });

  it('collapses when measuring 135° with "+" basis', () => {
    const result = measurePhoton(135, '+');
    expect(result.collapsed).toBe(true);
    expect([0, 1]).toContain(result.bit);
  });

  it('statistical: wrong-basis collapses ~50% to each value over many runs', () => {
    const results = Array.from({ length: 2000 }, () => measurePhoton(90, 'x').bit);
    const zeros = results.filter(b => b === 0).length;
    const ratio = zeros / 2000;
    // Expect roughly 50% ± 5%
    expect(ratio).toBeGreaterThan(0.44);
    expect(ratio).toBeLessThan(0.56);
  });
});

// ─── simulateEveIntercept ─────────────────────────────────────────────────────

describe('simulateEveIntercept', () => {
  const validAngles = [0, 45, 90, 135];

  it('returns a valid angle for a "+" basis input', () => {
    const { angle } = simulateEveIntercept(90);
    expect(validAngles).toContain(angle);
  });

  it('returns a valid angle for an "x" basis input', () => {
    const { angle } = simulateEveIntercept(45);
    expect(validAngles).toContain(angle);
  });

  it('returns a valid eavesdropped basis', () => {
    const { eavesdroppedBasis } = simulateEveIntercept(0);
    expect(['+', 'x']).toContain(eavesdroppedBasis);
  });

  it('returns the same angle when basis guessed correctly (no collapse)', () => {
    // Force Math.random to return 0 so Eve always picks "+" basis
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    // Input: + basis photon (90°), Eve guesses "+": correct → no collapse, angle stays 90
    const { angle, collapsed, eavesdroppedBasis } = simulateEveIntercept(90);
    expect(eavesdroppedBasis).toBe('+');
    expect(collapsed).toBe(false);
    expect(angle).toBe(90);
    vi.restoreAllMocks();
  });

  it('collapses and changes angle when Eve picks wrong basis', () => {
    // Force Math.random to always pick 'x' basis (>= 0.5)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    // Input: + basis photon (90°), Eve guesses 'x': wrong → collapse
    const { collapsed } = simulateEveIntercept(90);
    expect(collapsed).toBe(true);
    vi.restoreAllMocks();
  });

  it('statistical: Eve causes collapse ~50% of the time across many photons', () => {
    const results = Array.from({ length: 1000 }, () => simulateEveIntercept(90));
    const collapsed = results.filter(r => r.collapsed).length;
    const ratio = collapsed / 1000;
    // Eve picks wrong basis ~50% of the time
    expect(ratio).toBeGreaterThan(0.40);
    expect(ratio).toBeLessThan(0.60);
  });
});

// ─── calculateQBER ────────────────────────────────────────────────────────────

describe('calculateQBER', () => {
  it('returns 0 for an empty key', () => {
    expect(calculateQBER([], [])).toBe(0);
  });

  it('returns 0% when keys match perfectly', () => {
    const alice: Bit[] = [0, 1, 0, 1, 0];
    const bob: Bit[]   = [0, 1, 0, 1, 0];
    expect(calculateQBER(alice, bob)).toBe(0);
  });

  it('returns 100% when all bits differ', () => {
    const alice: Bit[] = [0, 0, 0, 0];
    const bob: Bit[]   = [1, 1, 1, 1];
    expect(calculateQBER(alice, bob)).toBe(100);
  });

  it('returns 50% when half the bits differ', () => {
    const alice: Bit[] = [0, 0, 1, 1];
    const bob: Bit[]   = [0, 1, 1, 0];
    expect(calculateQBER(alice, bob)).toBe(50);
  });

  it('returns 25% for one error in four bits', () => {
    const alice: Bit[] = [0, 1, 1, 0];
    const bob: Bit[]   = [1, 1, 1, 0];
    expect(calculateQBER(alice, bob)).toBe(25);
  });

  it('handles a single-bit key with no error', () => {
    expect(calculateQBER([1], [1])).toBe(0);
  });

  it('handles a single-bit key with error', () => {
    expect(calculateQBER([0], [1])).toBe(100);
  });

  it('QBER < 5% indicates a secure channel (Eve absent)', () => {
    const alice: Bit[] = Array.from({ length: 100 }, () => 0);
    const bob: Bit[]   = Array.from({ length: 100 }, () => 0);
    const qber = calculateQBER(alice, bob);
    expect(qber).toBeLessThan(5);
  });

  it('QBER > 11% indicates Eve is present', () => {
    // ~25% error rate as expected when Eve intercepts with wrong basis ~50% of the time
    const alice: Bit[] = Array(20).fill(0).concat(Array(80).fill(1)) as Bit[];
    const bob: Bit[]   = Array(20).fill(1).concat(Array(80).fill(1)) as Bit[];
    const qber = calculateQBER(alice, bob);
    expect(qber).toBeGreaterThan(11);
  });
});

// ─── getArrowSymbol ───────────────────────────────────────────────────────────

describe('getArrowSymbol', () => {
  it('returns ↕ for 90° (+ basis, bit=0)', () => {
    expect(getArrowSymbol(90)).toBe('↕');
  });

  it('returns ↔ for 0° (+ basis, bit=1)', () => {
    expect(getArrowSymbol(0)).toBe('↔');
  });

  it('returns ↗ for 45° (x basis, bit=0)', () => {
    expect(getArrowSymbol(45)).toBe('↗');
  });

  it('returns ↖ for 135° (x basis, bit=1)', () => {
    expect(getArrowSymbol(135)).toBe('↖');
  });

  it('returns ? for an unknown angle', () => {
    expect(getArrowSymbol(999)).toBe('?');
    expect(getArrowSymbol(-1)).toBe('?');
  });
});

// ─── Protocol round-trip integration test ────────────────────────────────────

describe('BB84 Protocol Round-Trip', () => {
  it('Alice encodes, Bob measures with correct basis → always matches', () => {
    const bits: Bit[] = [0, 1, 0, 1];
    const bases: Basis[] = ['+', '+', 'x', 'x'];
    for (let i = 0; i < bits.length; i++) {
      const angle = encodePolarization(bits[i], bases[i]);
      const { bit, collapsed } = measurePhoton(angle, bases[i]);
      expect(collapsed).toBe(false);
      expect(bit).toBe(bits[i]);
    }
  });

  it('QBER is ~0% when no Eve and bases match', () => {
    const aliceBits: Bit[] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    const aliceBases: Basis[] = ['+', '+', 'x', 'x', '+', 'x', 'x', '+', '+', 'x'];
    const bobBits: Bit[] = aliceBits.map((bit, i) => {
      const angle = encodePolarization(bit, aliceBases[i]);
      return measurePhoton(angle, aliceBases[i]).bit; // Bob uses same basis
    });
    expect(calculateQBER(aliceBits, bobBits)).toBe(0);
  });
});
