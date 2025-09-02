import { MessageType } from "../types";
import { encodeWav } from "../utils/wavEncoder";

let popupPorts: chrome.runtime.Port[] = [];

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup-logger") {
    popupPorts.push(port);

    port.onDisconnect.addListener(() => {
      popupPorts = popupPorts.filter((p) => p !== port);
    });
  }

  if (port.name === "audio-stream") {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === MessageType.AUDIO_CHUNK) {
        const pcmData = new Int16Array(msg.data);
        console.log("🎧 Audio chunk received:", pcmData.length);

        // 🔹 ارسال به popup ها
        for (const p of popupPorts) {
          p.postMessage(msg);
        }

        // 🔹 تبدیل به WAV و ارسال به سرور whisper.cpp
        try {
          const wavBuffer = encodeWav(pcmData, msg.sampleRate);

          const formData = new FormData();
          formData.append(
            "audio",
            new Blob([wavBuffer], { type: "audio/wav" }),
            "chunk.wav"
          );

          const res = await fetch("http://localhost:3000/stt", {
            method: "POST",
            body: formData,
          });

          const json = await res.json();
          console.log("📝 Whisper text:", json.text);

          // اگر خواستی متن رو به popup هم بفرستی:
          for (const p of popupPorts) {
            p.postMessage({ type: "TRANSCRIPT", text: json.text });
          }
        } catch (err) {
          console.error("❌ Whisper fetch error:", err);
        }
      }
    });
  }
});
