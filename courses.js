const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a section title'],
    trim: true
  },
  description: {
    type: String
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for lessons
sectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
  justOne: false
});

// Delete lessons when section is deleted
sectionSchema.pre('remove', async function(next) {
  await this.model('Lesson').deleteMany({ section: this._id });
  next();
});

module.exports = mongoose.model('Section', sectionSchema);
