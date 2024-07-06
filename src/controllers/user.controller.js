import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


}catch(error){
    throw new ApiError(500,"Something went wrong while generating referesh and access tokens")
}
}


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


    const  {fullName,email,username,password,} =  req.body
    console.log(req.body);
    console.log("emal:",email);


    if(
        [fullName,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields is requried")  
    }
    // if(fulName === ""){
    //     throw new AipError(400,"fullname is requried")
    // }
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);  
    let coverImageLocalPath;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    
    


    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || " ",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(createdUser);
    console.log(user)
    if(!createdUser){
        throw new ApiError(500,"Something want wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registred successfully")
    )

})


const loginUser = asyncHandler(async(req,res)=>{
    //req body ->
    //username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} =req.body

    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }
    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    console.log(user);
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404,"Invalid password")
    }
    
    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user.id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"User logged Out succseefull") )
})












export {
    registerUser,
    loginUser,
    logoutUser
}