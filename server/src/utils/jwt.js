import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'findora_dev_jwt_secret_fallback';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    getJwtSecret(),
    {
      expiresIn: getExpiresIn()
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
