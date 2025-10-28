import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Razorpay from 'razorpay'
import User from "../models/User.js"


// Place order COD : /api/order/cod

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid Data" });
        }

        // Calculate total amount properly
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.json({ success: false, message: `Product not found: ${item.product}` });
            }
            amount += product.offerPrice * item.quantity;
        }

        // Add 2% tax
        amount += Math.floor(amount * 0.02);

        // Create order
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get orders by user id : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id
        const orders = await Order.find({
  userId,
  $or: [{ paymentType: "COD" }, { paymentType: "Online" }],
})
.populate("items.product address")
.sort({ createdAt: -1 });

        res.json({ success: true, orders })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// All order data : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// place order razorpay : /api/order/razorpay

export const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    let amount = 0;
    let productData = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: `Product not found: ${item.product}` });
      }
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET_KEY,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: order._id.toString(),
    });

    return res.json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.json({ success: false, message: error.message });
  }
};
