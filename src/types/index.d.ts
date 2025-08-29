// src/types/index.d.ts

// 🔹 نوع پیام‌هایی که بین content ↔ background ↔ popup رد و بدل میشه
export enum MessageType {
  AUDIO_CHUNK = "AUDIO_CHUNK",
  TOGGLE_CAPTURE = "TOGGLE_CAPTURE",
  STATUS = "STATUS",
}

// 🔹 پیام عمومی
export interface ExtensionMessage {
  type: MessageType;
  data?: any;
}

// 🔹 پیام خاص برای گرفتن صدا
export interface AudioChunkMessage extends ExtensionMessage {
  type: MessageType.AUDIO_CHUNK;
  data: Float32Array;
}

// 🔹 پیام شروع/توقف کپچر
export interface ToggleCaptureMessage extends ExtensionMessage {
  type: MessageType.TOGGLE_CAPTURE;
  flag: boolean;
}

// 🔹 پیام وضعیت (مثلاً برای اطلاع دادن فعال/غیرفعال بودن)
export interface StatusMessage extends ExtensionMessage {
  type: MessageType.STATUS;
  status: "capturing" | "stopped";
}

// 🔹 اضافه کردن تعریف برای Window (چون از window.postMessage استفاده می‌کنیم)
interface Window {
  postMessage(
    message: ExtensionMessage,
    targetOrigin: string,
    transfer?: Transferable[]
  ): void;
}
