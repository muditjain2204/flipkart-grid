import { useEffect, useRef } from 'react';

export const useAudio = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Ref for looping ambient sound
  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  
  // Ref for ambulance siren sound
  const sirenOsc1Ref = useRef<OscillatorNode | null>(null);
  const sirenOsc2Ref = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  const initContext = () => {
    if (!audioCtxRef.current) {
      // @ts-ignore
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playClick = () => {
    try {
      initContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio click failed', e);
    }
  };

  const playWarning = () => {
    try {
      initContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(650, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio warning failed', e);
    }
  };

  const startAmbient = () => {
    try {
      initContext();
      const ctx = audioCtxRef.current;
      if (!ctx || ambientOscRef.current) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(45, ctx.currentTime); // low city rumble

      // Add a low frequency oscillator to wobble the hum volume slightly
      gain.gain.setValueAtTime(0.02, ctx.currentTime);

      osc.start(ctx.currentTime);
      
      ambientOscRef.current = osc;
      ambientGainRef.current = gain;
    } catch (e) {
      console.warn('Audio ambient hum failed to start', e);
    }
  };

  const stopAmbient = () => {
    if (ambientOscRef.current) {
      try {
        ambientOscRef.current.stop();
        ambientOscRef.current.disconnect();
      } catch (e) {}
      ambientOscRef.current = null;
    }
    if (ambientGainRef.current) {
      try {
        ambientGainRef.current.disconnect();
      } catch (e) {}
      ambientGainRef.current = null;
    }
  };

  const startSiren = () => {
    try {
      initContext();
      const ctx = audioCtxRef.current;
      if (!ctx || sirenOsc1Ref.current) return;

      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      sirenGainRef.current = gain;

      // Primary tone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(700, ctx.currentTime);
      osc1.connect(gain);
      osc1.start(ctx.currentTime);
      sirenOsc1Ref.current = osc1;

      // Harmonizer
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(705, ctx.currentTime);
      osc2.connect(gain);
      osc2.start(ctx.currentTime);
      sirenOsc2Ref.current = osc2;

      // Sweeper interval
      let high = false;
      const sweep = () => {
        const time = ctx.currentTime;
        const targetFreq = high ? 650 : 900;
        osc1.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.4);
        osc2.frequency.exponentialRampToValueAtTime(targetFreq + 5, time + 0.4);
        high = !high;
      };

      sweep();
      const intervalId = window.setInterval(sweep, 450);
      sirenIntervalRef.current = intervalId;
    } catch (e) {
      console.warn('Audio siren failed to start', e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOsc1Ref.current) {
      try {
        sirenOsc1Ref.current.stop();
        sirenOsc1Ref.current.disconnect();
      } catch (e) {}
      sirenOsc1Ref.current = null;
    }
    if (sirenOsc2Ref.current) {
      try {
        sirenOsc2Ref.current.stop();
        sirenOsc2Ref.current.disconnect();
      } catch (e) {}
      sirenOsc2Ref.current = null;
    }
    if (sirenGainRef.current) {
      try {
        sirenGainRef.current.disconnect();
      } catch (e) {}
      sirenGainRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAmbient();
      stopSiren();
    };
  }, []);

  return {
    initContext,
    playClick,
    playWarning,
    startAmbient,
    stopAmbient,
    startSiren,
    stopSiren,
  };
};
