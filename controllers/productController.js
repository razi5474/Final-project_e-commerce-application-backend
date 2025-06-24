const Product = require('../models/productsModel')
const { cloudinaryInstance } = require('../config/cloudinary');


// Create a new product
const createProduct = async (req, res,next) => {
    try {
        const {title,price,description,rating,stock,colors,category} = req.body || {}

        // Ensure the user is seller or admin
        if (req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only sellers or admin can create products' });
        }
        
        // Validate input
        if(!title || !price || !description|| !stock || !category){
            return res.status(400).json({error:"All fields are required"})
            
        // take file deatails from multer
        }
        
        const files = req.files
        if (!files || files.length === 0) {
        return res.status(400).json({ error: "At least one file is required" });
        }
        // console.log(files)

        // upload an image
        const cloudinaryResponse =files.map(file =>
        cloudinaryInstance.uploader.upload(file.path));

        const cloudinaryResults = await Promise.all(cloudinaryResponse);

        // console.log(cloudinaryResults)

        const sellerId = req.user.id
        
        const imageUrls = cloudinaryResults.map(result => result.url);

        const newProduct = new Product({
            title,
            price,
            description,
            rating: rating || 0,
            stock,
            colors: colors || [],
            images: imageUrls,
            sellerId: sellerId,
            category
        })
        // save product to db
        await newProduct.save()
        

        res.status(200).json({
            success:true,
            message:"product created successfully",
            product:newProduct})

    } catch (error) {
       console.log(error)
        res.status(error.status||500).json({error:error.message || 
        'Internal Server Error'})   
    }
}

// update product
   const updateProduct = async (req, res) => {
    try {
         const { id } = req.params;
        const { title, price, description, rating, stock, colors, category } = req.body || {};
        const userRole = req.user.role;

         // Find product first
         const product = await Product.findById(id);
         if (!product) return res.status(404).json({ error: 'Product not found' });

          // Check if seller is the owner
          if (userRole === 'seller' && (!product.sellerID || product.sellerID.toString() !== req.user.id)) {
          return res.status(403).json({ error: 'Not authorized to update this product' });
          }


        // Only admin or seller can update
        if (userRole!== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only sellers or admin can update products' });
        }

         const updatedData = {
            title,
            price,
            description,
            rating,
            stock,
            colors,
            category
        };
        // Handle new images
        if (req.files && req.files.length > 0) {
            const cloudinaryResponse = req.files.map(file =>
                cloudinaryInstance.uploader.upload(file.path)
            );
            const cloudinaryResults = await Promise.all(cloudinaryResponse);
            const imageUrls = cloudinaryResults.map(result => result.url);
            updatedData.images = imageUrls;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
   } 
   // Delete a product
    const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        const product = await Product.findById(id);
         if (!product) return res.status(404).json({ error: 'Product not found' });

         // Seller can only delete their own product
         if (userRole === 'seller' && (!product.sellerID || product.sellerID.toString() !== req.user.id)) {
          return res.status(403).json({ error: 'Not authorized to update this product' });
          }


        // Only admin or seller can delete
        if (req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only sellers or admin can delete products' });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product by ID
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products created by the logged-in seller
const getSellerProducts = async (req, res) => {
  try {
    // Only seller can access
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can view their products' });
    }

    const sellerId = req.user.id;
    const products = await Product.find({ sellerId }).populate('category');

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
// GET /api/product/category/:categoryId
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate('category');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products by category' });
  }
};

// search products by title
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ error: "Search keyword is required" });
    }

    const regex = new RegExp(keyword, "i"); // case-insensitive match
    const products = await Product.find({ title: { $regex: regex } })
      .select("title images") // return only what’s needed for suggestions
      .limit(10); // limit suggestions

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
};
module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getSingleProduct,
    getSellerProducts,
    getProductsByCategory,
    searchProducts
}