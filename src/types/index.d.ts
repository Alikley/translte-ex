export enum MessageType {
  AUDIO_CHUNK = "AUDIO_CHUNK",
}

// پیام عمومی
export interface ExtensionMessage {
  type: MessageType;
  data?: any;
}

// پیام خاص برای گرفتن صدا
export interface AudioChunkMessage extends ExtensionMessage {
  type: MessageType.AUDIO_CHUNK;
  data: ArrayBuffer; // ✅ داده بهینه
  sampleRate: number;
}
