const bcrypt = require('bcrypt');
const User = require('./User');

const hashPassword = async (password) => {
  try {
      return await bcrypt.hash(password, 12);
  } catch (err) {
      console.log(err);
  }
  return null;
};

const checkPassword = async (user, password) => {
  const hash = await hashPassword(password);
  console.log(hash, user.hash);
  return await bcrypt.compare(hash, user.hash);
}

const userExist = async (username) => {
  return await User.exists({username: username});
}

const createUser = async (username, password) => {
  const hash = await hashPassword(password);
  const user = await new User({
    username: username,
    hash: hash
  });
  return await user.save();
}

const getUserByUsername = async (username) => {
  return await User.findOne({username: username});
}

exports.checkPassword = checkPassword;
exports.userExist = userExist;
exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
