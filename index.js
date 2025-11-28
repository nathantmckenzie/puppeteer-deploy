import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import cors from "cors";

chromium.packed =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("WHAT THE HECKKK");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) return res.status(400).json({ error: "Missing HTML" });

    const browser = await puppeteer.launch({
      args: chromium.args.concat(["--no-sandbox", "--disable-setuid-sandbox"]),
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
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
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`PDF server running on port ${PORT}`));
