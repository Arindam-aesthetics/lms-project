const mongoose = require('mongoose');

const discussionThreadSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [255, 'Title cannot be more than 255 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  repliesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies
discussionThreadSchema.virtual('replies', {
  ref: 'DiscussionReply',
  localField: '_id',
  foreignField: 'thread',
  justOne: false
});

module.exports = mongoose.model('DiscussionThread', discussionThreadSchema);
