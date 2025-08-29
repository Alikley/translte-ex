import { useEffect, useState } from "react";
import { MessageType } from "../types";

function App() {
  const [status, setStatus] = useState<"idle" | "capturing">("idle");
  const [lastChunk, setLastChunk] = useState<string>("No data yet");

  useEffect(() => {
    // اتصال به background
    const port = chrome.runtime.connect({ name: "popup-logger" });

    // دریافت پیام‌ها از background
    port.onMessage.addListener((msg) => {
      if (msg.type === MessageType.STATUS) {
        setStatus(msg.status);
      }
      if (msg.type === MessageType.AUDIO_CHUNK) {
        setLastChunk(`Samples: ${msg.data.length}, Rate: ${msg.sampleRate}`);
      }
    });

    // تمیزکاری هنگام بستن popup
    return () => {
      port.disconnect();
    };
  }, []);

  return (
    <div style={{ width: 250, padding: 12, fontFamily: "sans-serif" }}>
      <h3>🎤 YouTube Subtitle</h3>
      <p>
        <b>Status:</b> {status}
      </p>
      <div
        style={{
          marginTop: 10,
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 4,
          fontSize: "0.9em",
          background: "#f9f9f9",
        }}
      >
        <b>Last Audio Chunk:</b>
        <br />
        {lastChunk}
      </div>
    </div>
  );
}

export default App;
