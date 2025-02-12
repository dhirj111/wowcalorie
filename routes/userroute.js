const path = require('path');
const { Op } = require('sequelize');
const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/wowcontrol');
const adminController = require('../controllers/admincontroller')
const router = express.Router();
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const fs = require('fs');

router.get('/sign', userController.baserootsignup);

router.get('/login', userController.baserootlogin);

router.post('/postsignup', userController.postsignup)

router.post('/postlogin', userController.postlogin)

router.get('/newdish', userController.newdishpage)

router.post('/dishpost', auth, upload.single('image'), userController.dishpostdb);

router.get('/', userController.baseport)

router.get('/getrecipes', userController.getAllRecipes);

router.get('/searchrecipes', userController.searchRecipes);

router.get('/profile/:id', userController.getProfile)

router.get('/userrecipies/:id', userController.userrecipies)

router.post("/followuser", auth, userController.followUser);

router.get("/following", userController.servefollowingpage);

router.get("/myprofile", userController.servemyprofile);

router.get("/owndishes", auth, userController.owndishes)

router.get("/favourite", userController.servefavouritepage);

router.get('/followingreciepies', auth, userController.followingreciepies)

router.post("/favourited", auth, userController.favourited)

router.get('/admin', adminController.serveadminlogin)

router.get('/getstarreddish', auth, userController.getstarreddish)

router.post('/adminpostlogin', adminController.adminpostlogin)

router.get('/manageadmin', adminController.frontmanage)

router.get('/alldishes', adminController.getalldishes)

router.get('/allusers', adminController.allusers)

router.delete("/owndishes/:dishid", auth, userController.owndishdelete);

router.post("/commentRecipe",auth ,userController.commentpost)

router.get("/getcomments", userController.getComments);

module.exports = router