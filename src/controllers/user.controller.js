import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1.) get user details from frontend
  // 2.) Validation : notEmpty
  // 3.) Check if user already exists : from username or Email
  // 4.) Check for images and check from avatars
  // 5.) upload them to cloudinary, avatar
  // 6.) create user object : create entry in db
  // 7.) remove password and refreshToken field from response
  // 8.) check for user creation
  // 9.) return response

  //  console.log("req.body : ", req.body); // { email: 'b@s.com', password: '1253@' }

  // 1.) get user details from frontend
  const { fullName, email, username, password } = req.body;
  //console.log("Email : ", email);

  // 2.) Validation : notEmpty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Full name is required");
  }

  // 3.) Check if user already exists : from username or Email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists!");
  }

  // 4.) Check for images and check from avatars
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(avatarLocalPath);
  console.log(coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required!");
  }

  // 5.) upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log(avatar == true);
  // console.log(coverImage == true);

  if (!avatar) {
    throw new ApiError(400, "Avatar File is required!");
  }

  // 6.) create user object : create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // 7.) remove password and refreshToken field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 8.) check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 9.) return response
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User registered successfully...!")
    );
});

export { registerUser };
