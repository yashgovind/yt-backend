import mongoose, { Mongoose, Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// id , username , password, refreshtoken, coverImage, watchHistory, fullname , avatar , email , c.at, u.at

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true
    },
    password: {
        type: String,
        required: [true,'Password is Needed'],
        unique: true,
        trim:true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index:true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type:String, // cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref:'Video',
    }],
    email: {
        type: String,
        required: true,
        unique: true,
    },
    refreshToken: {
     type:String
    },
    }, {
    timestamps: true,
});

// hooks or middlewares to perform password encryption before saving user to db
// hash the password before saving the user to the database
userSchema.pre('save', async function (next) {
    // encrypt the password , basically hash it, only if it is modified
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// method for checking if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log(password , 'password in db');
    // console.log(this.password , 'password hash');
    const pass = await bcrypt.compare(password, this.password);
    return pass;
}
// methods for generating Access Token and Refresh Tokens .
userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:'1d',
        },
    )

    // console.log('access token is', process.env.ACCESS_TOKEN_SECRET);
}
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:'10d',
        },
    )
    console.log('refresh token is',process.env.REFRESH_TOKEN_SECRET);
}



export const User = mongoose.model('User', userSchema);