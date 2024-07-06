import { asyncHandler } from "../utils/asyncHandler.js";
import { AipError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"

const registerUser = asyncHandler( async(req,res)=>{
    //  res.status(200).json({
    //     message:"ok"})
    //get user from frontend
    //validation and check if user already exits:username and email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object- create entry in DB
    //remove password and referesh token field from response
    //check for user creation 
    //return res


    const  {fulName,email,username,password,} =  req.body
    console.log("emal:",email);


    if(
        [fulName,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new AipError(400,"All fields is requried")  
    }
    // if(fulName === ""){
    //     throw new AipError(400,"fullname is requried")
    // }
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
})

export {
    registerUser,
}