const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  feedbackText: String,
  rating: { type: Number, min: 1, max: 5 },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
