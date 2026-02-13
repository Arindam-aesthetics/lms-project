const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per student per course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Update course average rating after review
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.course);
});

reviewSchema.post('remove', async function() {
  await this.constructor.calculateAverageRating(this.course);
});

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(courseId) {
  const obj = await this.aggregate([
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
    await this.model('Course').findByIdAndUpdate(courseId, {
      averageRating: obj[0]?.averageRating?.toFixed(2) || 0,
      totalReviews: obj[0]?.totalReviews || 0
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = mongoose.model('Review', reviewSchema);
