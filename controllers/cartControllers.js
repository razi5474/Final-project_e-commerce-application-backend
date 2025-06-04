const Cart = require('../models/cartsModel')
const Product = require('../models/productsModel')

// get cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const cart = await Cart.findOne({userId}).populate
        ('Products.productID', 'title price imageUrl');

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        return res.status(200).json({data: cart, message: "Cart retrieved successfully"});

    } catch (error) {
        
    }
}


// add product to cart
const addProducttoCart = async (req, res,next) => {
    try {
        //user Id
        const userId = req.user.id
        const{productId,quantity} = req.body || {}
        
        // find product is valid
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({error:"Product not found"})
        }

        // find the user cart or create a new one
        let cart = await Cart.findOne({userId})
        if(!cart){
            cart = new Cart({userId, Products: []})
        }

        // check if product already exists in the cart
        const productExists= cart.Products.findIndex((item) =>
        item.productID.equals(productId))

        if (productExists !== -1) {
         // Product already exists — update quantity and totalAmount
        cart.Products[productExists].quantity += quantity;
        cart.Products[productExists].price = product.price;
        }else {
         cart.Products.push({
         productID: productId,
         price: product.price,
         quantity: Number(quantity)
      });
    }
    // Calculate total price
    cart.calculateTotalPrice();
    await cart.save();

    return res.status(200).json({ message: "Cart updated successfully", cart });
    } catch (error) {
        console.log(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

// remove product from cart
const removeProductFromCart = async (req, res) => {
 try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Find the user's cart
    let cart = await Cart.findOne({userId})
    if(!cart){
        return res.status(404).json({ error: "Cart not found" });
    }

    // Remove the product from the cart
    cart.Products = cart.Products.filter(
        (item) => !item.productID.equals(productId)
    )

    // Recalculate total price
    cart.calculateTotalPrice();
    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Product removed from cart successfully", cart });

 } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
 }
}

// clear cart
const clearCart = async (req,res)=>{
    try {
        // validate user
        const userId = req.user.id;
        if(!userId){
            return res.status(401).json({ success:false,error: "Unauthorized : user not authenticated" });
        }

        // update cart in one operation
        const result = await Cart.updateOne(
            {userId},
            {$set: {Products: [], totalPrice: 0}}
        );

        // check if cart was found
        if (result.matchedCount === 0){
            return res.status(404).json({ success: false, error: "Cart not found" });
        }
        return res.status(200).json({ success: true, message: "Cart cleared successfully" });

    } catch (error) {
        console.log(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

// update product quantity in cart
const updateProductInCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: "Product ID and valid quantity are required" });
    }

    // Validate product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found in database" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = cart.Products.findIndex((item) =>
      item.productID.equals(productId)
    );
 if (quantity === 0) {
      // If quantity is 0, remove the product if it exists
      if (productIndex !== -1) {
        cart.Products.splice(productIndex, 1);
      }
    } else {
      if (productIndex !== -1) {
        // If product exists, update quantity
        cart.Products[productIndex].quantity = quantity;
      } else {
        // If product not in cart, add it
        cart.Products.push({
          productID: productId,
          quantity,
          price: product.price
        });
      }
    }

    // Recalculate total price
    cart.calculateTotalPrice();

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Cart product updated successfully", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// delete cart by admin
const deleteUserCart = async (req,res)=>{
    try {
        const { userId } = req.params;
        // delete the cart for the given user ID
        const deleted = await Cart.findOneAndDelete({ userId });

        if (!deleted) {
        return res.status(404).json({ error: "Cart not found for this user" });
         }

        return res.status(200).json({ message: "Cart deleted successfully by admin" });

    } catch (error) {
     console.log(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}



module.exports = {
    addProducttoCart,
    removeProductFromCart,
    getCart,
    clearCart,
    updateProductInCart,
    deleteUserCart
}