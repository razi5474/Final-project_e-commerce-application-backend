const Product = require('../models/productsModel')
const { cloudinaryInstance } = require('../config/cloudinary');
const Seller = require('../models/sellersModel')


// Create a new product
const createProduct = async (req, res,next) => {
    try {
        const {title,price,offerPrice,description,rating,stock,colors,category} = req.body || {}

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

        let sellerID;

        console.log("req.user from token:", req.user);

        if (req.user.role === 'seller') {
          const seller = await Seller.findOne({ userId: req.user.id });
          if (!seller) return res.status(404).json({ error: "Seller not found" });
          sellerID = seller._id;
        } else if (req.user.role === 'admin') {
          if (req.body.sellerID) {
            sellerID = req.body.sellerID;
          }
        }
        
        const imageUrls = cloudinaryResults.map(result => result.url);

         // ✅ Convert colors to array if it’s a comma-separated string
        const colorsArray =
          typeof colors === 'string'
            ? colors.split(',').map(c => c.trim()).filter(Boolean)
            : Array.isArray(colors)
            ? colors
            : [];

        const newProduct = new Product({
            title,
            price,
            offerPrice: offerPrice || 0,
            description,
            rating: rating || 0,
            stock,
            colors: colorsArray || [],
            images: imageUrls,
            ...(sellerID && { sellerID }),
            category
        })
        // save product to db
        await newProduct.save()
        
         // 🟡 OPTIONAL: Push product to seller’s `myProducts` array
        await Seller.findOneAndUpdate(
            { userId: req.user.id }, // match seller
            { $push: { myProducts: newProduct._id } }, // add product
            { new: true }
        );

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
    const { title, price, description, rating, stock, colors, category, sellerID } = req.body || {};
    const userRole = req.user.role;

    // 🔍 Find product first
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // 🔐 Check if seller is owner of this product
    if (userRole === 'seller') {
      const seller = await Seller.findOne({ userId: req.user.id });

      if (!seller) {
        return res.status(403).json({ error: 'Seller not found' });
      }
      console.log("Product sellerID:", product.sellerID.toString());
      console.log("Logged-in Seller ID:", seller._id.toString());
      if (product.sellerID.toString() !== seller._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
    }
    // 🔐 Only seller or admin can update
    if (userRole !== 'seller' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only sellers or admin can update products' });
    }

    // 🎨 Convert colors if string
    const colorsArray =
      typeof colors === 'string'
        ? colors.split(',').map(c => c.trim()).filter(Boolean)
        : Array.isArray(colors)
        ? colors
        : [];

    // ✏️ Construct update object
    const updatedData = {
      title,
      price,
      description,
      rating,
      stock,
      colors: colorsArray,
      category,
    };

    // ✅ Only admin can set sellerID manually
    if (userRole === 'admin' && sellerID) {
      updatedData.sellerID = sellerID;
    }

    // 🖼️ Upload new images if any
    if (req.files && req.files.length > 0) {
      const cloudinaryResponse = req.files.map(file =>
        cloudinaryInstance.uploader.upload(file.path)
      );
      const cloudinaryResults = await Promise.all(cloudinaryResponse);
      const imageUrls = cloudinaryResults.map(result => result.url);
      updatedData.images = imageUrls;
    }

    // ✅ Update and populate sellerID for visibility
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    }).populate('sellerID');

    console.log('Updated Product:', updatedProduct);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found after update' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: error.message || 'Internal Server Error' });
  }
};
 
   // Delete a product
    const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        const product = await Product.findById(id);
         if (!product) return res.status(404).json({ error: 'Product not found' });

          // 🔐 Seller can only delete their own product
            if (userRole === 'seller') {
              const seller = await Seller.findOne({ userId: req.user.id });
              if (!seller) {
                return res.status(403).json({ error: 'Seller not found' });
              }
              if (!product.sellerID || product.sellerID.toString() !== seller._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to delete this product' });
              }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortField = req.query.sort || 'createdAt'; // or 'price', 'title'
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const query = {
      title: { $regex: search, $options: 'i' }, // case-insensitive search
    };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category')
      .populate('sellerID')
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
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
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can view their products' });
    }

    // ✅ Step 1: Find seller using the logged-in user's ID
    const seller = await Seller.findOne({ userId: req.user.id });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerID = seller._id;
    console.log("Fetching products for sellerID:", sellerID);

    // ✅ Step 2: Fetch products with that sellerID
    const products = await Product.find({ sellerID }).populate('category');

    console.log("Products found:", products.length);
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