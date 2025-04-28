import jwt from 'jsonwebtoken';

export default function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token dibutuhkan' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: 'Format token salah' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'rahasia_sangat_kuat_disini'
    );

    req.user = payload;  // { userId: ..., role: ..., iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau expired' });
  }
}