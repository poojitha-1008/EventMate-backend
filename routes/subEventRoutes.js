const express = require("express");
const router = express.Router();
const { getRoles, addRole, getSubEventById } = require("../controllers/subEventController");

// In future, add auth middleware like protectUser if needed
router.get("/:id", getSubEventById);
router.get("/:id/roles", getRoles);
router.post("/:id/roles", addRole);

module.exports = router;
