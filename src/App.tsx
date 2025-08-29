import { useState } from "react";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleCapture = () => {
    setIsCapturing(!isCapturing);

    // پیام به content script بفرستیم
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (flag: boolean) => {
            window.postMessage({ type: "TOGGLE_CAPTURE", flag }, "*");
          },
          args: [!isCapturing],
        });
      }
    });
  };

  return (
    <div style={{ width: 200, padding: 10, fontFamily: "sans-serif" }}>
      <h3>YouTube Subtitles</h3>
      <button onClick={toggleCapture}>
        {isCapturing ? "Stop Capture" : "Start Capture"}
      </button>
    </div>
  );
}

export default App;
