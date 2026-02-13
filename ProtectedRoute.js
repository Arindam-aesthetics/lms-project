const express = require('express');
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  updateLessonProgress,
  getEnrollmentByCourse,
  checkEnrollment
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin'));

router.post('/:courseId', enrollCourse);
router.get('/my-courses', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);
router.get('/course/:courseId', getEnrollmentByCourse);
router.get('/:id', getEnrollment);
router.put('/:id/progress/:lessonId', updateLessonProgress);

module.exports = router;
