const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  subEventId: { type: String, default: null },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

subscriptionSchema.index({ student: 1, event: 1, subEventId: 1 }, { unique: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
