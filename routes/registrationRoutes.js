const express = require("express");
const router = express.Router();
const { registerSubEvent, getStudentRegistrations, getEventRegistrations, getSubEventRegistrations, getStudentParticipationSummary } = require("../controllers/registrationController");
const { protectUser } = require("../middleware/authMiddleware");

router.post("/register", registerSubEvent);
router.get("/student/:studentId", getStudentRegistrations);
router.get("/student/:studentId/summary", protectUser, getStudentParticipationSummary);
router.get("/event/:eventId", getEventRegistrations);
router.get("/subevent/:subEventId", getSubEventRegistrations);

module.exports = router;
