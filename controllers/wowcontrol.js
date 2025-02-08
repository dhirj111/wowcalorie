const path = require('path');
const sequelize = require('../util/database');
const validator = require('validator');
require('dotenv').config();
const bcrypt = require('bcrypt')
const Wowuser = require('../models/wowuser');
const Dish = require('../models/dishes');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
// Configure storage
const { Op } = require('sequelize');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });
function generateAccessToken(id, name) {

  return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);

}
function validateInput(email, password) {
  console.log("inside validtor")
  if (!validator.isEmail(email)) {
    return "Invalid email format";
  }

  if (!validator.isLength(password, { min: 6, max: 12 })) {
    return "Password must be 6 digits";
  }
  return true; // Valid input
}

exports.baseport = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));

}
exports.baserootsignup = (req, res, next) => {
  console.log("Serving singup.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
}

exports.baserootlogin = (req, res, next) => {
  console.log("Serving login.html");
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
}

//pushes new user details to db
exports.postsignup = async (req, res, next) => {
  const t = await sequelize.transaction();
  const saltRounds = 10;
  //salt is an string/whatver added to  password which increases randomness of password
  //even for same password each time to increase safety
  try {
    const { name, email, password } = req.body;
    let validated = validateInput(email, password)
    console.log(validated, "is validated status till now")
    if (validated == "Invalid email format" || validated == "Password must be 6 digits") {
      console.log("not validated ")
      return res.status(409).json({
        error: validated,
        message: validated
      });

    }
    // Check if user with email already exists
    const existingUser = await Wowuser.findOne({
      where: { email: email }
    }, { transaction: t });

    if (existingUser) {
      console.log('Account already exists for email:', email);
      await t.rollback();
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email already exists"
      });
    }

    // If email doesn't exist, create new user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await Wowuser.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "User created successfully"
    });
  } catch (err) {
    await t.rollback();
    console.error('Error in signup:', err);
    res.status(500).json({
      error: "Failed to process signup",
      details: err.message
    });
  }
};

//post login that matches input values with data
exports.postlogin = async (req, res, next) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;
    const existingUser = await Wowuser.findOne({
      where: { email: email }
    });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password).then(function (result) {

        if (result) {
          return res.status(201).json({
            usertoken: generateAccessToken(existingUser.id, existingUser.name),
            code: "userverified",
            message: "user logged in succesfully",
            urltoredirect: 'http://localhost:1000/'
          });
        }
        else {
          return res.status(401).json({
            message: "password is incorrect"
          })
        };
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
exports.newdishpage = (req, res) => {
  console.log("inside new dishpage")
  res.sendFile(path.join(__dirname, '..', 'public', 'newdish.html'));
}

exports.dishpostdb = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  try {
    let imageUrl = null;
    const {
      name,
      diet,
      glutenFree,
      difficulty,
      preparationTime,
      ingredients,
      steps
    } = req.body;

    // Upload image to Cloudinary if file exists
    if (req.file) {
      // Convert file to base64
      const b64 = Buffer.from(fs.readFileSync(req.file.path)).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'chat_images'
      });

      imageUrl = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Create new dish in database
    const newDish = await Dish.create({
      name,
      diet,
      glutenfree: glutenFree === 'true',
      difficulty,
      time: parseInt(preparationTime),
      ingredients,
      steps,
      imageUrl,
      userId: req.user.id, // Add this line
      creatorName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: "Dish created successfully",
      dish: newDish
    });

  } catch (error) {
    console.error("Error in dishpostdb:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create dish",
      error: error.message
    });

    // If file exists but database operation failed, clean up the uploaded file


  }
};
exports.getAllRecipes = async (req, res) => {
  try {
    const filters = {
      diet: req.query.diet,
      difficulty: req.query.difficulty,
      glutenfree: req.query.glutenfree === 'true',
      maxTime: req.query.maxTime
    };

    let whereClause = {};

    if (filters.diet) whereClause.diet = filters.diet;
    if (filters.difficulty) whereClause.difficulty = filters.difficulty;
    if (filters.glutenfree) whereClause.glutenfree = filters.glutenfree;
    if (filters.maxTime) whereClause.time = { [Op.lte]: parseInt(filters.maxTime) };

    const recipes = await Dish.findAll({
      where: whereClause,
      include: [{
        model: Wowuser,
        attributes: ['id', 'name']  // Fetching both user ID and name
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;

    const recipes = await Dish.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { ingredients: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [{
        model: Wowuser,
        attributes: ['id', 'name']  // Fetching both user ID and name
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
};


exports.getProfile = async (req, res) => {
  const profileId = req.params.id;

  // Redirect to a static HTML page with the ID in the URL
  res.redirect(`/profile.html?id=${profileId}`);
  console.log("hitting personal profiles")
}


exports.userrecipies = async (req, res) => {
  try {
    const profileId = req.params.id;

    const recipes = await Dish.findAll({
      where: {
        userId: profileId, // Filter by creatorId
      },
      attributes: { exclude: ["creatorName", "userId"] }, // Exclude 'name' and 'creatorId'
      include: [
        {
          model: Wowuser,
          attributes: ["id", "name"], // Include user ID and name from Wowuser
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(recipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};