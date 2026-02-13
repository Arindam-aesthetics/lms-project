const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    trim: true
  },
  description: {
    type: String
  },
  instructions: {
    type: String,
    required: [true, 'Please add instructions']
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  dueDate: {
    type: Date
  },
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  fileUploadRequired: {
    type: Boolean,
    default: true
  },
  maxFileSize: {
    type: Number, // in bytes
    default: 10485760 // 10MB
  },
  allowedFileTypes: [{
    type: String // e.g., ['pdf', 'docx', 'txt']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
