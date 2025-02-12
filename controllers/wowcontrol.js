const path = require('path');
const sequelize = require('../util/database');
const validator = require('validator');
require('dotenv').config();
const bcrypt = require('bcrypt')
const Wowuser = require('../models/wowuser');
const Follow = require('../models/follows');
const Starred = require('../models/starred')
const Comment = require('../models/comments')
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
      // Exclude 'name' and 'creatorId'
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


exports.followUser = async (req, res) => {
  try {
    // Get follower ID from authenticated user (req.user)
    const followerId = req.user.id;
    // Get the target user (profile) ID from the request body
    const followedId = req.body.userId;

    // Optional: check if the user is already following the target profile
    const existingFollow = await Follow.findOne({ where: { followerId, followedId } });
    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Create a new follow record
    const newFollow = await Follow.create({ followerId, followedId });

    res.status(201).json({ message: "Followed successfully", follow: newFollow });
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.servefollowingpage = async (req, res) => {

  res.sendFile(path.join(__dirname, '..', 'public', 'following.html'));
}

exports.followingreciepies = async (req, res) => {
  try {
    // Find all users that the current user follows
    const followedUsers = await Follow.findAll({
      where: {
        followerId: req.user.id
      },
      attributes: ['followedId']
    });

    // Extract the followed user IDs
    const followedUserIds = followedUsers.map(follow => follow.followedId);

    // If user follows no one, return empty array
    if (followedUserIds.length === 0) {
      return res.json([]);
    }

    // Find all dishes from followed users with their creator information
    const dishes = await Dish.findAll({
      where: {
        userId: {
          [Op.in]: followedUserIds
        }
      },
      include: [{
        model: Wowuser,
        attributes: ['id', 'name', 'email'],
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });

    // Format the response to match your frontend display function
    const formattedDishes = dishes.map(dish => {
      const plainDish = dish.get({ plain: true });
      return {
        id: plainDish.id,
        name: plainDish.name,
        imageUrl: plainDish.imageUrl,
        diet: plainDish.diet,
        difficulty: plainDish.difficulty,
        time: plainDish.time,
        steps: plainDish.steps,
        glutenfree: plainDish.glutenfree,
        ingredients: plainDish.ingredients,
        creatorName: plainDish.wowuser ? plainDish.wowuser.name : plainDish.creatorName
      };
    });

    res.json(formattedDishes);

  } catch (error) {
    console.error('Error fetching following dishes:', error);
    res.status(500).json({
      error: "Error fetching dishes",
      details: error.message
    });
  }
}

exports.favourited = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dishId } = req.body;

    if (!dishId) {
      return res.status(400).json({ error: "Dish ID is required" });
    }

    // Check if the dish is already starred by the user
    const existingEntry = await Starred.findOne({ where: { userId, dishId } });

    if (existingEntry) {
      return res.status(409).json({ message: "Dish already starred" });
    }

    // Add the dish to favorites
    await Starred.create({ userId, dishId });

    res.status(201).json({ message: "Dish starred successfully" });
  } catch (error) {
    console.error("Error starring dish:", error);
    res.status(500).json({ error: "Failed to star dish" });
  }
};

exports.servefavouritepage = async (req, res) => {

  res.sendFile(path.join(__dirname, '..', 'public', 'favourite.html'));
}

exports.servemyprofile = async (req, res) => [

  res.sendFile(path.join(__dirname, '..', 'public', 'myprofile.html'))
]



exports.getstarreddish = async (req, res) => {
  try {

    const userId = req.user.id

    // Find all starred entries for the current user
    const starredEntries = await Starred.findAll({
      where: {
        userId: userId
      },
      attributes: ['dishId']
    });

    // Extract dish IDs from starred entries
    const starredDishIds = starredEntries.map(entry => entry.dishId);

    // If no starred dishes, return empty array
    if (starredDishIds.length === 0) {
      return res.json([]);
    }

    // Fetch all starred dishes with their creator information
    const starredDishes = await Dish.findAll({
      where: {
        id: starredDishIds
      },
      include: [{
        model: Wowuser,
        attributes: ['id', 'name'],
        required: false // Use false to still get dishes even if user is deleted
      }],
      order: [['createdAt', 'DESC']]
    });

    // Format dishes to match frontend display requirements
    const formattedDishes = starredDishes.map(dish => {
      const plainDish = dish.get({ plain: true });
      return {
        id: plainDish.id,
        name: plainDish.name,
        imageUrl: plainDish.imageUrl || '',
        diet: plainDish.diet || 'Not specified',
        difficulty: plainDish.difficulty || 'Not specified',
        time: plainDish.time || 0,
        steps: plainDish.steps || 'No steps provided',
        glutenfree: plainDish.glutenfree,
        ingredients: plainDish.ingredients,
        userId: plainDish.userId, // For the profile link
        creatorName: plainDish.creatorName || (plainDish.wowuser ? plainDish.wowuser.name : 'Anonymous')
      };
    });

    res.json(formattedDishes);

  } catch (error) {
    console.error('Error fetching starred dishes:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: "Invalid token",
        details: "Please login again"
      });
    }

    res.status(500).json({
      error: "Error fetching starred dishes",
      details: error.message
    });
  }
};

exports.owndishes = async (req, res) => {
  try {
    const profileId = req.user.id;

    const recipes = await Dish.findAll({
      where: {
        userId: profileId, // Filter by creatorId
      }
    })
    res.json(recipes)
  }
  catch (err) {
    console.log(err)

  }

}

exports.owndishdelete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dishid } = req.params;
    const deleted = await Dish.destroy({ where: { id: dishid, userId: userId } });

    if (deleted) {
      return res.status(200).json({ message: "Dish deleted successfully" });
    }
    res.status(404).json({ error: "Dish not found" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.commentpost = async (req, res) => {

  console.log(req.user.name, req.body.dishId, req.body.comment)
  try {

    const newComment = await Comment.create({
      name: req.user.name,
      dishId: req.body.dishId,
      comment: req.body.comment
    });
res.json(newComment)

  }
  catch (err) {
    console.log(err)
  }
}

exports.getComments = async (req, res) => {
  const dishId = req.query.dishId;
  console.log("Fetching comments for dish:", dishId);

  try {
    // Use findAll with a "where" clause to fetch comments matching the dishId.
    const comments = await Comment.findAll({
      where: { dishId }
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
};