const express = require('express');
const { protectUser } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications for faculty
router.get('/faculty/notifications', protectUser, async (req, res) => {
  try {
    const notifications = await Notification.find({ facultyId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Placeholder: Get student notifications (returns empty until student notifications are stored)
router.get('/student/:studentId', protectUser, async (req, res) => {
  try {
    // TODO: implement student-specific notifications storage and query
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', protectUser, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.user.id },
      { status: 'read' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', protectUser, async (req, res) => {
  try {
    await Notification.updateMany(
      { facultyId: req.user.id, status: 'unread' },
      { status: 'read' }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Delete notification
router.delete('/notifications/:id', protectUser, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// Get unread notifications count
router.get('/notifications/unread-count', protectUser, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      facultyId: req.user.id,
      status: 'unread'
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting notifications', error: error.message });
  }
});

module.exports = router;