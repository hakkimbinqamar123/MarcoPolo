
import User from "../models/User.js"

// Update user cart data : /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { userId, cartItems } = req.body
        const flatCart = {}
        for (const key in cartItems) {
            flatCart[key] = typeof cartItems[key] === "object" ? cartItems[key].quantity : cartItems[key]
        }
        await User.findByIdAndUpdate(userId, { cartItems: flatCart })
        res.json({ success: true, message: "Cart Updated" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// import User from "../models/User.js";

// // Update user cart data : /api/cart/update
// export const updateCart = async (req, res) => {
//   try {
//     const { userId, cartItems } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     // Update the user's cart object
//     user.cartItems = cartItems;
//     await user.save();

//     res.json({
//       success: true,
//       message: "Cart Updated Successfully",
//       cartItems: user.cartItems,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };
