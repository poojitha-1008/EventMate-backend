const Razorpay = require("razorpay");
const crypto = require("crypto");
const Registration = require("../models/Registration");

function getClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
  }
  return new Razorpay({ key_id, key_secret });
}

// GET /api/payments/config
exports.getConfig = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || "" });
};

// POST /api/payments/order { amount, currency, receipt, notes }
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = undefined, notes = {} } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "amount (in paise) is required" });
    const client = getClient();
    const order = await client.orders.create({ amount, currency, receipt, notes, payment_capture: 1 });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, subEventId, studentId }
exports.verifyAndRegister = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, subEventId, studentId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Mark registration as paid (create if somehow missing)
    let registration = await Registration.findOne({ student: studentId, event: eventId, subEventId });
    if (!registration) {
      registration = await Registration.create({ student: studentId, event: eventId, subEventId, payment: { orderId: razorpay_order_id, paymentId: razorpay_payment_id }, paymentStatus: "paid" });
    } else {
      registration.paymentStatus = "paid";
      registration.payment = { orderId: razorpay_order_id, paymentId: razorpay_payment_id };
      await registration.save();
    }

    res.json({ message: "Payment verified and saved", registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
