import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js"
//controller for user registration
//POST:/api/users/register

const generateToken=(userId)=>
{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'})
    return token;
}
export const registerUser=async(req,res)=>
{
    try{
       const {name,email,password}=req.body;

       //check if required fields are present
      if (!name || !email || !password) {
        return res.status(400).json({message:"Missing required fields"})
       }
       //check if user already exists
       const user=await User.findOne({email})
       if(user)
       {
        return res.status(400).json({message:"User Already exists"})
       }

       //create new user
       const hashedPassword=await bcrypt.hash(password,10)
       const newUser=await User.create({
        name,email,password:hashedPassword
       }) 
  //return success message
  const token=generateToken(newUser._id)
  newUser.password=undefined;

  return res.status(201).json({message:'User created Successfully',token,user:newUser})
}catch(error)
    {
           return res.status(400).json({message:error.message})
    }
}

//controller for user login
//POST:/api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if required fields are present
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password before sending response
    user.password = undefined;

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for getting logged-in user data
// GET: /api/users/data

export const getUserById = async (req, res) => {
  try {
    const userId=req.userId
    const user = await User.findById(userId);

//check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    //return user
    user.password=undefined;
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for getting user resumes
// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
  try {
    const userId=req.userId;
    //return user resumes
    const resumes = await Resume.find({userId})
  
    return res.status(200).json({
      resumes,
    });
  } catch (error) {
    return res.status(400).json({
   
      message: error.message,
    });
  }
};
