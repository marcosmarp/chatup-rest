const Chatroom = require('./Chatroom');
const mongoose = require('mongoose');

const createChatroom = async (user, name) => {
  const chatroom = await new Chatroom({
    name: name,
    creator: user._id,
  });
  await chatroom.users.push(user._id);
  await user.chatrooms.push(chatroom._id);
  await user.save();
  return await chatroom.save();
}

const chatroomExists = async (id) => {
  return await Chatroom.exists({_id: id});
}

const userExists = async (chatroom, searched_user) => {
  return await chatroom.users.some(async (user) => {
    return await user.equals(searched_user.id);
  });
}

exports.createChatroom = createChatroom;
exports.chatroomExists = chatroomExists;
exports.userExists = userExists;