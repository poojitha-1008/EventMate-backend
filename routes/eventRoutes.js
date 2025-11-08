const express = require("express");
const router = express.Router();
const { getAllEvents, getEventById, createEvent, deleteEvent, updateStatus, assignFaculty, updateEvent, addSubEvent, listSubEvents } = require("../controllers/eventController");
const { protectUser, isAdmin } = require("../middleware/authMiddleware");

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", protectUser, createEvent);
router.put("/:id", protectUser, updateEvent);
router.delete("/:id", protectUser, deleteEvent);
router.put("/:id/status", protectUser, isAdmin, updateStatus);
router.put("/:id/assign-faculty", protectUser, isAdmin, assignFaculty);
router.post("/:id/subevents", protectUser, addSubEvent);
router.get("/:id/subevents", listSubEvents);

module.exports = router;
