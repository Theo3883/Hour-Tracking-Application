const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticate = expressJwt({
  secret: secret,
  algorithms: ['HS256'],
});

const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id, 
    email: user.email,
    firstName: user.firstName, 
    lastName: user.lastName,
    departmentID: user.departmentID, 
    role: user.role, 
  }, 
  secret, { expiresIn: '1h' });
};

module.exports = { authenticate, generateToken };