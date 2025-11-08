const SubEvent = require("../models/SubEvent");

// GET /api/subevents/:id/roles
exports.getRoles = async (req, res) => {
  try {
    const sub = await SubEvent.findById(req.params.id).select("name roles event");
    if (!sub) return res.status(404).json({ message: "Sub-event not found" });
    res.json({ subEvent: { _id: sub._id, name: sub.name, event: sub.event }, roles: sub.roles || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/subevents/:id/roles { name }
exports.addRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Role name is required" });

    const sub = await SubEvent.findByIdAndUpdate(
      req.params.id,
      { $push: { roles: { name: name.trim() } } },
      { new: true, select: "name roles event" }
    );
    if (!sub) return res.status(404).json({ message: "Sub-event not found" });
    res.status(201).json({ subEvent: { _id: sub._id, name: sub.name, event: sub.event }, roles: sub.roles || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single sub-event by id
exports.getSubEventById = async (req, res) => {
  try {
    const sub = await SubEvent.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Sub-event not found" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
