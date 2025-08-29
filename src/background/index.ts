import { MessageType } from "../types";

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
        // لاگ صدا
        console.log("🎧 Audio chunk received:", msg.data.length);

        // ارسال به popup ها
        for (const p of popupPorts) {
          p.postMessage(msg);
        }
      }
    });
  }
});
