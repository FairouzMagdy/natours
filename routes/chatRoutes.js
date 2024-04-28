const express = require('express');
const chatController = require('./../controllers/chatController');

const router = express.Router();

router
  .post('/', chatController.createChat)
  .get('/:userID', chatController.getUserChats)
  .get('/chat/:firstID/:secondID', chatController.getChat);

module.exports = router;
