const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// POST tour/tourID/reviews
// GET tour/tourID/reviews
// GET tour/tourID/reviews/reviewID

router.use('/:tourID/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.tourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.monthlyPlan,
  );
router
  .route('/')
  .get(bookingController.createBookingCheckout, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
