const Event = require("../models/Event");
const SubEvent = require("../models/SubEvent");

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      // accept case-insensitive status values and match documents saved with any casing
      const normalized = String(status).toLowerCase();
      if (["pending", "approved", "rejected"].includes(normalized)) {
        filter.status = new RegExp(`^${normalized}$`, "i");
      }
    }
    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Event (name/date/description/type)
exports.updateEvent = async (req, res) => {
  try {
    const { name, date, description, type } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (date !== undefined) update.date = date;
    if (description !== undefined) update.description = description;
    if (type !== undefined) update.type = type;
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { name, date, description, type, subEvents } = req.body;
    if (!name || !date || !description) {
      return res.status(400).json({ message: "name, date, description are required" });
    }
    const createdBy = req.user?._id || null;
    const event = await Event.create({ name, date, description, type, subEvents, createdBy });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update event status (admin)
exports.updateStatus = async (req, res) => {
  try {
    let { status } = req.body;
    if (typeof status === "string") status = status.toLowerCase();
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign faculty to event (admin)
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { assignedFaculty: facultyId },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get events by faculty member
exports.getFacultyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.params.facultyId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Add a Sub-Event to an Event (organizer)
exports.addSubEvent = async (req, res) => {
  try {
    const { name, category, registrationFee, registrationDeadline, maxTeamSize, time, venue, paymentQrUrl } = req.body;
    if (!name) return res.status(400).json({ message: "Sub-event name is required" });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const sub = await SubEvent.create({
      event: event._id,
      name,
      category,
      registrationFee,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      maxTeamSize,
      time,
      venue,
      paymentQrUrl,
    });

    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List Sub-Events for an Event
exports.listSubEvents = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('_id');
    if (!event) return res.status(404).json({ message: "Event not found" });
    const subs = await SubEvent.find({ event: event._id }).sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
