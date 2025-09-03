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

export function captureYouTubeAudio() {
  if (started) return;
  started = true;

  const video = document.querySelector("video");
  if (!video) {
    log.warn("ویدیویی یافت نشد. دوباره تلاش می‌کنم...");
    started = false;
    setTimeout(captureYouTubeAudio, 1500);
    return;
  }

  try {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(video);

    // گین برای کنترل صدا
    const gain = audioCtx.createGain();
    gain.gain.value = 1;
    source.connect(gain).connect(audioCtx.destination);

    // ScriptProcessorNode (روش قدیمی ولی ساده)
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);

    // سینک برای جلوگیری از دوبار شنیده شدن صدا
    const sink = audioCtx.createGain();
    sink.gain.value = 0;
    processor.connect(sink).connect(audioCtx.destination);

    // برای resume کردن audioCtx وقتی ساسپند شد
    const resume = () => audioCtx.state === "suspended" && audioCtx.resume();
    video.addEventListener("play", resume);

    const p = ensurePort();

    processor.onaudioprocess = (event) => {
      if (!portConnected) return;

      const f32 = event.inputBuffer.getChannelData(0);
      const chunks = chunkFloat32Array(f32, 1024);

      for (const c of chunks) {
        const pcm16 = float32ToInt16(c);

        try {
          p.postMessage({
            type: MessageType.AUDIO_CHUNK,
            data: pcm16.buffer, // ارسال به صورت ArrayBuffer
            sampleRate: audioCtx.sampleRate,
          });
        } catch (error) {
          log.error("خطا در ارسال پیام:", error);
          portConnected = false;
          break;
        }
      }
    };

    log.info("🎤 ضبط صدا شروع شد (ScriptProcessorNode)");
  } catch (error) {
    log.error("خطا در راه‌اندازی ضبط صدا:", error);
    started = false;
  }
}
