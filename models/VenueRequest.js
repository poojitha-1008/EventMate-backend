const mongoose = require("mongoose");

const venueRequestSchema = new mongoose.Schema(
  {
    facultyName: {
      type: String,
      required: true,
    },
    facultyEmail: {
      type: String,
      trim: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    venueName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      default: "other",
    },
    purpose: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const VenueRequest = mongoose.model("VenueRequest", venueRequestSchema);
module.exports = VenueRequest;