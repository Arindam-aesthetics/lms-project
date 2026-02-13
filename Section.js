const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'Section',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'pdf', 'quiz', 'assignment'],
    required: true
  },
  description: {
    type: String
  },
  // Video specific fields
  videoUrl: {
    type: String
  },
  videoDuration: {
    type: Number // in seconds
  },
  videoProvider: {
    type: String,
    enum: ['youtube', 'vimeo', 'custom', 'cloudinary'],
    default: 'custom'
  },
  // Text content
  textContent: {
    type: String
  },
  // PDF
  pdfUrl: {
    type: String
  },
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  isPreview: {
    type: Boolean,
    default: false
  },
  isDownloadable: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
