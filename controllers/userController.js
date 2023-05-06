const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustormErrors = require('../errors')
const {
    createTokenUser,
    attachCookiesToResponse,
    chechPermissions
} = require('../utils');


const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select('-password')
    if (!user) {
        throw new CustormErrors.BadRequestError(`No user with id: ${req.params.id}`)
    }

    // req.user coming from middleware and user._id from database
    chechPermissions(req.user, user._id)

    res.status(StatusCodes.OK).json({ user })
}


const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
}

const updateUser = async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ _id: req.user.userId });

    user.email = email;
    user.name = name;

    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both values');
    }
    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    user.password = newPassword;

    // here that .save prehook is invoked so the passwords are hashed also
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
