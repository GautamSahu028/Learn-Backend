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

const loginUser = asyncHandler(async (req, res) => {
  // 1.) get data from req.body
  const { email, username, password } = req.body;

  // 2.) use username or email to enter
  // console.log("username : ", username);
  // console.log("password : ", password);

  if (!username && !email) {
    throw new ApiError(404, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });

  // 3.) find the user if it exists in DB, if not return error.
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 4.) check password
  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // 5.) if password is correct then generate access and refresh tokens
  // console.log("user._id : ", user._id);
  const { accessToken, refreshToken } =
    await user.generateAccessAndRefreshTokens(user._id);

  // 6.) remove the unwanted fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 7.) Send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
export { registerUser, loginUser, logOutUser };
