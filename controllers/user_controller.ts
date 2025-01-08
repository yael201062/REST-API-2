import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user_model";

// Register a new user
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// User login
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || "refresh", { expiresIn: "7d" });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { register, login, getAllUsers, getUserById, updateUser, deleteUser };
