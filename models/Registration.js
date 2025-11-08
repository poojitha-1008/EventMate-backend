const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  subEventId: { type: String, required: true },
  // captured details at time of registration
  name: { type: String },
  section: { type: String },
  year: { type: String, enum: ["2nd", "3rd", "4th"], default: undefined },
  dob: { type: Date },
  email: { type: String },
  contact: { type: String },
  // payment tracking
  amount: { type: Number, default: 0 }, // in INR
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  payment: {
    orderId: String,
    paymentId: String,
  },
  // participation outcome
  result: { type: String, enum: ["participated", "winner", "runner", "loser"], default: "participated" },
  registeredAt: { type: Date, default: Date.now },
});

// Ensure a student cannot register for the same sub-event twice (within an event)
registrationSchema.index({ student: 1, event: 1, subEventId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
