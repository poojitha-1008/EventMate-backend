const express = require("express");
const VenueRequest = require("../models/VenueRequest");
const { protectUser, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Faculty sends a venue request (faculty must be authenticated)
router.post("/request", protectUser, async (req, res) => {
  try {
    const { facultyName, venueName, date, startTime, endTime, eventType, purpose, facultyEmail } = req.body;

    const newRequest = new VenueRequest({
      facultyName,
      facultyEmail: facultyEmail || req.user?.email,
      requestedBy: req.user?._id,
      venueName,
      date,
      startTime,
      endTime,
      eventType,
      purpose,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Request submitted successfully!", data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Faculty fetches only their own requests
router.get("/my-requests", protectUser, async (req, res) => {
  try {
    const email = req.user?.email;
    const name = req.user?.name;
    const query = {
      $or: [
        { requestedBy: req.user._id },
        ...(email ? [{ facultyEmail: email }] : []),
        ...(name ? [{ facultyName: name }] : []),
        ...(email ? [{ facultyName: email }] : [])
      ]
    };
    const myRequests = await VenueRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json(myRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin fetches all requests
router.get("/requests", protectUser, isAdmin, async (req, res) => {
  try {
    const requests = await VenueRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin approves or rejects a request
router.put("/requests/:id", protectUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updated = await VenueRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;