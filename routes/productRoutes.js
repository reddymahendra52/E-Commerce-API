const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

const { getSingleProductReviews } = require('../controllers/reviewController')

const {
    getAllProducts,
    getSingleProduct,
    updateProduct,
    uploadImage,
    createProduct,
    deleteProduct } = require('../controllers/productController')

router
    .route('/')
    .post([authenticateUser, authorizePermissions('admin')], createProduct)
    .get(getAllProducts);

router
    .route('/uploadImage')
    .post([authenticateUser, authorizePermissions('admin')], uploadImage);

router
    .route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
    .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router