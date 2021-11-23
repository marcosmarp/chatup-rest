const mongoose = require('mongoose');

const ChatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    }
  ],
  keywords: [
    {
      type: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chatroom', ChatroomSchema);
