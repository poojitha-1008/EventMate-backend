const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
}, { timestamps: true });

const venueSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  description: String,
  capacity: { 
    type: Number, 
    required: true 
  },
  facilities: [{
    type: String
  }],
  location: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  bookings: [bookingSchema]
}, { timestamps: true });

// 'name' already has a unique index via the schema field; no additional index declaration to avoid duplicates

// Add method to check availability
venueSchema.methods.isAvailable = async function(startTime, endTime, excludeBookingId = null) {
  const query = {
    _id: this._id,
    $or: [
      { 'bookings.startTime': { $lt: endTime }, 'bookings.endTime': { $gt: startTime } },
      { 'bookings.startTime': { $lte: startTime }, 'bookings.endTime': { $gte: endTime } },
      { 'bookings.startTime': { $gte: startTime, $lt: endTime } },
      { 'bookings.endTime': { $gt: startTime, $lte: endTime } }
    ]
  };

  if (excludeBookingId) {
    query['bookings._id'] = { $ne: excludeBookingId };
  }

  const overlappingBooking = await this.model('Venue').findOne(query);
  return !overlappingBooking;
};

module.exports = mongoose.model('Venue', venueSchema);
