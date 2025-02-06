const path = require('path');

const express = require('express');

const userController = require('../controllers/wowcontrol');

// const auth = require('../middleware/auth');
const router = express.Router();

//to serve main html file

router.get('/sign', userController.baserootsignup);

router.get('/login', userController.baserootlogin);

router.post('/postsignup', userController.postsignup)

router.post('/postlogin' , userController.postlogin)
// router.get('/forget', expenseController.baseforget);
// // Route for adding a user
// router.post('adduser', expenseController.adduser);

module.exports = router