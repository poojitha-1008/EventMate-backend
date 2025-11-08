const path = require("path");
const User = require("../models/User");
const Event = require("../models/Event");

const pickProfile = (u) => ({
  name: u.name || "",
  department: u.department || "",
  email: u.email || "",
  designation: u.designation || "",
  phone: u.phone || "",
  office: u.office || "",
  joiningDate: u.joiningDate ? new Date(u.joiningDate).toISOString().slice(0, 10) : "",
  profileImage: u.profileImage || u.avatarUrl || "",
});

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(pickProfile(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = (({ name, department, email, designation, phone, office, joiningDate }) => ({
      name, department, email, designation, phone, office, joiningDate
    }))(req.body || {});
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(pickProfile(user));
  } catch (err) {
    res.status(400).json({ message: "Failed to update profile" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findById(req.user._id);
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(400).json({ message: "Failed to change password" });
  }
};

const getStats = async (req, res) => {
  try {
    const eventsCreated = await Event.countDocuments({ createdBy: req.user._id });
    const pendingApprovals = await Event.countDocuments({ assignedFaculty: req.user._id, status: "pending" });
    const studentsMentored = 0;
    res.json({ eventsCreated, pendingApprovals, studentsMentored });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const rel = `/uploads/${path.basename(req.file.path)}`;
    await User.findByIdAndUpdate(req.user._id, { profileImage: rel }, { new: true });
    res.json({ profileImage: rel });
  } catch (err) {
    res.status(400).json({ message: "Failed to update profile image" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  updateProfileImage,
};