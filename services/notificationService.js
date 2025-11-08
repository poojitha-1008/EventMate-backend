const Notification = require('../models/Notification');

class NotificationService {
  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Create event approval notification
  static async createEventApprovalNotification(facultyId, eventId, eventName, isApproved) {
    const status = isApproved ? 'approved' : 'rejected';
    return await this.createNotification({
      facultyId,
      eventId,
      title: `Event ${status}`,
      message: `Your event "${eventName}" has been ${status} by admin.`,
      type: 'event_approval',
      priority: 'high',
      actionUrl: `/dashboard/faculty`
    });
  }

  // Create venue booking notification
  static async createVenueBookingNotification(facultyId, eventId, eventName, venue, status) {
    return await this.createNotification({
      facultyId,
      eventId,
      title: 'Venue Booking Update',
      message: `Venue booking for "${eventName}" at ${venue} has been ${status}.`,
      type: 'venue_booking',
      priority: status === 'confirmed' ? 'medium' : 'high'
    });
  }

  // Create reminder notification
  static async createReminderNotification(facultyId, eventId, eventName, daysUntil) {
    return await this.createNotification({
      facultyId,
      eventId,
      title: 'Event Reminder',
      message: `Your event "${eventName}" is in ${daysUntil} day(s).`,
      type: 'reminder',
      priority: daysUntil <= 1 ? 'high' : 'medium',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
    });
  }

  // Create system notification
  static async createSystemNotification(facultyId, title, message) {
    return await this.createNotification({
      facultyId,
      title,
      message,
      type: 'system',
      priority: 'medium'
    });
  }
}

module.exports = NotificationService;