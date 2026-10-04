import '@testing-library/jest-dom';

// Polyfill window.crypto for jsdom environment (used in quantum.ts)
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: <T extends ArrayBufferView>(arr: T): T => {
      if (arr instanceof Uint8Array) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
      }
      return arr;
    },
  },
});

// Suppress Three.js WebGL warnings in jsdom
Object.defineProperty(window, 'WebGLRenderingContext', { value: {} });
