const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This course is not published yet'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'enrollment',
      title: 'Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      linkUrl: `/courses/${course.slug}`
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student enrollments
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: 'title slug thumbnail instructor category averageRating',
        populate: [
          { path: 'instructor', select: 'firstName lastName' },
          { path: 'category', select: 'name' }
        ]
      })
      .sort('-lastAccessed');

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get enrollment details
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'course',
        populate: {
          path: 'sections',
          populate: {
            path: 'lessons'
          }
        }
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Make sure user owns this enrollment
    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lesson progress
// @route   PUT /api/enrollments/:id/progress/:lessonId
// @access  Private (Student)
exports.updateLessonProgress = async (req, res, next) => {
  try {
    const { videoProgressSeconds, lastPositionSeconds, playbackSpeed, isCompleted } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Make sure user owns this enrollment
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Find or create lesson progress
    let lessonProgress = enrollment.lessonProgress.find(
      lp => lp.lesson.toString() === req.params.lessonId
    );

    if (lessonProgress) {
      lessonProgress.videoProgressSeconds = videoProgressSeconds || lessonProgress.videoProgressSeconds;
      lessonProgress.lastPositionSeconds = lastPositionSeconds || lessonProgress.lastPositionSeconds;
      lessonProgress.playbackSpeed = playbackSpeed || lessonProgress.playbackSpeed;
      lessonProgress.lastAccessed = Date.now();
      
      if (isCompleted && !lessonProgress.isCompleted) {
        lessonProgress.isCompleted = true;
        lessonProgress.completedAt = Date.now();
        
        // Add to completed lessons if not already there
        if (!enrollment.completedLessons.includes(req.params.lessonId)) {
          enrollment.completedLessons.push(req.params.lessonId);
        }
      }
    } else {
      enrollment.lessonProgress.push({
        lesson: req.params.lessonId,
        videoProgressSeconds: videoProgressSeconds || 0,
        lastPositionSeconds: lastPositionSeconds || 0,
        playbackSpeed: playbackSpeed || 1.0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? Date.now() : null
      });

      if (isCompleted) {
        enrollment.completedLessons.push(req.params.lessonId);
      }
    }

    enrollment.lastAccessed = Date.now();
    await enrollment.save();

    // Calculate progress
    await enrollment.calculateProgress();

    // Check if course is completed and generate certificate
    if (enrollment.isCompleted && !enrollment.certificateIssued) {
      const certificate = await Certificate.create({
        enrollment: enrollment._id
      });

      enrollment.certificateIssued = true;
      await enrollment.save();

      // Create notification
      await Notification.create({
        user: req.user.id,
        type: 'certificate',
        title: 'Certificate Issued',
        message: 'Congratulations! You have completed the course and earned a certificate.',
        linkUrl: `/certificates/${certificate._id}`
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get enrollment by course
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Student)
exports.getEnrollmentByCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    }).populate({
      path: 'course',
      populate: {
        path: 'sections',
        populate: {
          path: 'lessons'
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:courseId
// @access  Private
exports.checkEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    res.status(200).json({
      success: true,
      isEnrolled: !!enrollment
    });
  } catch (err) {
    next(err);
  }
};
