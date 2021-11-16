const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  chatrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chatroom',
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
