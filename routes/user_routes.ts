import { Router } from "express";
import {register,login,getAllUsers,getUserById,updateUser,deleteUser,} from "../controllers/auth_controller";

const router = Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Get all users
router.get("/", getAllUsers);

// Get a user by ID
router.get("/:id", getUserById);

// Update a user by ID
router.put("/:id", updateUser);

// Delete a user by ID
router.delete("/:id", deleteUser);

export default router;
