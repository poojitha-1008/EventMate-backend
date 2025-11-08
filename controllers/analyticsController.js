import Event from "../models/Event.js";
import User from "../models/User.js";
import VenueRequest from "../models/VenueRequest.js";
import { default as EventRegistration } from "../models/EventRegistration.js";

export const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch all data in parallel
    const [events, eventRegistrations, facultyList, venueRequests] = await Promise.all([
      Event.find().populate('createdBy', 'name email'),
      EventRegistration.find().populate('studentId', 'name department'),
      User.find({ role: 'faculty' }),
      VenueRequest.find()
    ]);

    // Event statistics
    const totalEvents = events.length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const approvedEvents = events.filter(e => e.status === 'approved').length;
    const rejectedEvents = events.filter(e => e.status === 'rejected').length;

    // Events by type
    const eventsByType = events.reduce((acc, event) => {
      const type = event.type || 'General';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Participation analytics
    const totalRegistrations = eventRegistrations.length;
    const uniqueParticipants = new Set(eventRegistrations.map(r => r.studentId?._id?.toString())).size;
    const participationRate = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;
    
    // Department distribution
    const departmentDistribution = eventRegistrations.reduce((acc, reg) => {
      const dept = reg.studentId?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    // Faculty performance
    const facultyPerformance = events.reduce((acc, event) => {
      if (event.createdBy && event.createdBy.name) {
        const facultyName = event.createdBy.name;
        if (!acc[facultyName]) {
          acc[facultyName] = { total: 0, approved: 0, pending: 0, rejected: 0 };
        }
        acc[facultyName].total++;
        acc[facultyName][event.status]++;
      }
      return acc;
    }, {});

    // Venue requests stats
    const pendingVenueRequests = venueRequests.filter(r => r.status === 'pending').length;

    res.json({
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      eventsByType,
      totalRegistrations,
      uniqueParticipants,
      participationRate,
      departmentDistribution,
      facultyPerformance,
      pendingVenueRequests,
      facultyList: facultyList.map(f => ({
        _id: f._id,
        name: f.name,
        email: f.email,
        department: f.department
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};