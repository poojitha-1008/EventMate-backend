const express = require("express");
const Feedback = require("../models/Feedback");
const { protectUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit feedback for an event
router.post("/:id", protectUser, async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const eventId = req.params.id;

    const fb = await Feedback.create({
      studentId: req.user?._id,
      eventId,
      feedbackText: feedback,
      rating,
    });

    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent feedbacks for dashboard
router.get("/recent", async (req, res) => {
  try {
    const list = await Feedback.find({})
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate({ path: "eventId", select: "name date type" })
      .populate({ path: "studentId", select: "name" });
    const mapped = list.map((f) => ({
      _id: f._id,
      feedbackText: f.feedbackText,
      rating: f.rating,
      submittedAt: f.submittedAt,
      event: f.eventId ? { _id: f.eventId._id, name: f.eventId.name, date: f.eventId.date, type: f.eventId.type } : null,
      student: f.studentId ? { _id: f.studentId._id, name: f.studentId.name } : null,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
