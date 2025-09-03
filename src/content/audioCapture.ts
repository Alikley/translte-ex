import { Logger } from "../utils/logger";
import { float32ToInt16, chunkFloat32Array } from "../utils/audioUtils";
import { MessageType } from "../types";

const log = new Logger("AudioCapture");

let started = false;
let port: chrome.runtime.Port | null = null;
let portConnected = false;

function ensurePort() {
  if (!port) {
    port = chrome.runtime.connect({ name: "audio-stream" });
    portConnected = true;

    port.onDisconnect.addListener(() => {
      port = null;
      portConnected = false;
      started = false;
      log.info("اتصال پورت قطع شد");
    });
  }
  return port!;
}

export async function captureYouTubeAudio() {
  if (started) return;
  started = true;

  const video = document.querySelector("video");
  if (!video) {
    log.warn("ویدیویی یافت نشد. مجدداً تلاش می‌کنم...");
    started = false;
    setTimeout(captureYouTubeAudio, 1500);
    return;
  }

  try {
    const audioCtx = new AudioContext();

    // ⬅️ AudioWorklet بارگذاری
    await audioCtx.audioWorklet.addModule(
      chrome.runtime.getURL("utils/audio-processor.js")
    );

    const source = audioCtx.createMediaElementSource(video);

    // ساخت AudioWorkletNode
    const workletNode = new AudioWorkletNode(audioCtx, "audio-processor");

    source.connect(workletNode).connect(audioCtx.destination);

    const p = ensurePort();

    // وقتی داده جدید میاد
    workletNode.port.onmessage = (event) => {
      const f32 = event.data as Float32Array;

      if (!f32 || f32.length === 0) return;

      const chunks = chunkFloat32Array(f32, 1024);
      for (const c of chunks) {
        const pcm16 = float32ToInt16(c);

        try {
          p.postMessage({
            type: MessageType.AUDIO_CHUNK,
            data: Array.from(pcm16), // ارسال ایمن
            sampleRate: audioCtx.sampleRate,
          });
        } catch (error) {
          log.error("خطا در ارسال پیام:", error);
          portConnected = false;
          break;
        }
      }
    };

    log.info("🎤 ضبط صدا با AudioWorklet شروع شد");
  } catch (error) {
    log.error("خطا در راه‌اندازی ضبط صدا:", error);
    started = false;
  }
}
