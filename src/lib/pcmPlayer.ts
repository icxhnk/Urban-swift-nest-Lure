/**
 * Play raw 24kHz 16-bit PCM base64 audio returned by Gemini TTS
 */
export async function playPcmAudio(base64Data: string, sampleRate = 24000): Promise<void> {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM little endian to Float32Array
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtxClass({ sampleRate });

  const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  buffer.getChannelData(0).set(float32Array);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  return new Promise((resolve) => {
    source.onended = () => {
      ctx.close();
      resolve();
    };
    source.start(0);
  });
}
