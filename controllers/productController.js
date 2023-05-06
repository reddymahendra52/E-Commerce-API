const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createProduct = async (req, res) => {

    // attaching the 'user' property to 'req.body' from 'req.user.userId'
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
}



const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({ products, count: products.length });
}



const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;

    // can't query the virtuals
    const product = await Product.findOne({ _id: productId }).populate('reviews')

    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    res.status(StatusCodes.OK).json({ product });
}



const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });

    if (!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    await product.remove();
    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });

}




const uploadImage = async (req, res) => {
    //console.log(req.files);
    if (!req.files) {
        throw new CustomError.BadRequestError('No File Uploaded');
    }
    const productImage = req.files.image;

    // checking for the type
    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Please Upload Image');
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) {
        throw new CustomError.BadRequestError(
            'Please upload image smaller than 1MB'
        );
    }

    const imagePath = path.join(
        __dirname,
        '../public/uploads/' + `${productImage.name}`
    );
    // available on productImage in req.files
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });


}

module.exports = {
    getAllProducts,
    createProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}