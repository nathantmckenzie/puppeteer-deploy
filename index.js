import express from "express";
import puppeteer from "puppeteer-core";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.send("PDF server is running!");
});

// Generate PDF
app.post("/generate-pdf", async (req, res) => {
  console.log("📥 PDF request received");

  try {
    const { htmlContent } = req.body;
    if (!htmlContent) return res.status(400).json({ error: "Missing HTML" });

    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    console.log("Chromium exec path:", chromiumPath);
    console.log("Path exists:", fs.existsSync(chromiumPath));

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: chromiumPath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "letter", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// Use Railway's PORT or fallback
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 PDF server running on port ${PORT}`));
