const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Please provide rating'],
        },
        title: {
            type: String,
            trim: true,
            required: [true, 'Please provide review title'],
            maxlength: 100,
        },
        comment: {
            type: String,
            required: [true, 'Please provide review text'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    { timestamps: true }
);

// User can review 1 product only
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Normally when we create a methods in here we call it on the instance of the model
// Like 'user' = await User.create() then user.comparePassword here 'user' is the instance on this we call

// if we use statics we directly call on the Model

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    //console.log(productId);
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0), // optional chaining
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
    console.log(result)
}

ReviewSchema.post('save', async function () {
    // connected to above part
    await this.constructor.calculateAverageRating(this.product)
    //console.log('post save hook');
})

ReviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product)
    //console.log('post remove hook');
})

module.exports = mongoose.model('Review', ReviewSchema);