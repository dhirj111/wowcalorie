const jwt = require('jsonwebtoken');
const Wowuser = require('../models/wowuser');
require('dotenv').config();
let SECRET_KEY = process.env.TOKEN_SECRET
const authenticate = async (req, res, next) => {
  console.log(req.body, "inside auth's body")
  try {
    console.log("in auth try block")
    const token = req.header('token');
    console.log(token);
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(user.userId, "this is inside auth and  full user", user)
    Wowuser.findByPk(user.userId).then(user => {
      console.log(JSON.stringify(user));
      req.user = user;
      next()
    }
    ).catch(err => { throw new Error(err) })
  }
  catch (err) {
    console.log(err);
    return res.status(401).json({ success: false })
  }
}

module.exports = authenticate;