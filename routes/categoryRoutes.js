const express = require('express')
const authAdmin = require('../middlewares/authAdmin')
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController')

const categoryRouter = express.Router()

// create category
// api/category/create
categoryRouter.post('/create',authAdmin,createCategory)

// get all categories
// api/category/
categoryRouter.get('/',getAllCategories)

// get single category
// api/category/:id
categoryRouter.get('/:id',getCategoryById)

// update category
// api/category/update/:id
categoryRouter.patch('/update/:id',authAdmin,updateCategory)

// delete category
// api/category/delete/:id
categoryRouter.delete('/delete/:id',authAdmin,deleteCategory)

module.exports = categoryRouter