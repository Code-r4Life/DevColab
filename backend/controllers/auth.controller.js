import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/http.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // (Change to 'bcrypt' if this throws a missing module error)

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return fail(res, 'All fields are required', 422);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return fail(res, 'Email already registered', 400);

  // 🛠️ THE FIX: Securely encrypt the password into a hash before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Map the encrypted password to 'passwordHash' to perfectly match your database schema
  const user = await User.create({ 
    name, 
    email: email.toLowerCase(), 
    passwordHash: hashedPassword 
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  return ok(res, {
    token,
    user: { id: user._id, name: user.name, email: user.email }
  }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'Email and password are required', 422);

  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Verify the password using your schema's built-in comparison method
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, 'Invalid email or password', 401);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  return ok(res, {
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, { user });
});