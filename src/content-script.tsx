import ReactDOM from "react-dom";
import App from "./App";

// تزریق کامپوننت React به صفحه یوتیوب
const root = document.createElement("div");
root.id = "farsi-subtitle-root";
document.body.appendChild(root);
ReactDOM.render(<App />, root);

// تزریق فایل صوتی
const script = document.createElement("script");
script.src = chrome.runtime.getURL("src/audio-capture.js");
document.head.appendChild(script);
