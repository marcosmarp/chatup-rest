const router = require('express').Router();
const User = require('./models/User/User');
const UserFunctions = require('./models/User/functions')

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

router.post('/api/users/authenticate/', async (req, res) => {
  try {
    console.log(`POST ${req.path} from ${req.ip}`);

    const userExists = await UserFunctions.userExist(req.body.username);
    if (!userExists) return res.json({"error": "username not taken"});
    
    const user = await UserFunctions.getUserByUsername(req.body.username);
    const authenticated = await UserFunctions.checkPassword(user, req.body.password);
    res.json(authenticated);
  }
  catch (err) {
    console.log(err);
    res.json(err);
  }
})

module.exports = router;
