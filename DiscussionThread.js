const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  assignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: true
  },
  submissionText: {
    type: String
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  },
  grade: {
    type: Number,
    min: 0
  },
  maxGrade: {
    type: Number
  },
  feedback: {
    type: String
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Ensure unique submission per enrollment per assignment
assignmentSubmissionSchema.index({ enrollment: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
