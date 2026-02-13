const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: String,
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  thumbnail: {
    type: String,
    default: 'no-photo.jpg'
  },
  previewVideo: {
    type: String
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'all_levels'
  },
  language: {
    type: String,
    default: 'English'
  },
  price: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  durationHours: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  certificateEnabled: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  targetAudience: [{
    type: String
  }],
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Set publishedAt when course is published
courseSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Virtual for sections
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Calculate average rating
courseSchema.statics.calculateAverageRating = async function(courseId) {
  const obj = await this.model('Review').aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.findByIdAndUpdate(courseId, {
      averageRating: obj[0]?.averageRating || 0,
      totalReviews: obj[0]?.totalReviews || 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Index for text search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
