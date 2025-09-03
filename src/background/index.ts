import { MessageType } from "../types";
import { encodeWav } from "../utils/wavEncoder"; // 🔹 اضافه کن

let popupPorts: chrome.runtime.Port[] = [];

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
        console.log("🎧 Audio chunk received:", msg.data?.byteLength);

        // تبدیل ArrayBuffer خام به Int16Array
        const int16 = new Int16Array(msg.data);

        // ساختن WAV درست با نرخ نمونه‌برداری صحیح
        const wavBuffer = encodeWav(int16, msg.sampleRate);

        const formData = new FormData();
        formData.append(
          "audio",
          new Blob([wavBuffer], { type: "audio/wav" }),
          "chunk.wav"
        );

        fetch("http://localhost:3000/stt", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("📝 Whisper text:", data.text);

            for (const p of popupPorts) {
              p.postMessage({
                type: MessageType.TRANSCRIPT,
                text: data.text,
              });
            }
          })
          .catch((err) => {
            console.error("❌ Whisper fetch error:", err);
          });
      }
    });
  }
});
