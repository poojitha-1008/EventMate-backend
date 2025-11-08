const Registration = require("../models/Registration");
const SubEvent = require("../models/SubEvent");
const Event = require("../models/Event");

// Register for a sub-event
exports.registerSubEvent = async (req, res) => {
  const { studentId, eventId, subEventId, name, section, year, dob, email, contact } = req.body;
  try {
    // Basic validation
    if (!studentId || !eventId || !subEventId) {
      return res.status(400).json({ message: "Missing required fields: studentId, eventId, subEventId" });
    }
    let regName = name;
    let regEmail = email;
    if (!regName || !regEmail) {
      try {
        const u = await require("../models/User").findById(studentId).select("name email");
        regName = regName || u?.name || "";
        regEmail = regEmail || u?.email || "";
      } catch {}
      if (!regName || !regEmail) {
        return res.status(400).json({ message: "Missing required fields: name, email" });
      }
    }
    if (year && !["2nd", "3rd", "4th"].includes(year)) {
      return res.status(400).json({ message: "Invalid year value" });
    }

    // Normalize IDs
    const eventIdStr = String(eventId);
    const subIdStr = String(subEventId);

    // Check if already registered
    const exists = await Registration.findOne({ student: studentId, event: eventIdStr, subEventId: subIdStr });
    if (exists) return res.status(400).json({ message: "Already registered" });

    // Determine fee from sub-event
    let amount = 0;
    try {
      const sub = await SubEvent.findById(subIdStr);
      if (sub && typeof sub.registrationFee === "number") {
        amount = sub.registrationFee;
      } else {
        // Fallback: look up embedded sub-event under parent Event
        try {
          const ev = await Event.findById(eventIdStr);
          const emb = (ev?.subEvents || []).find((s) => String(s._id) === subIdStr);
          if (emb && typeof emb.registrationFee === "number") amount = emb.registrationFee;
        } catch {}
      }
    } catch {}

    // Parse dob if provided
    let parsedDob = undefined;
    if (dob) {
      const d = new Date(dob);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid date of birth" });
      }
      parsedDob = d;
    }

    const registration = await Registration.create({
      student: studentId,
      event: eventIdStr,
      subEventId: subIdStr,
      name: regName,
      section,
      year,
      dob: parsedDob,
      email: regEmail,
      contact,
      amount,
    });
    res.status(201).json({ message: "Registered successfully", registration });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: "Already registered" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// Get student's registered sub-events
exports.getStudentRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.params.studentId }).populate("event");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get registrations for an event (all sub-events)
exports.getEventRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.eventId });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get registrations for a specific sub-event id (string)
exports.getSubEventRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ subEventId: req.params.subEventId });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Summary: Group student's participation by main event and include subevents registered with result
exports.getStudentParticipationSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Fetch student's registrations and populate events
    let regs = await Registration.find({ student: studentId }).populate("event");

    // Fallback: if none found (model may reference Student doc), try by email captured at registration
    if (!regs.length && req.user?.email) {
      regs = await Registration.find({ email: req.user.email }).populate("event");
    }

    // Group by event
    const byEvent = {};
    const subEventNameCache = new Map();
    for (const r of regs) {
      const ev = r.event;
      if (!ev) continue;
      const eventId = ev._id.toString();
      if (!byEvent[eventId]) {
        byEvent[eventId] = {
          eventId,
          eventName: ev.name,
          date: ev.date,
          type: ev.type,
          subEvents: [],
        };
      }
      // Try to resolve sub-event name from the parent event's subEvents
      let subEventName = r.subEventId;
      try {
        const matchSub = (ev.subEvents || []).find(se => se._id?.toString() === String(r.subEventId));
        if (matchSub?.name) subEventName = matchSub.name;
      } catch {}

      // Fallback: check separate SubEvent collection
      if (!subEventName || subEventName === r.subEventId) {
        const key = String(r.subEventId);
        if (subEventNameCache.has(key)) {
          subEventName = subEventNameCache.get(key) || subEventName;
        } else {
          try {
            const se = await require("../models/SubEvent").findById(r.subEventId);
            if (se?.name) {
              subEventName = se.name;
              subEventNameCache.set(key, se.name);
            } else {
              subEventNameCache.set(key, null);
            }
          } catch {}
        }
      }

      byEvent[eventId].subEvents.push({
        subEventId: r.subEventId,
        subEventName,
        registered: true,
        result: r.result || "participated",
      });
    }

    // Return as array
    res.json(Object.values(byEvent));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
