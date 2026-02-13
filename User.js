const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true
  },
  description: {
    type: String
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  timeLimit: {
    type: Number // in minutes, null for unlimited
  },
  maxAttempts: {
    type: Number // null for unlimited
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showAnswersAfterSubmission: {
    type: Boolean,
    default: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
      required: true
    },
    points: {
      type: Number,
      default: 1
    },
    options: [{
      optionText: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // for short answer/essay
    explanation: String,
    displayOrder: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
