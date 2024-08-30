// import { Message } from "../models/message.model";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";

export const register = async (req, res) => {
    try {
        //req body will sstore all the data from the form we submit, let's check it later on

        //Receiving input here
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing please enter again",
                success: false
            });
        }
        //Checking for existing  users
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Account already exists.",
                success: false,
            });
        }

        //Hashing password and creating user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });

        //Toasting the successss after completion hurrah!!, you weirdo
        return res.status(200).json({ message: "Account created Successfully!!", success: true })
    } catch (error) {
        console.log(error)
    }
}


// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(401).json({
//                 message: "Something is missing, please check!",
//                 success: false,
//             });
//         }
//         let user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({
//                 message: "Incorrect email or password",
//                 success: false,
//             });
//         }
//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if (!isPasswordMatch) {
//             return res.status(401).json({
//                 message: "Incorrect email or password",
//                 success: false,
//             });
//         };

//         const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
//         user = {
//             _id: user._id,
//             username: user.username,
//             email: user.email,
//             profilePicture: user.profilePicture,
//             bio: user.bio,
//             followers: user.followers,
//             following: user.following,
//             posts: user.posts
//         }
//         return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
//             message: `Welcome back ${user.username}`,
//             success: true,
//             user
//         });

//     } catch (error) {
//         console.log(error);
//     }
// };

export const login = async (req, res) => {
    try {
        //Taking email and password from the form or anything
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing please enter again",
                success: false,
            });
        }
        //Checking for existing  users and correct login email though:)
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        //Checking If the entered password is correct or not
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password",
                success: false,
            });
        }
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        //Creating user don't know for whatever reason->May be to return to the console or sumn 
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        }


        //     `If you don't include the userId in the token, the JWT will still work, but you won’t have the user's unique identifier embedded in the token.
        // This means that when you decode the token, you won't be able to directly identify which user it belongs to without making additional queries or using some other data.`

        //Creating a token which has userId as unique identifier, isko(userId) bad me use kiye hai in the isAuthenticated wala middleware by decoding it

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
    }
};

export const logout = (_, res) => {
    try {
        return res.cookie('token', '', { maxAge: 0 }).json({
            message: "User logged out succesfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findOne({ userId });
        return res.status(200).json({
            user,
            //Try removing and adding it back this and see what can happen, might give you some insights
            // message:"Getting the profiles easily",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const editProfile = async (res, req) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: "Profile Edited successfully",
            success: True,
            user
        });

    } catch (error) {
        console.log(error)
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: "suggested User not found",
                success: false,
            });
        }
        return res.status(200).json({
            // message: "Profile Edited successfully",
            success: True,
            users: suggestedUsers
        });
    } catch (error) {
        console.log(error)
    }
}

export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id;
        const jiskoFollowKrunga = req.params.id;
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: "You can't follow/unfollow yourself",
                success: false,
                // users: suggestedUsers
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: "User doesn't exists",
                success: false
            })
        }

        //To check If user is already following the person or not
        const isFollowing = user.following.includes(jiskoFollowKrunga); //also try targetUser ek bar later during api endpoint testing

        if (isFollowing) {
            //Unfollow logic aayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } })
            ])
            return res.status(200).json({ message: "Unfollowed successfully", success: true })
        } else {
            //Table ke andar do-do columns me jab kuchh krna rhta hai tab we use Promise.all
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } })
            ])
            return res.status(200).json({ message: "Followed successfully", success: true })
        }


    } catch (error) {
        console.log(error);
    }
}