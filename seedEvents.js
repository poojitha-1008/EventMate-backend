// backend/seedEvents.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const sampleEvents = [
  {
    title: "Mahotsav 2025",
    description:
      "A cultural celebration filled with music, dance, and traditional arts. Join us for an unforgettable experience!",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: "Open Air Theatre, Main Campus",
    status: "approved",
    subEvents: [
      { title: "Classical Dance Night", time: "6:00 PM", speaker: "Ananya Sharma" },
      { title: "Folk Music Fest", time: "8:00 PM", speaker: "Raghav Menon & Group" },
      { title: "Art & Handicraft Exhibition", time: "10:00 AM" },
    ],
  },
  {
    title: "StackHack 3.0",
    description:
      "A 24-hour full-stack hackathon focused on innovative web and mobile app solutions. Collaborate, code, and conquer!",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: "Innovation Lab, Block B",
    status: "approved",
    subEvents: [
      { title: "Hackathon Kickoff", time: "9:00 AM", speaker: "Dr. Nisha Rao" },
      { title: "Tech Talk: AI & The Future", time: "2:00 PM", speaker: "Prof. Arjun Verma" },
      { title: "Demo & Awards", time: "6:00 PM (Next Day)" },
    ],
  },
  {
    title: "Codestrome 2025",
    description:
      "A competitive coding festival where the best minds battle it out in algorithmic problem-solving and software design.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: "Computer Science Block, Room 204",
    status: "approved",
    subEvents: [
      { title: "Algorithm Showdown", time: "10:00 AM" },
      { title: "Debugging Sprint", time: "1:00 PM" },
      { title: "Code Golf Challenge", time: "3:00 PM" },
    ],
  },
  {
    title: "Innovators Summit",
    description:
      "Meet industry experts and startup founders sharing insights on innovation, sustainability, and entrepreneurship.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: "Auditorium A",
    status: "approved",
    subEvents: [
      { title: "Panel Discussion", time: "11:00 AM", speaker: "Startup CEOs" },
      { title: "Idea Pitching", time: "2:00 PM" },
    ],
  },
];

await Event.deleteMany({});
await Event.insertMany(sampleEvents);

console.log("✅ Events inserted successfully!");
process.exit();
