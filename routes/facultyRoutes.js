const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { protectUser } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  updateProfileImage,
} = require("../controllers/facultyController");

const router = express.Router();

// Ensure uploads directory exists (backend/uploads)
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Profile routes
router.get("/profile", protectUser, getProfile);
router.put("/profile", protectUser, updateProfile);
router.put("/change-password", protectUser, changePassword);
router.get("/stats", protectUser, getStats);
router.put("/profile-image", protectUser, upload.single("profileImage"), updateProfileImage);

module.exports = router;
