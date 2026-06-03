const jwt = require("jsonwebtoken");
const { users } = require("../data/mockData");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name || user.username, borrowerId: user.borrowerId || null },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient role" });
    }
    next();
  };
}

function login(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;
  return { token: generateToken(user), role: user.role, name: user.name || user.username, id: user.id, borrowerId: user.borrowerId };
}

module.exports = { authenticate, requireRole, login };
