const mongoose = require("mongoose")
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client_domain = process.env.CLIENT_DOMAIN
const createCheckoutSession = async (req,res)=>{
    try {
        const {products,shippingAddress} = req.body
        console.log(products)
        const lineItems = products.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                name: product?.productID?.title || product?.title,
                images: [product?.productID?.images?.[1] || product?.image || 'https://via.placeholder.com/150'],
                },
                unit_amount: Math.round((product?.productID?.price || product?.price) * 100),
            },
            quantity: product?.quantity || 1,
            }));
        console.log(lineItems);

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${client_domain}/user/payment/success`,
        cancel_url: `${client_domain}/user/payment/cancel`,
        });
        console.log(session)
        res.status(200).json({ success: true, sessionId: session.id });

    } catch (error) {
        console.log(error)
    }
};
const verifyCheckoutSession = async (req,res)=>{
    try {
        const {session_id}=req.query;
        const userId = req.user?.id // assumes auth middilware set req.user

        if(!session_id){
            return res.status(400).json({message:"session Id is required"});
        }
        if (!userId){
            return res.status(401).json({message:"User not Authenticated"});
        }

       const session = await stripe.checkout.sessions.retrieve(session_id)

       res.status(200).json({
        success: true,
        payment_status: session.payment_status,
        session,
        });

    } catch (error) {
        console.error("Error verifying checkout session:",error);
        res.status(500).json({message:"internal server error",error:error.message});
    }
};

module.exports={
createCheckoutSession,
verifyCheckoutSession
}