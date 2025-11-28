import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import cors from "cors";

// Required for Railway
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Use official packed version
chromium.packed =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Railway PDF Server Running!");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    console.log("📥 PDF request received");

    const { htmlContent } = req.body;
    if (!htmlContent) return res.status(400).json({ error: "Missing HTML" });

    const execPath = await chromium.executablePath();
    console.log("Chromium exec path:", execPath);

    const browser = await puppeteer.launch({
      executablePath: execPath,
      args: chromium.args.concat(["--no-sandbox", "--disable-setuid-sandbox"]),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });

    res.send(pdf);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
