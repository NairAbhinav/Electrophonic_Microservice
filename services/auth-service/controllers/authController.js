import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '30d' }
  );
};

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    // Delegate creation to user-service
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/internal/register`, {
      name,
      email,
      password,
      role,
      phone
    });

    const user = response.data;

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user)
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Delegate validation to user-service
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/internal/login`, {
      email,
      password
    });

    const user = response.data;

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      profileImage: user.profileImage,
      token: generateToken(user)
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ message });
  }
};
