export type Basis = '+' | 'x';
export type Bit = 0 | 1;

/**
 * Encodes a key bit into a photon polarization angle based on the chosen basis.
 * + basis: 0 -> 90deg (↕), 1 -> 0deg (↔)
 * x basis: 0 -> 45deg (↗), 1 -> 135deg (↖)
 */
export function encodePolarization(bit: Bit, basis: Basis): number {
  if (basis === '+') {
    return bit === 0 ? 90 : 0;
  } else {
    return bit === 0 ? 45 : 135;
  }
}

/**
 * Measures a photon in a given basis.
 * If the measuring basis matches the encoding basis (which can be derived from the angle),
 * the measurement is deterministic. If it's the wrong basis, it collapses to 0 or 1 with 50% probability.
 */
export function measurePhoton(trueAngle: number, measureBasis: Basis): { bit: Bit; collapsed: boolean } {
  // Determine the true basis of the incoming photon based on its angle
  const isIncomingPlus = trueAngle === 0 || trueAngle === 90;
  const isIncomingCross = trueAngle === 45 || trueAngle === 135;

  let collapsed = false;
  let measuredBit: Bit = 0;

  if (measureBasis === '+') {
    if (isIncomingPlus) {
      // Correct basis
      measuredBit = trueAngle === 90 ? 0 : 1;
    } else {
      // Wrong basis, collapse 50/50
      collapsed = true;
      measuredBit = Math.random() < 0.5 ? 0 : 1;
    }
  } else { // measureBasis === 'x'
    if (isIncomingCross) {
      // Correct basis
      measuredBit = trueAngle === 45 ? 0 : 1;
    } else {
      // Wrong basis, collapse 50/50
      collapsed = true;
      measuredBit = Math.random() < 0.5 ? 0 : 1;
    }
  }

  return { bit: measuredBit, collapsed };
}

/**
 * Eve intercepts the photon, picks a random basis to measure, and sends the collapsed state forward.
 */
export function simulateEveIntercept(photonAngle: number): { angle: number; collapsed: boolean; eavesdroppedBasis: Basis } {
  const eavesdroppedBasis: Basis = Math.random() < 0.5 ? '+' : 'x';
  const { bit, collapsed } = measurePhoton(photonAngle, eavesdroppedBasis);
  const newAngle = encodePolarization(bit, eavesdroppedBasis);
  
  return { angle: newAngle, collapsed, eavesdroppedBasis };
}

/**
 * Calculates the Quantum Bit Error Rate (QBER)
 */
export function calculateQBER(aliceKey: Bit[], bobKey: Bit[]): number {
  if (aliceKey.length === 0) return 0;
  
  let errors = 0;
  for (let i = 0; i < aliceKey.length; i++) {
    if (aliceKey[i] !== bobKey[i]) {
      errors++;
    }
  }
  
  return (errors / aliceKey.length) * 100;
}

export function generateRandomBit(): Bit {
  // Using window.crypto for better pseudo-randomness
  const array = new Uint8Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % 2 === 0 ? 0 : 1;
}

export function generateRandomBasis(): Basis {
  const array = new Uint8Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % 2 === 0 ? '+' : 'x';
}

export function getArrowSymbol(angle: number): string {
  switch (angle) {
    case 90: return '↕'; // + basis, bit 0
    case 0: return '↔';  // + basis, bit 1
    case 45: return '↗'; // x basis, bit 0
    case 135: return '↖';// x basis, bit 1
    default: return '?';
  }
}
