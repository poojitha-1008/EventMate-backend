const Subscription = require("../models/Subscription");

// Subscribe to event or specific sub-event
exports.subscribe = async (req, res) => {
  try {
    const { studentId, eventId, subEventId = null } = req.body;
    if (!studentId || !eventId) return res.status(400).json({ message: "studentId and eventId required" });

    const sub = await Subscription.findOneAndUpdate(
      { student: studentId, event: eventId, subEventId },
      { $setOnInsert: { student: studentId, event: eventId, subEventId } },
      { upsert: true, new: true }
    );
    res.json({ subscribed: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unsubscribe from event or sub-event
exports.unsubscribe = async (req, res) => {
  try {
    const { studentId, eventId, subEventId = null } = req.body;
    await Subscription.findOneAndDelete({ student: studentId, event: eventId, subEventId });
    res.json({ subscribed: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check subscription status
exports.status = async (req, res) => {
  try {
    const { studentId, eventId, subEventId = null } = req.query;
    const found = await Subscription.findOne({ student: studentId, event: eventId, subEventId });
    res.json({ subscribed: !!found });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
