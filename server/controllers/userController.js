const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {

    const {name, email, password} = req.body
    if(!name || !email || !password){
        res.status(400);
        throw new Error('all fields must be included');
        
    }

    //check if user exists
    const userExists = await prisma.User.findUnique({
    where: {
        email: email
    }
    });

    if (userExists) {
        res.status(400);
        throw new Error('Email is taken');
    }

    //hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user
    const user = await prisma.User.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,    
        }
    });
    if(user){
        res.status(201)
        res.json({
            id : user.id,
            name : user.name, 
            email : user.email,
            token : generateToken(user.id)
        })
    }
    else{
        res.status(400)
        throw new Error("Something went wrong");
        
    }

}); 

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body

    const user = await prisma.User.findUnique(
        {
            where : {
                email: email
            }
        }
    )
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(201)
        res.json({
            id : user.id,
            name : user.name, 
            email : user.email,
            token : generateToken(user.id)
        })
    }
    else{
        res.status(400)
        throw new Error("invalid credentials")
    }

});

const getMe = asyncHandler(async(req, res) => {
    res.json({message: "getMe called"})
});

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn : '7d'})
}
const generateCode = asyncHandler(async(req, res) => {
   


  const userId = req.user.id;

  try {
    // Optional: delete any previous link code for this user
    await prisma.telegramLinkRequest.deleteMany({
      where: { userId }
    });

    // Generate a new UUID as the one-time code
    const code = uuidv4();

    // Store the code linked to the user
    await prisma.telegramLinkRequest.create({
      data: {
        code,
        user: {
          connect: { id: userId }
        }
      }
    });

    // Return the code to the frontend
    return res.status(200).json({ code });
  } catch (error) {
    console.error("Error in generateLinkCode:", error);
    return res.status(500).json({ message: "Failed to generate link code" });
  }



});


module.exports = {registerUser, loginUser, generateCode, getMe};
