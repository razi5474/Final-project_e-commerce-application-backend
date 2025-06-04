const Category = require('../models/categoryModel');
// create category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const catagory = new Category({ name, description });
    await catagory.save();

    res.status(201).json({ success: true, catagory,message: 'Category created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const catagories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, catagories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const catagory = await Category.findById(req.params.id);
    if (!catagory) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json({ success: true, catagory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const updatedCatagory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCatagory) return res.status(404).json({ error: 'Category not found' });

    res.status(200).json({ success: true, catagory: updatedCatagory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete category
const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
  
};