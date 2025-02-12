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

exports.serveadminlogin = async (req, res) => {

  try {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'adminlogin.html'));


  }
  catch (err) {
    console.log("eroor in serving")
  }

}
exports.frontmanage = async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'managefront.html'));

}

exports.adminpostlogin = async (req, res, next) => {
  console.log("hitted post login")
  console.log(req.body)
  try {
    const { key, password } = req.body;


    if (key == process.env.ADMINKEY && key == process.env.ADMINPASS) {
      return res.status(201).json({
        usertoken: generateAccessToken(key),
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


exports.getalldishes = async (req, res) => {
  // name, creator,id
  try {
    let dishes = await Dish.findAll({
      attributes: ['name', 'userId', 'id', 'creatorName']  // Select only these columns
    });

    let alldishes = []
    for (let i = 0; i < dishes.length; i++) {


      alldishes.push(dishes[i].dataValues)
    }
    res.json(alldishes)
  }
  catch (err) {
    console.log(err)
  }


}

exports.allusers = async (req, res) => {
  try {
    let Users = await Wowuser.findAll({
      attributes: ['name', 'email', 'id']  // Select only these columns
    });

    let allUsers = []
    for (let i = 0; i < Users.length; i++) {


      allUsers.push(Users[i].dataValues)
    }
    res.json(allUsers)
  }
  catch (err) {
    console.log(err)
  }



}

