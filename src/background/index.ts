import { MessageType } from "../types";
import { encodeWav } from "../utils/wavEncoder"; // ⬅️ از util
// import fs from "fs";

let popupPorts: chrome.runtime.Port[] = [];
let audioBuffer: Int16Array[] = [];
let sampleRate = 44100;

// مدیریت اتصال popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup-logger") {
    popupPorts.push(port);

    port.onDisconnect.addListener(() => {
      popupPorts = popupPorts.filter((p) => p !== port);
    });
  }

  if (port.name === "audio-stream") {
    port.onMessage.addListener((msg) => {
      if (msg.type === MessageType.AUDIO_CHUNK) {
        console.log("🎧 Audio chunk received:", msg.data.length);

        // ذخیره صدا
        const chunk = new Int16Array(msg.data);
        audioBuffer.push(chunk);
        sampleRate = msg.sampleRate;

        // ارسال به popup برای دیباگ
        for (const p of popupPorts) {
          p.postMessage(msg);
        }
      }
    });
  }
});

// هر 5 ثانیه یک بار صدا رو به سرور بفرست
setInterval(async () => {
  if (audioBuffer.length === 0) return;

  const combined = new Int16Array(
    audioBuffer.reduce((acc, cur) => acc + cur.length, 0)
  );
  let offset = 0;
  for (const chunk of audioBuffer) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // پاک کردن بافر
  audioBuffer = [];

  // ساخت فایل WAV
  const wavBlob = encodeWav(combined, sampleRate);

  try {
    const formData = new FormData();
    formData.append(
      "audio",
      new Blob([wavBlob], { type: "audio/wav" }),
      "chunk.wav"
    );

    const res = await fetch("http://localhost:3000/stt", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log("📄 Whisper text:", data.text);

    // ارسال به popup
    for (const p of popupPorts) {
      p.postMessage({
        type: "TRANSCRIPT",
        text: data.text,
      });
    }
  } catch (err) {
    console.error("Whisper fetch error:", err);
  }
}, 5000);
