const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const factory = require('./../controllers/handlerFactory');

const router = express.Router();

router.post('/signup', authController.signup);
router.get('/verifyEmail/:token', authController.verifyEmail);
router.post('/resendVerificationEmail', authController.resendVerificationEmail);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/verifyResetCode', authController.verifyResetCode);
router.patch('/resetPassword/:token', authController.resetPassword);

// protected routes
router.use(authController.protect);
router.get('/resendVerificationEmail', authController.resendVerificationEmail);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
