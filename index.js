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
  res.send("Hello World!");
});

app.post("/generate-pdf", async (req, res) => {
  console.log("📥 PDF request received");

  try {
    const { htmlContent } = req.body;
    if (!htmlContent) {
      console.error("❌ Missing HTML in request");
      return res.status(400).json({ error: "Missing HTML" });
    }

    const path = await chromium.executablePath();
    console.log("Chromium exec path:", path);

    // Confirm the executable exists
    const fs = await import("fs");

    fs.writeFileSync("/tmp/test.pdf", pdfBuffer);
    console.log("PDF saved to /tmp/test.pdf");

    console.log("Path exists:", fs.existsSync(path));

    // Launch browser
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"].concat(chromium.args),
      executablePath: path,
      headless: chromium.headless,
    });
    console.log("✅ Browser launched");

    const page = await browser.newPage();
    console.log("✅ Page created");

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    console.log("✅ HTML content set");

    const pdfBuffer = await page.pdf({ format: "letter", printBackground: true });
    console.log("✅ PDF generated, buffer length:", pdfBuffer.length);

    await browser.close();
    console.log("✅ Browser closed");

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 PDF server running on port ${PORT}`));
