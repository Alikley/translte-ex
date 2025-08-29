import { createRoot } from "react-dom/client";
import App from "./popup/App";

// تزریق کامپوننت React به صفحه یوتیوب
const root = document.createElement("div");
root.id = "farsi-subtitle-root";
document.body.appendChild(root);

// ایجاد ریشه و رندر کردن
const rootElement = createRoot(root);
rootElement.render(<App />);

// تزریق فایل صوتی
const script = document.createElement("script");
script.src = chrome.runtime.getURL("src/audio-capture.js");
document.head.appendChild(script);
