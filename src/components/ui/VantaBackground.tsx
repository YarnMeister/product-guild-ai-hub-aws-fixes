import { useEffect, useRef } from 'react';

// Declare VANTA global type
declare global {
  interface Window {
    VANTA: any;
  }
}

/**
 * VantaBackground component
 *
 * Renders an animated BIRDS background using Vanta.js.
 * Requires CDN scripts to be loaded in index.html:
 * - https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js
 * - https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js
 */
export function VantaBackground() {
  const vantaRef = useRef<any>(null);
  const vantaContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Vanta.js effect
  useEffect(() => {
    if (!vantaContainerRef.current || vantaRef.current) return;

    // Wait for VANTA to be available
    const initVanta = () => {
      if (window.VANTA && vantaContainerRef.current) {
        vantaRef.current = window.VANTA.BIRDS({
          el: vantaContainerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xf1264,
          color1: 0x1e1202,
          color2: 0xff9500,
          birdSize: 0.90,
          wingSpan: 17.00,
          speedLimit: 2.00,
          separation: 95.00,
          alignment: 92.00,
          cohesion: 62.00,
          quantity: 4.00
        });
      }
    };

    // Try to initialize immediately, or wait for scripts to load
    if (window.VANTA) {
      initVanta();
    } else {
      // Poll for VANTA availability
      const checkInterval = setInterval(() => {
        if (window.VANTA) {
          initVanta();
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup interval after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    // Cleanup function
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaContainerRef}
      className="fixed inset-0 z-0 vanta-loading-bg"
    />
  );
}

