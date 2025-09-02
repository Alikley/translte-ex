import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// مسیر باینری whisper.cpp (نسخه جدید: whisper-cli.exe)
const WHISPER_PATH = path.resolve(
  "../whisper.cpp/build/bin/Release/whisper-cli.exe"
);

// مسیر مدل
const MODEL_PATH = path.resolve("./models/ggml-base.en.bin");

app.post("/stt", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio uploaded" });
  }

  const inputPath = req.file.path;
  const outputPath = `${inputPath}.txt`;

  console.log("🎧 Running whisper.cpp on:", inputPath);

  // اجرای whisper-cli.exe
  const whisper = spawn(WHISPER_PATH, [
    "-m",
    MODEL_PATH,
    "-f",
    inputPath,
    "-otxt", // خروجی به صورت متن
    "-of",
    inputPath, // فایل خروجی
  ]);

  whisper.stdout.on("data", (data) => {
    console.log(`whisper: ${data}`);
  });

  whisper.stderr.on("data", (data) => {
    console.error(`whisper error: ${data}`);
  });

  whisper.on("close", (code) => {
    console.log(`whisper exited with code ${code}`);

    fs.readFile(outputPath, "utf8", (err, text) => {
      if (err) {
        return res.status(500).json({ error: "Failed to read output" });
      }

      // حذف فایل‌ها بعد از پردازش
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      res.json({ text });
    });
  });
});

app.listen(3000, () => {
  console.log("🚀 Whisper server running at http://localhost:3000/stt");
});
