let context: AudioContext | undefined;
export function enableTimerAudio() {
  try {
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    context ??= new Audio();
    if (context.state === 'suspended') void context.resume();
    // Initialize audio from the user's tap, before a later timer callback.
    const buffer = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  } catch { /* Visual completion stays available if audio is unavailable. */ }
}
export async function signalTimer() {
  try {
    navigator.vibrate?.([180, 80, 180]);
    if (!context) return;
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running') return;
    for (let i = 0; i < 3; i++) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + i * 0.3;
      oscillator.frequency.value = 740;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.01);
      gain.gain.linearRampToValueAtTime(0, start + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
  } catch { /* Visual completion stays available if audio is unavailable. */ }
}
