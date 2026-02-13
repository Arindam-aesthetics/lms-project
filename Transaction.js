const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['course_update', 'new_message', 'assignment_graded', 'enrollment', 'certificate', 'announcement', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  linkUrl: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for querying user notifications
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
