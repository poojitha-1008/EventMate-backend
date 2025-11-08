const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// GET /api/users?role=faculty
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select("_id name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple auth middleware to read Bearer token and set req.userId
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = payload.id || payload._id || payload.userId;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// GET /api/users/me - current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select("_id name email role phone organization avatarUrl");
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me - update allowed fields
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, organization, avatarUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (organization !== undefined) updates.organization = organization;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    const me = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true }).select("_id name email role phone organization avatarUrl");
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
