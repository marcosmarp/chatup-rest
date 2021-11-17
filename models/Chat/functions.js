const Chat = require('./Chat');

const createChat = async (chatroom, user, message) => {
  const chat = new Chat({
    chatroom: chatroom,
    creator: user,
    content: message
  });
  return await chat.save();
}

const chatExists = async (id) => {
  return await Chat.exists({_id: id});
}

exports.createChat = createChat;
exports.chatExists = chatExists;