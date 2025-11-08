const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");

const router = express.Router();

// Ensure uploads directory exists
const uploadsRoot = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// File filter: images only
const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// POST /api/uploads/qr
router.post("/qr", upload.single("qr"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = path.join(uploadsRoot, req.file.filename);
  try {
    // Load image and attempt to decode QR
    const image = await Jimp.read(filePath);
    const qr = new QrCode();

    const value = await new Promise((resolve, reject) => {
      qr.callback = (err, v) => (err ? reject(err) : resolve(v));
      qr.decode(image.bitmap);
    });

    if (!value || !value.result) {
      // Not a QR: cleanup file and reject
      try { fs.unlinkSync(filePath); } catch {}
      return res.status(400).json({ message: "Uploaded image is not a valid QR code" });
    }

    // Public URL served by /uploads static
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.status(201).json({ url, decoded: value.result });
  } catch (err) {
    // On failure, cleanup and return bad request
    try { fs.unlinkSync(filePath); } catch {}
    return res.status(400).json({ message: "Uploaded image is not a valid QR code" });
  }
});

module.exports = router;
