const router = require('express').Router();
const User = require('./models/User/User');
const UserFunctions = require('./models/User/functions')
const Chatroom = require('./models/Chatroom/Chatroom');
const ChatroomFunctions = require('./models/Chatroom/functions');
const Chat = require('./models/Chat/Chat');

// Users routes
router.get('/api/users/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);
    const users = await User.find();
    res.json(users)
  } 
  catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.post('/api/users/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    const userExists = await UserFunctions.userExist(req.body.username);
    if (userExists) return res.json({"error": "username taken"});

    const user = await UserFunctions.createUser(req.body.username, req.body.password);
    res.json(user);
  } 
  catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.post('/api/users/auth/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    const userExists = await UserFunctions.userExist(req.body.username);
    if (!userExists) return res.json({"error": "username not taken"});
    
    const user = await UserFunctions.getUserByUsername(req.body.username);
    const authenticated = await UserFunctions.checkPassword(user, req.body.password);
    // @ts-ignore
    req.session.authenticated = authenticated;
    // @ts-ignore
    if (authenticated) req.session.user = req.body.username;
    res.json(authenticated);
  }
  catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.post('/api/users/log-out/', async (req, res) => {
  // @ts-ignore
  req.session.authenticated = undefined;
  // @ts-ignore
  req.session.user = undefined;
  res.json({"authenticated": "false"})
})

// Chatrooms routes
router.get('/api/chatrooms/', async (req, res) => {
  try {
    console.log(`GET ${req.path} from ${req.ip}`);
    const chatrooms = await Chatroom.find();
    res.json(chatrooms);
  } 
  catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.post('/api/chatrooms/', async (req, res) => {
  try {
    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"error": "log in"});
    if (!req.body.name.replace(/\s/g, '').length) return res.status(400).json({"error": "invalid name"});

    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);
    const chatroom = await ChatroomFunctions.createChatroom(user, req.body.name);
    res.json(chatroom);
  }
  catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.delete('/api/chatrooms/:id/', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.json({"error": "invalid id"});
    // @ts-ignore
    if (!req.session.authenticated) return res.status(403).json({"error": "log in"});

    const chatroomExists = await ChatroomFunctions.chatroomExists(req.params.id);
    if (!chatroomExists) return res.status(400).json({"error": "invalid chatroom"});

    const chatroom = await Chatroom.findById(req.params.id);
    // @ts-ignore
    const user = await UserFunctions.getUserByUsername(req.session.user);

    if (!chatroom.creator.equals(user._id)) return res.status(403).json({"error": "invalid user"});

    const deletedChatroom = await Chatroom.findByIdAndDelete(req.params.id)
    res.json(deletedChatroom);
  } 
  catch (err) {
    console.log(err);
    res.json({"error": err});
  }
})

module.exports = router;
