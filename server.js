const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

// Allow frontend origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length && !allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/subevents", require("./routes/subEventRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/venues", require("./routes/venueRoutes"));

// Static file serving for uploaded assets// Add this to your server.js or app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/',(req,res)=>{
  res.send("working");
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
