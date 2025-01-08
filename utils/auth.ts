import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' }); // טוקן בתוקף ל-15 דקות
};

// יצירת refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' }); // טוקן בתוקף ל-7 ימים
};

export const verifyToken = (token: string, isRefresh = false): { userId: string } => {
  const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
  return jwt.verify(token, secret) as { userId: string };
};

// הצפנת סיסמה
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // יצירת salt
  return await bcrypt.hash(password, salt); // החזרת סיסמה מוצפנת
};

// בדיקת סיסמה
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword); // השוואה בין סיסמה להצפנה
};