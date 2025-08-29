import { captureYouTubeAudio } from "./audioCapture";

console.log("YouTube content script loaded ✅");

// وقتی ویدئو آماده شد، شروع به گرفتن صدا کن
const tryStartCapture = () => {
  const video = document.querySelector("video") as HTMLVideoElement | null;
  if (video) {
    captureYouTubeAudio();
  } else {
    console.log("No video found yet, retrying...");
    setTimeout(tryStartCapture, 2000);
  }
};

tryStartCapture();
