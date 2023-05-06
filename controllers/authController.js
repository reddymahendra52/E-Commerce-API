const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustormErrors = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')


const register = async (req, res) => {

    // check for if email already exists
    const { email, name, password } = req.body

    const emailAlreadyExists = await User.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustormErrors.BadRequestError('Email already exists')
    }

    // approaches to set the 'admin' or 'user' role
    // By default it is the 'user' role, can change in MongoDB or else
    // check first user and set as 'admin

    const isFirstRegistered = (await User.countDocuments({})) === 0;
    const role = isFirstRegistered ? 'admin' : 'user'

    const user = await User.create({ name, email, password, role })

    // create token in payload we pass what we will be sending
    // id, here role is also impt
    const tokenUser = createTokenUser(user)
    // cookies
    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).json({ user: tokenUser }); // send all user only in dev env
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = { name: user.name, userId: user._id, role: user.role }
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
}

module.exports = {
    register,
    login,
    logout
}