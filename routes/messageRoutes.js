const express = require('express');
const messageController = require('./../controllers/messageController');

const router = express.Router();

router
  .post('/', messageController.createMessage)
  .get('/:chatID', messageController.getMessages);

module.exports = router;
