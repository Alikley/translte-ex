import { MessageType } from "../types";

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "audio-stream") return;

  port.onMessage.addListener((msg) => {
    if (msg.type === MessageType.AUDIO_CHUNK && Array.isArray(msg.data)) {
      // تبدیل آرایه معمولی به Int16Array
      const pcmData = new Int16Array(msg.data);
      
      // اینجا pcmData یک Int16Array از داده‌های PCM است
      console.log("Chunk length:", pcmData.length);
      console.log("Sample rate:", msg.sampleRate);
      
      // در مرحله بعد: استریم به STT
      // می‌توانید از pcmData و msg.sampleRate استفاده کنید
    }
  });
});