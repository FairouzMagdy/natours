const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkoutSession/:tourID', bookingController.getCheckoutSession);

router.get('/myBookings', bookingController.myBookings);
router.get(
  '/tempBookingMethod',
  bookingController.createBookingCheckout,
  tourController.getAllTours,
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
