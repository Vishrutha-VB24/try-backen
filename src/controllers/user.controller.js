import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
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
        throw new ApiError(400,"All fields is requried")  
    }
    // if(fulName === ""){
    //     throw new AipError(400,"fullname is requried")
    // }
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);  
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user =  User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    if(!createdUser){
        throw new ApiError(500,"Something want wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registred successfully")
    )

})

export {
    registerUser,
}