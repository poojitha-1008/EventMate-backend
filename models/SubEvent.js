const mongoose = require("mongoose");

const subEventSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["cultural", "sports", "technical"], required: false },
    registrationFee: { type: Number, required: false },
    registrationDeadline: { type: Date, required: false },
    maxTeamSize: { type: Number, required: false },
    time: { type: String, required: false },
    venue: { type: String, required: false },
    paymentQrUrl: { type: String, required: false },
    roles: [
      new mongoose.Schema(
        {
          name: { type: String, required: true },
        },
        { _id: true }
      ),
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubEvent", subEventSchema);
