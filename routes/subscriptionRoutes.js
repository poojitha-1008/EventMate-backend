const express = require("express");
const { subscribe, unsubscribe, status } = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);
router.get("/status", status);

module.exports = router;
