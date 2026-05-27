export class AudioManager {
  private audioContext: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private masterVolume = 1;
  private sources: AudioBufferSourceNode[] = [];

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async loadSound(id: string, url: string): Promise<void> {
    const ctx = this.getContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.buffers.set(id, audioBuffer);
  }

  loadSoundFromBuffer(id: string, buffer: AudioBuffer): void {
    this.buffers.set(id, buffer);
  }

  playSound(id: string, volume = 1): void {
    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    this.sources.push(source);
    source.onended = () => {
      this.sources = this.sources.filter(s => s !== source);
    };
  }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  stopAll(): void {
    for (const source of this.sources) {
      try { source.stop(); } catch { /* already stopped */ }
    }
    this.sources = [];
  }

  destroy(): void {
    this.stopAll();
    this.buffers.clear();
    this.audioContext?.close();
    this.audioContext = null;
  }
}
