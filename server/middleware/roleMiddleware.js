const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }

    next();
  };
};

const readOnly = (req, res, next) => {
  if (req.user?.role === "Viewer" && req.method !== "GET") {
    return res.status(403).json({ message: "Viewers have read-only access" });
  }
  next();
};

module.exports = { authorize, readOnly };
