const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // Prevents browsers from manipulating the cookie (prevents xss attacks)
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const verifyEmailToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  try {
    const verificationURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/verifyEmail/${verifyEmailToken}`;
    const message = `Welcome to our application! Please verify your email address by clicking the following link: ${verificationURL}`;
    await sendEmail({
      email: newUser.email,
      subject: 'Verify your email address',
      message,
    });

    await newUser.save({ validateBeforeSave: false });
    newUser.emailVerificationToken = undefined;
    newUser.verificationTokenExpires = undefined;
    createSendToken(newUser, 201, res);
  } catch (err) {
    // If there's an error sending the email, handle it
    newUser.emailVerificationToken = undefined;
    newUser.verificationTokenExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the verification email. Try again later!',
        500,
      ),
    );
  }
});

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || user.emailVerified) {
    return next(
      new AppError('User not found or email is already verified.', 400),
    );
  }

  const verifyEmailToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verificationURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/verifyEmail/${verifyEmailToken}`;
    const message = `Welcome back! Please verify your email address by clicking the following link: ${verificationURL}`;
    await sendEmail({
      email: user.email,
      subject: 'Resend Verification Email',
      message,
    });
    user.emailVerificationToken = undefined;
    user.verificationTokenExpires = undefined;
    res.status(200).json({
      status: 'success',
      message: 'Verification email resent successfully.',
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the verification email. Try again later!',
        500,
      ),
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // Get the verification token from the URL
  const token = req.params.token;

  // Find the user by the verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });
  // If user not found or token has expired
  if (!user) {
    return next(
      new AppError('Verification token is invalid or has expired.', 400),
    );
  }
  // If the user is already verified, return a message indicating that
  if (user.emailVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'Your email address has already been verified. You can log in.',
    });
  }
  // Mark user as email verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });
  // Send response indicating successful email verification
  res.status(200).json({
    status: 'success',
    message: 'Email verification successful. You can now log in.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists in body
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400)); // 400 for bad request
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401)); // 401 for unauthorized
  }
  // 3) send response with token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and see if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  // 4) Check if email is verified
  if (!currentUser.emailVerified) {
    return next(
      new AppError(
        'Please verify your email address to access this resource.',
        401,
      ),
    );
  }

  // 5) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.'),
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action.", 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check if email exists in body
  if (!req.body.email) {
    return next(new AppError('Please provide an email to continue.', 400));
  }

  // Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user was found with this email.', 404));
  }
  // Generate reset password token
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // Send email
  const tokenURL = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password to ${tokenURL}.\n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Token. (Only valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending an email. Try again later!',
        500,
      ),
    );
  }
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha512')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there's user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // In tours we used findOneAndUpdate, but here we use findOne and then we use save() as we want to run all middlewares as well as pre save hooks

  // 3) Update the changePasswordAt property

  // 4) Log the user in, send jwt
  createSendToken(user, 200, res);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Incorrect password. Try again.', 401));
  }
  // 3) If so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
  // next();
});
