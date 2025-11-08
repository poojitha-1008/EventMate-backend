const mongoose = require("mongoose");

const subEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["cultural", "sports", "technical"], required: false },
  registrationFee: { type: Number, required: false },
  registrationDeadline: { type: Date, required: false },
  maxTeamSize: { type: Number, required: false },
  time: { type: String, required: false },
  venue: { type: String, required: false },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Fest'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subEvents: [{
    name: String,
    date: Date,
    description: String
  }]
}, {
  timestamps: true
});


module.exports = mongoose.model("Event", eventSchema);
