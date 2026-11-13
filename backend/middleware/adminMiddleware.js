export const adminOnly = (req, res, next) => {
  if (
    req.user &&
    req.user.isAdmin === true &&
    req.user.category === "Admin"
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: Administrator privileges required",
    });
  }
};
