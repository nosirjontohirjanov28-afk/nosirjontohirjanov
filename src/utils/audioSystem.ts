// Authentic BMW M Power (S58 3.0L TwinPower Turbo Inline-6) Sound Synthesizer
// Accurately reproduces BMW's signature metallic rasp, low-end rumble, twin-scroll turbo whistle,
// and the famous BMW M Competition overrun "burble & crackle pops" on throttle lift-off.

export type RadioStationId = 'off' | 'phonk' | 'synthwave' | 'tashkent' | 'chill';

export interface RadioStation {
  id: RadioStationId;
  name: string;
  genre: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  { id: 'off', name: 'Radio O‘chiq', genre: 'Faqat BMW M Ovozi' },
  { id: 'phonk', name: 'Phonk Drift 98.4 FM', genre: 'Dark Drift Bass' },
  { id: 'synthwave', name: 'Synthwave Night 104.2 FM', genre: 'Retro Cyberwave' },
  { id: 'tashkent', name: 'Tashkent Beat 102.5 FM', genre: 'Urban Night Drive' },
  { id: 'chill', name: 'Lofi City Chill 92.0 FM', genre: 'Smooth Cruising' },
];

class AudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Master & Mixer
  private masterGain: GainNode | null = null;

  // BMW Inline-6 Multi-Harmonic Synthesizer
  // Fundamental 3-pulse per rev + 2nd harmonic + 3rd harmonic (inline-6 firing order)
  private oscBase: OscillatorNode | null = null;   // Sawtooth base
  private oscFifth: OscillatorNode | null = null;  // 1.5x fifth overtone
  private oscOctave: OscillatorNode | null = null; // 2.0x second harmonic
  private oscSub: OscillatorNode | null = null;    // Sub-bass growl

  // BMW Signature Metallic Rasp & Throat Filters
  private bmwRaspFilter: BiquadFilterNode | null = null; // Peak filter around 950Hz with high Q for BMW rasp
  private engineLowpass: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // BMW Twin-Scroll Turbo Spool Whistle
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;

  // Tire Screech
  private screechGain: GainNode | null = null;
  private screechFilter: BiquadFilterNode | null = null;

  // BMW Overrun Burble Tracker
  private prevThrottle: number = 0;
  private prevRpm: number = 1000;
  private lastBurbleTime: number = 0;

  // Radio
  private radioStation: RadioStationId = 'phonk';
  private radioTimer: number | null = null;
  private radioGain: GainNode | null = null;
  private radioStep: number = 0;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.38;
      this.masterGain.connect(this.ctx.destination);

      // --- BMW Engine Circuit ---
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.3;

      // 1. BMW Signature Rasp Filter (Peaking around 900-1100 Hz gives iconic BMW S55/S58 metallic roar)
      this.bmwRaspFilter = this.ctx.createBiquadFilter();
      this.bmwRaspFilter.type = 'peaking';
      this.bmwRaspFilter.frequency.value = 950;
      this.bmwRaspFilter.Q.value = 4.2;
      this.bmwRaspFilter.gain.value = 6.0; // Boost metallic rasp

      // 2. Main engine lowpass
      this.engineLowpass = this.ctx.createBiquadFilter();
      this.engineLowpass.type = 'lowpass';
      this.engineLowpass.frequency.value = 450;
      this.engineLowpass.Q.value = 2.5;

      // Connect: Oscillators -> RaspFilter -> Lowpass -> EngineGain -> Master
      this.bmwRaspFilter.connect(this.engineLowpass);
      this.engineLowpass.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      // Inline-6 Fundamental Sawtooth (3 firings per revolution)
      this.oscBase = this.ctx.createOscillator();
      this.oscBase.type = 'sawtooth';
      this.oscBase.frequency.value = 48; // ~960 RPM idle
      this.oscBase.connect(this.bmwRaspFilter);
      this.oscBase.start();

      // Inline-6 Fifth overtone (gives throatier BMW roar)
      this.oscFifth = this.ctx.createOscillator();
      this.oscFifth.type = 'sawtooth';
      this.oscFifth.frequency.value = 72;
      this.oscFifth.connect(this.bmwRaspFilter);
      this.oscFifth.start();

      // Inline-6 Octave overtone
      this.oscOctave = this.ctx.createOscillator();
      this.oscOctave.type = 'triangle';
      this.oscOctave.frequency.value = 96;
      this.oscOctave.connect(this.bmwRaspFilter);
      this.oscOctave.start();

      // Deep Sub-Bass V8/I6 exhaust pulse
      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.value = 24;
      this.oscSub.connect(this.engineGain);
      this.oscSub.start();

      // --- BMW Twin-Scroll Turbo Spool ---
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.value = 2400;
      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.value = 0;
      this.turboOsc.connect(this.turboGain);
      this.turboGain.connect(this.masterGain);
      this.turboOsc.start();

      // --- Tire Screech Noise Loop ---
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.screechFilter = this.ctx.createBiquadFilter();
      this.screechFilter.type = 'bandpass';
      this.screechFilter.frequency.value = 1100;
      this.screechFilter.Q.value = 5.5;

      this.screechGain = this.ctx.createGain();
      this.screechGain.gain.value = 0;

      noiseSource.connect(this.screechFilter);
      this.screechFilter.connect(this.screechGain);
      this.screechGain.connect(this.masterGain);
      noiseSource.start();

      // --- Radio Synth ---
      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.value = 0.16;
      this.radioGain.connect(this.masterGain);
      this.startRadioSequence();

      this.isInitialized = true;
    } catch {
      // AudioContext blocked
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.isInitialized && !muted) this.init();
    if (this.ctx && this.ctx.state === 'suspended' && !muted) this.ctx.resume();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.38, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setRadioStation(station: RadioStationId) {
    this.radioStation = station;
    if (this.radioGain && this.ctx) {
      this.radioGain.gain.setTargetAtTime(station === 'off' ? 0 : 0.16, this.ctx.currentTime, 0.1);
    }
  }

  public getRadioStation(): RadioStationId {
    return this.radioStation;
  }

  // Real-time BMW Engine Audio Parameter Modulation (Runs at 120 FPS smoothly)
  public updateEngine(rpm: number, maxRpm: number, throttle: number, driftIntensity: number, turboBar: number) {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const rpmNorm = Math.min(1.05, Math.max(0.08, rpm / maxRpm));

    // BMW S58 firing frequency: 45Hz at 900 RPM idle up to 345Hz at 7400 RPM redline
    const baseFreq = 42 + rpmNorm * 290;
    const revLimiterPop = rpmNorm > 0.96 ? (Math.sin(now * 110) > 0 ? 25 : -25) : 0;

    if (this.oscBase && this.oscFifth && this.oscOctave && this.oscSub && this.engineLowpass && this.engineGain) {
      this.oscBase.frequency.setTargetAtTime(baseFreq + revLimiterPop, now, 0.02);
      this.oscFifth.frequency.setTargetAtTime((baseFreq + revLimiterPop) * 1.498, now, 0.02);
      this.oscOctave.frequency.setTargetAtTime((baseFreq + revLimiterPop) * 2.0, now, 0.02);
      this.oscSub.frequency.setTargetAtTime((baseFreq + revLimiterPop) * 0.5, now, 0.025);

      // Lowpass cutoff opens up dramatically on throttle (induction roar)
      const cutoff = 220 + rpmNorm * 1800 + throttle * 1200;
      this.engineLowpass.frequency.setTargetAtTime(cutoff, now, 0.03);

      // Volume scaling
      const vol = 0.22 + rpmNorm * 0.28 + throttle * 0.14;
      this.engineGain.gain.setTargetAtTime(vol, now, 0.03);
    }

    // BMW M Rasp Filter Frequency shifts with RPM (peaks at 850Hz-1400Hz)
    if (this.bmwRaspFilter) {
      const raspFreq = 850 + rpmNorm * 650;
      this.bmwRaspFilter.frequency.setTargetAtTime(raspFreq, now, 0.03);
    }

    // BMW Twin-Scroll Turbo Spool Whistle
    if (this.turboOsc && this.turboGain) {
      const boost = Math.max(0, turboBar / 2.2);
      this.turboOsc.frequency.setTargetAtTime(1800 + boost * 2800, now, 0.04);
      this.turboGain.gain.setTargetAtTime(boost * 0.048 * throttle, now, 0.04);
    }

    // Tire Screech
    if (this.screechGain && this.screechFilter) {
      const targetScreech = Math.min(0.32, driftIntensity * 0.3);
      this.screechGain.gain.setTargetAtTime(targetScreech, now, 0.04);
      this.screechFilter.frequency.setTargetAtTime(1000 + driftIntensity * 480, now, 0.04);
    }

    // Famous BMW M Overrun "Burble & Pops" when releasing throttle from high RPM!
    if (this.prevThrottle > 0.6 && throttle < 0.15 && rpm > 4200 && now - this.lastBurbleTime > 0.5) {
      this.triggerBmwBurbleSequence();
      this.lastBurbleTime = now;
    }

    this.prevThrottle = throttle;
    this.prevRpm = rpm;
  }

  // Famous BMW M Competition Exhaust Burble / Anti-Lag Crackle (rapid sequence of 3-4 gun-shot style pops)
  public triggerBmwBurbleSequence() {
    if (!this.isInitialized || !this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const time = now + i * (0.07 + Math.random() * 0.04);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + Math.random() * 100, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.07);

        gain.gain.setValueAtTime(0.42 * (1 - i * 0.15), time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.075);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.08);
      }
    } catch {
      // Ignore
    }
  }

  public triggerBackfire() {
    this.triggerBmwBurbleSequence();
  }

  public playHorn() {
    if (!this.isInitialized || !this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.frequency.value = 440; // BMW Dual Hella Horn
      osc2.frequency.value = 554;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  private startRadioSequence() {
    if (this.radioTimer) clearInterval(this.radioTimer);

    const phonkNotes = [55, 65.4, 73.4, 82.4, 55, 98, 82.4, 73.4];
    const synthNotes = [110, 130.8, 146.8, 164.8, 196, 220, 196, 164.8];
    const tashkentNotes = [87.3, 116.5, 130.8, 146.8, 174.6, 130.8, 116.5, 98];
    const chillNotes = [130.8, 164.8, 196, 246.9, 196, 164.8, 146.8, 130.8];

    this.radioTimer = window.setInterval(() => {
      if (!this.ctx || this.radioStation === 'off' || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        let noteArr = phonkNotes;
        if (this.radioStation === 'synthwave') noteArr = synthNotes;
        else if (this.radioStation === 'tashkent') noteArr = tashkentNotes;
        else if (this.radioStation === 'chill') noteArr = chillNotes;

        const freq = noteArr[this.radioStep % noteArr.length];
        this.radioStep++;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = this.radioStation === 'phonk' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const dur = this.radioStation === 'chill' ? 0.38 : 0.22;
        noteGain.gain.setValueAtTime(0.08, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(noteGain);
        if (this.radioGain) noteGain.connect(this.radioGain);
        osc.start(now);
        osc.stop(now + dur);
      } catch {
        // Ignore
      }
    }, 280);
  }
}

export const audioSystem = new AudioSystem();
