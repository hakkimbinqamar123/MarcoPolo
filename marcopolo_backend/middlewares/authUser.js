import jwt from 'jsonwebtoken'

const authUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to req object
    req.user = { id: tokenDecode.id };

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;