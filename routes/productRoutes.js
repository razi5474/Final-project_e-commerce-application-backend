const express = require('express')
const authSeller = require('../middlewares/authSeller')
const { createProduct, updateProduct, deleteProduct, getAllProducts, getSingleProduct} = require('../controllers/productController')
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

// get single product by id
// /api/product/:id
productRouter.get('/:id',getSingleProduct)



module.exports = productRouter