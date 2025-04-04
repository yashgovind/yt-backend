import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


// helper function to generate Acess and Refresh Tokens and send them in as Objects.
async function generateRefreshAndAccessToken(userId) {
  try {
    // find user , generate access and refresh token for user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    // console.log(`user is :${user}`);
    let accessToken = user.generateAccessToken();
    let refreshToken = user.generateRefreshToken();

    // console.log(`access token is : ${accessToken}`);
    // console.log(`refresh token is : ${refreshToken}`);
    await user.save({ validateBeforeSave: true });
    return { accessToken, refreshToken };


  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// function to register a new User.
async function registerUser(req, res) {
  // console.log(req.files);
  /*
  note : password is already getting hashed before saving into the db , so we havent done it here.
    -- get user details from the frontend / req.body
    -- check if user already exists:username,email / VALIDATION
    --check for images and check for avatar
    -- upload them to cloudinary and check for avatar.
    -- create a new user object -- create entry in DB
    -- create new avatar,cover image
    -- remove refresh token and password to the user object if user is Found.
    -- check for user creation
    -- return response
    */
  try {
    const { fullname, email, username, password } = req.body;
    if (
      [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
      return res.status(400).json({ error: "all fields are needed" });
    }
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return res
        .status(409)
        .json({ error: "user with email or username already exists" });
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log('avatar path is ', avatarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // this is a common error
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
    // console.log('file cover image path is ', coverImageLocalPath);

    if (!avatarLocalPath) {
      return res.status(400).json({
        error: "error is needed",
      });
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
      let coverImage = await uploadToCloudinary(coverImageLocalPath);
      if (!avatar) {
          return res.status(400).json({
              message:"avatar is needed"
          })
      }
    const user =  await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username:username.toLowerCase()
    })
    // remove the password and refresh token from the user and send to frontend
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(400).json({
        message:"something went wrong while registering user"
      })
    }
    return res.status(201).json({ createdUser  , message:"User created successfully" });
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// function to login registered User.
async function loginUser(req, res) {
  /*
 -- get fields/data from the frontend/req.body
 -- validation checks , username or email.
 -- get user from db
 -- user validation and password validation , check if the password is correct. if yes then move to next step
 -- generate access and refresh token
 -- set the refresh token and access in a cookie or a session
 -- find User logged in and remove password and refreshToken
  */
  try {
    // console.log('user from db is :', User);
    const { username, email, password } = req.body;
    // console.log(username, 'username');
    // console.log(email, 'email');
    if ((!username && !email)) {
      return res.status(400).json({
        message: "username or email is needed"
      });
    }
    const user = await User.findOne({
      $or: [{ username }, { email }]
    })
    // console.log(user, 'user is ');

    if (!user) {
      return res.status(404).json({
        message:"user is not found"
      })
    }
    // console.log(`user is ${user}`);

    let isPasswordiscorrect =   await user.isPasswordCorrect(password);
    // console.log("isPassisCorrect", isPasswordiscorrect);
    // checking for password
    if (!isPasswordiscorrect) {
      return res.status(401).json({
        message:"password is incorrect"
      })
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);
    // console.log(generateRefreshAndAccessToken(user._id));

    // remove password and refresh Token from the user object
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // set cookie

    const options = {
      httpOnly: true,
      secure:true
    }

    // send cookies and response.
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser, accessToken, refreshToken,
        message:"user logged in successfully"
      });


  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
// function to logOut existing User.
async function logoutUser(req, res) {
  /*
 -- find user from db
 -- remove the cookies and refresh token from db
 -- send empty user object abd clear the cookie
 -- better way is you find and update the refresh token as undefined and cookie as empty
  */
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken:undefined
        }
      },
      {
        new:true
      }

    )
    const options = {
      httpOnly: true,
      secure:true
    }
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({data:{}, message: "User has Logged Out SuccessFuLLy" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
// function to refreshAccess Token or session storage.

/*
-->get the refresh token from cookies.or from front-end../
-->get our  refreshToken from db
--> check if both are the same , if no , send err.
--> get the decoded token , find user by db call.
--> check if the incomingrefreshToken  from server is equal to the refreshToken onn Database.
--> if not then send error
--> generate new tokens if true;

*/
async function refreshAccessToken(req, res) {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (incomingRefreshToken) {
      return res.status(401).json({
        message: "Unauthorized Request"
      });
    }
    const decodedToken = jwt.verify(incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).josn({
        message: "invalid token."
      })
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).josn({
        message: "token expired."
      })
    }
    const options = {
      httpOnly: true,
      secure: true,
    }
    const { accessToken, newRefreshToken } = await generateRefreshAndAccessToken(user._id);

    return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', newRefreshToken, options).json(
      { accessToken, refreshToken: newRefreshToken })
  }
  catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export { registerUser, loginUser  , logoutUser};
