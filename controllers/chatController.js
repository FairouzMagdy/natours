const Chat = require('./../models/chatModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createChat = catchAsync(async (req, res, next) => {
  // 1) extract user ids from body
  const { firstID, secondID } = req.body;

  const chat = await Chat.findOne({
    members: { $all: [firstID, secondID] },
  });

  if (chat) {
    return res.status(200).json({
      status: 'success, chat already exists',
      chat,
    });
  }
  const newChat = await Chat.create({
    members: [firstID, secondID],
  });

  if (!newChat) {
    return next(new AppError('Failed to create chat', 500));
  }

  const response = await newChat.save({ validateBeforeSave: false });
  res.status(201).json({
    status: 'success',
    response,
  });
});

exports.getUserChats = catchAsync(async (req, res, next) => {
  const userID = req.params.userID;

  const chats = await Chat.find({
    members: { $in: [userID] },
  });

  if (!chats) {
    return next(new AppError('No chats found for the user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chats,
    },
  });
});

exports.getChat = catchAsync(async (req, res, next) => {
  const { firstID, secondID } = req.params;
  const chat = await Chat.findOne({
    members: { $all: [firstID, secondID] },
  });

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chat,
    },
  });
});
