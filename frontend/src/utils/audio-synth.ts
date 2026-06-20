class AudioSynth {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private sirenInterval: ReturnType<typeof setInterval> | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  public playWarning() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.setValueAtTime(700, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public startAmbient() {
    try {
      this.init();
      if (!this.ctx || this.ambientOsc) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, this.ctx.currentTime); // Low baseline hum

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      osc.start(this.ctx.currentTime);
      this.ambientOsc = osc;
    } catch {}
  }

  public startSiren() {
    try {
      this.init();
      if (!this.ctx || this.sirenOsc1) return;

      const gain = this.ctx.createGain();
      gain.connect(this.ctx.destination);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc1.connect(gain);
      osc1.start(this.ctx.currentTime);
      this.sirenOsc1 = osc1;

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(655, this.ctx.currentTime);
      osc2.connect(gain);
      osc2.start(this.ctx.currentTime);
      this.sirenOsc2 = osc2;

      let high = false;
      const sweep = () => {
        if (!this.ctx || !osc1 || !osc2) return;
        const time = this.ctx.currentTime;
        const targetFreq = high ? 600 : 850;
        osc1.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(targetFreq + 5, time + 0.35);
        high = !high;
      };

      sweep();
      this.sirenInterval = setInterval(sweep, 400);
    } catch {}
  }

  public stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc1) {
      try { this.sirenOsc1.stop(); this.sirenOsc1.disconnect(); } catch {}
      this.sirenOsc1 = null;
    }
    if (this.sirenOsc2) {
      try { this.sirenOsc2.stop(); this.sirenOsc2.disconnect(); } catch {}
      this.sirenOsc2 = null;
    }
  }
}

export const audioSynth = new AudioSynth();
