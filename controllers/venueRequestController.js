const Venue = require("../models/Venue");

// GET /api/venues/requests (admin)
exports.getAllVenueRequests = async (req, res) => {
  try {
    const venues = await Venue.find()
      .populate("bookings.event", "name type date")
      .populate("bookings.bookedBy", "name email");

    const requests = [];
    for (const v of venues) {
      for (const b of v.bookings || []) {
        requests.push({
          _id: b._id,
          venueId: v._id,
          venueName: v.name,
          eventId: b.event?._id,
          eventName: b.event?.name,
          eventType: b.event?.type,
          date: b.event?.date,
          startTime: b.startTime,
          endTime: b.endTime,
          purpose: b.notes,
          status: b.status,
          requestedBy: b.bookedBy?._id || b.bookedBy,
          facultyName: b.bookedBy?.name,
          requestedByEmail: b.bookedBy?.email,
          adminNotes: b.adminNotes || null,
        });
      }
    }

    requests.sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/venues/requests/:bookingId (admin)
exports.updateVenueRequestStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNotes } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const venue = await Venue.findOne({ "bookings._id": bookingId });
    if (!venue) return res.status(404).json({ message: "Booking not found" });
    const booking = venue.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    if (typeof adminNotes === "string") booking.adminNotes = adminNotes;
    await venue.save();
    res.json({ message: `Request ${status} successfully`, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}