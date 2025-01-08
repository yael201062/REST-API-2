import { Request, Response } from 'express';
import User from '../models/user_model';
import { generateAccessToken, generateRefreshToken, hashPassword, comparePassword } from '../utils/auth';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};