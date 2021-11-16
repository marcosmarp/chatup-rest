const Chatroom = require('./Chatroom');
const mongoose = require('mongoose');

const createChatroom = async (user, name) => {
  const chatroom = await new Chatroom({
    name: name,
    creator: user._id,
  });
  await chatroom.users.push(user._id);
  return await chatroom.save();
}

const chatroomExists = async (id) => {
  return await Chatroom.exists({_id: id});
}

exports.createChatroom = createChatroom;
exports.chatroomExists = chatroomExists;