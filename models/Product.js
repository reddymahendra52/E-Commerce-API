const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide product name'],
        maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0,
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg',
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
        type: String,
        required: [true, 'Please provide company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported',
        },
    },
    colors: {
        type: [String],
        required: true,
        default: ['#222']
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// in the actual database in this schema reviews is not added so can't use populate here
// so use mongoose virtual only logical connection not real one
// toJSON and toObject

ProductSchema.virtual('reviews', {
    ref: 'Review',        // reference to model
    localField: '_id',     // in the ref model what is the name
    foreignField: 'product',  // in the review what is that like foreign field
    justOne: false,

    // match: {rating:5}  like filter
});


// once product is deleted delete all the reviews associated with it
ProductSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({ product: this._id });
});


module.exports = mongoose.model('Product', ProductSchema);