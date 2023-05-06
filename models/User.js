const mongoose = require('mongoose')
const validatorPackage = require('validator')

const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide emal'],
        validate: {
            validator: validatorPackage.isEmail,
            message: 'Please provide valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})

// Before saving the document we have to do this
// that's why that 'save' word
UserSchema.pre('save', async function () {
    // console.log(this.modifiedPaths());
    // console.log(this.isModified('name'));
    // for the update one
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// UserSchema.methods name is available on the User model
// comparing passwords and the 'candidate password' is the one which the user types
// using the good old funtion because then only 'this' is available

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}



module.exports = mongoose.model('User', UserSchema)