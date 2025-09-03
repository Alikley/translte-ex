import { MessageType } from "../types";

let popupPorts: chrome.runtime.Port[] = [];

// اتصال popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup-logger") {
    popupPorts.push(port);

    port.onDisconnect.addListener(() => {
      popupPorts = popupPorts.filter((p) => p !== port);
    });
  }

  // اتصال استریم صدا
  if (port.name === "audio-stream") {
    port.onMessage.addListener((msg) => {
      if (msg.type === MessageType.AUDIO_CHUNK) {
        console.log("🎧 Audio chunk received:", msg.data?.byteLength);

        // آماده کردن داده برای ارسال به سرور Whisper
        const formData = new FormData();
        formData.append(
          "audio",
          new Blob([msg.data], { type: "audio/wav" }),
          "chunk.wav"
        );

        // ارسال به سرور STT
        fetch("http://localhost:3000/stt", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("📝 Whisper text:", data.text);

            // ارسال متن به popup ها
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
