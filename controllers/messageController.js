const Message = require('./../models/messageModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createMessage = catchAsync(async (req, res, next) => {
  const { chatID, senderID, text } = req.body;

  const newMessage = new Message({
    chatID,
    senderID,
    text,
  });
  await newMessage.save({ validateBeforeSave: false });

  if (!newMessage) {
    return next(new AppError('Failed to create message', 500));
  }

  res.status(201).json({
    status: 'success',
    newMessage,
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const { chatID } = req.params;
  console.log(chatID);
  // Find all messages for the specified chatID
  const messages = await Message.find({ chatID });

  if (!messages) {
    return next(
      new AppError('No messages found for the provided chat ID', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
