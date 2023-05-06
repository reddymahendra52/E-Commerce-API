const express = require('express')
const router = express.Router()

const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require('../controllers/userController')
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

// Here this admin passing role some high level stuff
// as apps grow many roles will be there so can't hardcode

router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllUsers)

// just to get the info if the user is present or not and all
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)

router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router