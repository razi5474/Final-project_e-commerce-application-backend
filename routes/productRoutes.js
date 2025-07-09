const express = require('express')
const authSeller = require('../middlewares/authSeller')
const { createProduct, updateProduct, deleteProduct, getAllProducts, getSingleProduct, getProductsByCategory, searchProducts, getSellerProducts} = require('../controllers/productController')
const productRouter = express.Router()
const upload = require('../middlewares/multer')

// creat product
// /api/product/create
productRouter.post('/create',authSeller,upload.array('images',6),createProduct)

// update product
// /api/product/update/:productId
productRouter.put('/update/:id',authSeller,upload.array('images',6),updateProduct)

// delete product
// /api/product/delete/:productId
productRouter.delete('/delete/:id',authSeller,deleteProduct)

// get all products
// /api/product
productRouter.get('/all',getAllProducts)

// get all product created by seller
productRouter.get('/seller',authSeller,getSellerProducts)

// search products by title
productRouter.get('/search',searchProducts)

// get single product by id
// /api/product/:id
productRouter.get('/:id',getSingleProduct)

// get products by category
// /api/product/category/:categoryId
productRouter.get('/category/:categoryId',getProductsByCategory)




module.exports = productRouter