const express = require("express");
const router = express.Router();
const { getConfig, createOrder, verifyAndRegister } = require("../controllers/paymentController");

router.get("/config", getConfig);
router.post("/order", createOrder);
router.post("/verify", verifyAndRegister);

module.exports = router;
