import { MessageType } from "../types";

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "audio-stream") return;

  port.onMessage.addListener((msg) => {
    if (
      msg.type === MessageType.AUDIO_CHUNK &&
      msg.data instanceof ArrayBuffer
    ) {
      // بازسازی Int16Array از ArrayBuffer
      const pcmData = new Int16Array(msg.data);

      console.log("🎧 Received chunk:", pcmData.length, "samples");
      console.log("📊 Sample rate:", msg.sampleRate);

      // 👉 اینجا می‌تونی pcmData رو استریم کنی به STT API (مرحله بعدی)
    }
  });
});
