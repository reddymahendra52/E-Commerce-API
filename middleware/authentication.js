const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
    // check for token in the signed cookies that's where it is present
    // the name is 'token'
    // in cookie-parser we are passing process.env.JWT_SECRET that's why signed i guess.

    const token = req.signedCookies.token;

    if (!token) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    try {
        // here we get the payload it is destructured
        // then attaching to req.user
        // in the user controller we can access that 'req.user'

        const { name, userId, role } = isTokenValid({ token });
        req.user = { name, userId, role };
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
};

const authorizePermissions = (...roles) => {

    // here we have access to req.user from prev middle ware
    // --basic version
    // function returning as a callback some stuff
    // 302- Some invoking of a function and lot of stuff happening

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError(
                'Unauthorized to access this route'
            );
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizePermissions,
};
