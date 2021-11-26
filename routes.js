const router = require('express').Router();
const User = require('./models/User/User');
const UserFunctions = require('./models/User/functions')
const Chatroom = require('./models/Chatroom/Chatroom');
const ChatroomFunctions = require('./models/Chatroom/functions');
const Chat = require('./models/Chat/Chat');
const ChatFunctions = require('./models/Chat/functions')

// Users routes
router.post('/api/users/auth/register/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    if (!req.body.username.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty username"});
    if (!req.body.password.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty password"});
    const userExists = await UserFunctions.userExist(req.body.username);
    if (userExists) return res.json({"success": false, "error": "username taken"});

    // @ts-ignore
    const user = await UserFunctions.createUser(req.body.username, req.body.password);
    res.json({"success": true});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.post('/api/users/auth/log-in/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    if (!req.body.username.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty username"});
    if (!req.body.password.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty password"});

    const userExists = await UserFunctions.userExist(req.body.username);
    if (!userExists) return res.json({"success": false, "error": "unexistent username"});
    
    const user = await UserFunctions.getUserByUsername(req.body.username);
    const authenticated = await UserFunctions.checkPassword(user, req.body.password);
    // @ts-ignore
    req.session.authenticated = authenticated;
    req.session.save();
    // @ts-ignore
    if (authenticated) req.session.user = req.body.username;
    res.json({"success": true, "authenticated": authenticated});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.post('/api/users/auth/log-out/', async (req, res) => {
  console.log(`POST ${req.path} from ${req.ip}`);
  // @ts-ignore
  req.session.authenticated = false;
  // @ts-ignore
  req.session.user = undefined;
  req.session.save();
  res.json({"success": true});
});

// Chatrooms routes
router.get('/api/chatrooms/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);
    const chatrooms = await Chatroom.find()
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content'});
    res.json({"success": true, "chatrooms": chatrooms});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.get('/api/chatrooms/own/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);

    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatrooms = await Chatroom.find({users: user._id})
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content'});

    res.json({"success": true, "chatrooms": chatrooms});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.get('/api/chatrooms/own/:selectCode/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);

    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatrooms = await Chatroom.find({users: user._id})
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content createdAt'});

    const selectCode = parseInt(req.params.selectCode);
    if (selectCode < 0 || selectCode > chatrooms.length-1 || isNaN(selectCode)) {
      return res.json({"success": false, "error": "invalid select code"});
    }
    
    const chatroom = chatrooms[selectCode];
    for (let i=0 ; i < chatroom.chats.length ; ++i) await chatroom.chats[i].populate({path: 'creator', select: 'username'});

    res.json({"success": true, "chatroom": chatroom});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.delete('/api/chatrooms/own/:selectCode/', async (req, res) => {
  try {
    console.log(`DELETE ${req.path} from ${req.ip}`);

    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatrooms = await Chatroom.find({users: user._id});

    const selectCode = parseInt(req.params.selectCode);
    if (selectCode < 0 || selectCode > chatrooms.length-1 || isNaN(selectCode)) {
      return res.json({"success": false, "error": "invalid select code"});
    }
    
    const chatroom = chatrooms[selectCode];

    if (!chatroom.creator.equals(user._id)) return res.status(403).json({"success": false, "error": "forbidden"});

    const deletedChatroom = await Chatroom.findByIdAndDelete(chatroom._id);
    res.json({"success": true, "chatroom": deletedChatroom});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.put('/api/chatrooms/own/:selectCode/', async (req, res) => {
  try {
    console.log(`PUT ${req.path} from ${req.ip}`);

    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatrooms = await Chatroom.find({users: user._id});

    const selectCode = parseInt(req.params.selectCode);
    if (selectCode < 0 || selectCode > chatrooms.length-1 || isNaN(selectCode)) {
      return res.json({"success": false, "error": "invalid select code"});
    }
    
    const chatroom = chatrooms[selectCode];

    await chatroom.users.pull(user._id);
    await user.chatrooms.pull(chatroom._id);

    await chatroom.save();
    await user.save();

    if (chatroom.creator.equals(user._id)) await Chatroom.findByIdAndDelete(chatroom._id);

    res.json({"success": true});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.get('/api/chatrooms/:keyword/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);
    const chatrooms = await Chatroom.find({keywords: req.params.keyword})
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content'});
    res.json({"success": true, "chatrooms": chatrooms});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.get('/api/chatrooms/:keyword/:selectCode/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);

    const chatrooms = await Chatroom.find({keywords: req.params.keyword})
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content createdAt'});

    const selectCode = parseInt(req.params.selectCode);
    if (selectCode < 0 || selectCode > chatrooms.length-1 || isNaN(selectCode)) {
      return res.json({"success": false, "error": "invalid select code"});
    }

    const chatroom = chatrooms[selectCode];
    for (let i=0 ; i < chatroom.chats.length ; ++i) await chatroom.chats[i].populate({path: 'creator', select: 'username'});

    res.json({"success": true, "chatroom": chatroom});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.post('/api/chatrooms/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});
    if (!req.body.name.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty name"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatroom = await ChatroomFunctions.createChatroom(user, req.body.name);
    if (req.body.keywords.replace(/\s/g, '').length) {
      const keywords = req.body.keywords.substring(0, 100).match(/([^\s]+)/g);
      chatroom.keywords = keywords;
      chatroom.save();
    }

    res.json({"success": true, "chatroom": chatroom});
  }
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.get('/api/chatrooms/:id/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.json({"success": false, "error": "invalid id"});

    const chatroomExists = await ChatroomFunctions.chatroomExists(req.params.id);
    if (!chatroomExists) return res.status(400).json({"success": false, "error": "invalid chatroom"});

    const chatroom = await Chatroom.findById(req.params.id)
    .populate({path: 'creator', select: 'username'})
    .populate({path: 'users', select: 'username'})
    .populate({path: 'chats', select: 'creator content createdAt'});

    for (let i=0 ; i < chatroom.chats.length ; ++i) await chatroom.chats[i].populate({path: 'creator', select: 'username'});
    
    res.json({"success": true, "chatroom": chatroom});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

router.delete('/api/chatrooms/:id/', async (req, res) => {
  try {
    console.log(`DELETE ${req.path} from ${req.ip}`);

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.json({"success": false, "error": "invalid id"});
    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    const chatroomExists = await ChatroomFunctions.chatroomExists(req.params.id);
    if (!chatroomExists) return res.status(400).json({"success": false, "error": "invalid chatroom"});

    const chatroom = await Chatroom.findById(req.params.id);
    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);

    if (!chatroom.creator.equals(user._id)) return res.status(403).json({"success": false, "error": "forbidden"});

    const deletedChatroom = await Chatroom.findByIdAndDelete(req.params.id)
    res.json({"success": true, "chatroom": deletedChatroom});
  } 
  catch (err) {
    console.log(err);
    res.json({"success": false, "error": err});
  }
});

// Chats routes
router.post('/api/chatrooms/:id/chats/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.json({"success": false, "error": "invalid id"});
    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"success": false, "error": "not authenticated"});

    const chatroomExists = await ChatroomFunctions.chatroomExists(req.params.id);
    if (!chatroomExists) return res.status(400).json({"success": false, "error": "invalid chatroom"});

    if (!req.body.content.replace(/\s/g, '').length) return res.status(400).json({"success": false, "error": "empty message"});

    const chatroom = await Chatroom.findById(req.params.id);
    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chat = await ChatFunctions.createChat(chatroom, user, req.body.content);

    await chatroom.chats.push(chat._id);
    const userInChatroom = await ChatroomFunctions.userExistsInChatroom(chatroom, user);
    if (!userInChatroom) {
      await chatroom.users.push(user._id);
      await user.chatrooms.push(chatroom._id);
    }
    user.save();
    chatroom.save();

    res.json({"success": true, "chat": chat});
  }
  catch (err) {
    res.json({"success": false, "error": err});
  }
});

module.exports = router;
