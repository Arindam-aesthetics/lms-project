const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true,
    unique: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    default: () => `CERT-${uuidv4().substring(0, 8).toUpperCase()}`
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  certificateUrl: {
    type: String
  },
  verificationCode: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual populate student and course info
certificateSchema.virtual('student', {
  ref: 'User',
  localField: 'enrollment',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
