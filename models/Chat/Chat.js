const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
  },
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true
  }
}, { timestamps:true });

module.exports = mongoose.model('Chat', ChatSchema);
