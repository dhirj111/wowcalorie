const path = require('path');
const sequelize = require('../util/database');
require('dotenv').config();
const Wowuser = require('../models/wowuser');
const Dish = require('../models/dishes');
const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateAccessToken(id, name) {

  return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);

}



exports.adminpostlogin = async (req, res, next) => {
  console.log(req.body)
  try {
    const { key, password } = req.body;


    if(key==process.env.ADMINKEY && key==process.env.ADMINPASS){
          return res.status(201).json({
            usertoken: generateAccessToken(existingUser.key),
            code: "userverified",
            message: "user logged in succesfully",
            urltoredirect: 'http://localhost:1000/manageadmin'
          });
        }
      
    
    else {
      res.status(404).json({
        message: " user does not exist",
      });
    }
  }
  catch (err) {
    //this block is for eror in exceution of try blocks as a 
    // whole, catch does not care about individual error of logic
    console.log("inside catch  block of controller err is ==", err);
    res.status(500).json({
      error: " user does not exist",
      message: err.message
    });
  }
} 