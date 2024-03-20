const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...includedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (includedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user entered password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please visit /updateMyPassword',
        400,
      ),
    );
  }

  // Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
  next();
});

exports.getUser = (req, res) => {
  res.status(500).json({
    message: 'Route is not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    message: 'Route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    message: 'Route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    message: 'Route is not yet defined',
  });
};
