const express = require('express');
const {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  togglePublish,
  getFeaturedCourses,
  searchCourses
} = require('../controllers/courseController');
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(
    advancedResults(Course, [
      { path: 'instructor', select: 'firstName lastName profilePicture' },
      { path: 'category', select: 'name slug' }
    ]),
    getCourses
  )
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.get('/featured', getFeaturedCourses);
router.get('/search', searchCourses);
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/slug/:slug', getCourseBySlug);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.put('/:id/publish', protect, authorize('instructor', 'admin'), togglePublish);

module.exports = router;
