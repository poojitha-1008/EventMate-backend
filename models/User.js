const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "faculty", "admin", "organizer"],
    default: "student",
  },
  department: { type: String, default: "" }, // optional
  phone: { type: String, default: "" },
  organization: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  designation: { type: String, default: "" },
  office: { type: String, default: "" },
  joiningDate: { type: Date },
  profileImage: { type: String, default: "" },
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
