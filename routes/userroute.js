const path = require('path');

const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/wowcontrol');
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

module.exports = router