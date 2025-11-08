import Venue from '../models/Venue.js';
import Event from '../models/Event.js';
import NotificationService from '../services/notificationService.js';

// Get all venues
export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true })
      .select('-bookings')
      .sort({ name: 1 });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get venue by ID
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('bookings.event', 'name description')
      .populate('bookings.bookedBy', 'name email');
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check venue availability
export const checkAvailability = async (req, res) => {
  try {
    const { venueId, startTime, endTime } = req.query;
    
    if (!venueId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const isAvailable = await venue.isAvailable(new Date(startTime), new Date(endTime));
    
    res.json({
      isAvailable,
      venue: {
        id: venue._id,
        name: venue.name,
        capacity: venue.capacity,
        facilities: venue.facilities
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a venue
export const bookVenue = async (req, res) => {
  try {
    const { eventId, startTime, endTime, notes } = req.body;
    const venueId = req.params.id;
    
    if (!eventId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if venue is available
    const isAvailable = await venue.isAvailable(new Date(startTime), new Date(endTime));
    if (!isAvailable) {
      return res.status(400).json({ message: 'Venue is not available for the selected time slot' });
    }

    // Create booking
    const booking = {
      event: eventId,
      startTime,
      endTime,
      bookedBy: req.user._id,
      notes,
      status: 'pending'
    };

    venue.bookings.push(booking);
    await venue.save();

    // Update event with venue information
    event.venue = {
      venueId: venue._id,
      name: venue.name,
      bookingId: venue.bookings[venue.bookings.length - 1]._id
    };
    await event.save();

    // Notify admin about new booking request
    await NotificationService.createVenueBookingNotification(
      req.user._id,
      venue._id,
      venue.bookings[venue.bookings.length - 1]._id,
      venue.name,
      startTime,
      endTime
    );

    res.status(201).json({
      message: 'Venue booking request submitted successfully',
      booking: venue.bookings[venue.bookings.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { venueId, bookingId } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const booking = venue.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    await venue.save();

    // Notify user about booking status update
    await NotificationService.createVenueStatusNotification(
      booking.bookedBy,
      venue._id,
      booking._id,
      venue.name,
      status,
      adminNotes
    );

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get venue bookings
export const getVenueBookings = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { startDate, endDate, status } = req.query;
    
    const query = { _id: venueId };
    
    if (startDate && endDate) {
      query['bookings.startTime'] = { $gte: new Date(startDate) };
      query['bookings.endTime'] = { $lte: new Date(endDate) };
    }
    
    if (status) {
      query['bookings.status'] = status;
    }
    
    const venue = await Venue.findOne(query)
      .select('name bookings')
      .populate('bookings.event', 'name')
      .populate('bookings.bookedBy', 'name email');
    
    if (!venue) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    
    res.json({
      venue: {
        id: venue._id,
        name: venue.name
      },
      bookings: venue.bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
