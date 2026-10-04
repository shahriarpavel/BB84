# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # BB84 Quantum Key Distribution Simulator

  An interactive visual simulation of the **BB84 quantum key distribution protocol**. It demonstrates how Alice and Bob can establish a shared secret key, and how an eavesdropper (Eve) can be detected because measuring quantum states introduces errors.

  ## What This Simulation Actually Does

  The application uses 100 simulated photons (qubits). Each qubit carries a random bit and is represented by a photon polarization angle. The simulation walks through the same logical stages used by BB84:

  1. Alice prepares random qubits.
  2. The photons travel through a quantum channel, optionally monitored by Eve.
  3. Bob measures every photon using randomly selected bases.
  4. Alice and Bob publicly compare only their bases and keep matching positions.
  5. They test part of the remaining bits to detect interception and decide whether a key is safe to use.

  This is a browser-based educational model. It does not send real photons, use quantum hardware, or create production-grade encryption keys.

  ## BB84 Concepts Used Here

  ### Bits and bases

  Alice generates a random bit (`0` or `1`) and a random measurement basis for each qubit:

  - `+` rectilinear basis
  - `x` diagonal basis

  The bit is encoded as a polarization angle:

  | Basis | Bit 0 | Bit 1 |
  | --- | --- | --- |
  | `+` | 90 degrees | 0 degrees |
  | `x` | 45 degrees | 135 degrees |

  ### Measurement and wave-function collapse

  When Bob measures a photon using the same basis Alice used, he gets the original bit deterministically. When he uses the wrong basis, the measurement is random with a 50% chance for either bit. The simulation marks this as a collapse.

  ### Eve's interception

  When Eve is enabled, she intercepts each photon, chooses her own random basis, measures it, and sends a newly encoded photon to Bob. Eve cannot copy an unknown quantum state perfectly. If she uses the wrong basis, her measurement changes the state and can cause Bob to receive the wrong bit.

  The animation shows Eve's interception in the middle of the channel, and the intercepted qubit is marked in the simulation data.

  ## Five Simulation Steps

  ### 1. Alice prepares qubits

  The simulator generates 100 random bits and 100 random bases using the browser's `window.crypto` API. Each bit is encoded into one of the four polarization angles and displayed in the grid.

  ### 2. Quantum channel

  The photons are animated from Alice to Bob. Eve can be switched on before transmission. With Eve enabled, each photon may be measured and re-encoded by Eve, which can change its angle and introduce noise.

  ### 3. Bob measures

  Bob randomly chooses `+` or `x` for every incoming photon and measures it. Correct-basis measurements reproduce the encoded bit; wrong-basis measurements are random.

  ### 4. Basis reconciliation

  Alice and Bob communicate over a public classical channel. They reveal their bases, not their bit values. Any position where the bases differ is discarded. Positions with matching bases form the **sifted key**.

  ### 5. Security test and QBER

  The simulator uses up to half of the retained bits, with a maximum of 20 bits, as a public test sample. It compares Alice's and Bob's values and calculates the **Quantum Bit Error Rate (QBER)**:

  ```text
  QBER = (number of mismatched test bits / number of tested bits) x 100
  ```

  For this visual demo, a QBER below 5% is considered secure. If the test passes, the remaining retained Bob bits are shown as the shared secret key. If the error rate is 5% or higher, the channel is considered compromised and no key is accepted.

  > In theoretical BB84 discussions, thresholds depend on the security model and post-processing. The 5% value here is an intentionally strict demo threshold, not a universal security guarantee.

  ## How to Run Locally

  Requirements: Node.js and npm.

  ```bash
  npm install
  npm run dev
  ```

  Then open the local URL shown by Vite.

  ## Validation Commands

  ```bash
  npm run build
  npm run lint
  npm test -- --run
  ```

  ## Technology

  - React and TypeScript
  - Vite
  - Zustand for simulation state
  - Three.js and React Three Fiber for the Bloch sphere visualization
  - Framer Motion for photon/channel animations
  - Vitest and Testing Library for automated tests

  ## Educational Scope

  The simulator is designed to make the BB84 protocol easy to see and explain. It simplifies several real-world concerns, including finite-key statistical analysis, error correction, privacy amplification, authenticated classical communication, detector noise, and hardware imperfections. The displayed key should therefore be treated as a demonstration artifact, not as a real cryptographic secret.
