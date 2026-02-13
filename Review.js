const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  // Progress tracking
  completedLessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  // Video progress
  lessonProgress: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    videoProgressSeconds: {
      type: Number,
      default: 0
    },
    lastPositionSeconds: {
      type: Number,
      default: 0
    },
    playbackSpeed: {
      type: Number,
      default: 1.0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update course enrollment count after enrollment
enrollmentSchema.post('save', async function() {
  await this.model('Course').findByIdAndUpdate(this.course, {
    $inc: { enrollmentCount: 1 }
  });
});

// Calculate progress percentage
enrollmentSchema.methods.calculateProgress = async function() {
  const course = await this.model('Course').findById(this.course).populate({
    path: 'sections',
    populate: {
      path: 'lessons'
    }
  });

  let totalLessons = 0;
  course.sections.forEach(section => {
    totalLessons += section.lessons.length;
  });

  if (totalLessons === 0) {
    this.progressPercentage = 0;
    return;
  }

  const completedCount = this.completedLessons.length;
  this.progressPercentage = Math.round((completedCount / totalLessons) * 100);

  if (this.progressPercentage === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completionDate = Date.now();
  }

  await this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
