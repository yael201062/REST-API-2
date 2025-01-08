import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';

// Register a new user
const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Type for tokens
type tTokens = {
    accessToken: string,
    refreshToken: string
}

// Generate access and refresh tokens
const generateToken = (userId: string): tTokens | null => {
    if (!process.env.TOKEN_SECRET) {
        console.log('TOKEN_SECRET is missing');
        return null;
    }
    try {
        const accessToken = jwt.sign(
            { _id: userId },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES }
        );
        const refreshToken = jwt.sign(
            { _id: userId },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
        );
        console.log('Tokens generated successfully');
        return { accessToken, refreshToken };
    } catch (err) {
        console.log('Error generating tokens:', err);
        return null;
    }
};

// Login a user
const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            console.log('User not found');
            res.status(400).send('wrong username or password');
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            console.log('Invalid password');
            res.status(400).send('wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            console.log('TOKEN_SECRET is missing');
            res.status(500).send('Server Error');
            return;
        }
        const tokens = generateToken(user._id);
        if (!tokens) {
            console.log('Failed to generate tokens');
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save(); // Save the refresh token to the user document
        console.log('User logged in successfully:', user._id);
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id
        });
    } catch (err) {
        console.log('Error in login:', err);
        res.status(400).send(err);
    }
};

// Type for user document
type tUser = Document<unknown, {}, IUser> & IUser & Required<{ _id: string }> & { __v: number };

// Verify the refresh token
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        console.log('Received refresh token:', refreshToken); // Log the token
        if (!refreshToken) {
            console.log('No refresh token provided');
            reject("No refresh token provided");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            console.log('TOKEN_SECRET is missing');
            reject("TOKEN_SECRET is missing");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                console.log('Token verification failed:', err); // Log the error
                reject("Token verification failed");
                return;
            }
            const userId = payload._id;
            console.log('User ID from token:', userId); // Log the user ID
            try {
                const user = await userModel.findById(userId);
                if (!user) {
                    console.log('User not found');
                    reject("User not found");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    console.log('Refresh token not found in user record');
                    user.refreshToken = [];
                    await user.save();
                    reject("Refresh token not found in user record");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;
                resolve(user);
            } catch (err) {
                console.log('Error finding user:', err); // Log the error
                reject("Error finding user");
                return;
            }
        });
    });
};

// Logout a user
const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        await user.save();
        console.log('User logged out successfully:', user._id);
        res.status(200).send("success");
    } catch (err) {
        console.log('Error in logout:', err);
        res.status(400).send("fail");
    }
};

// Refresh the access token
const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        console.log('Refresh token received:', refreshToken); // Log the refresh token
        if (!refreshToken) {
            console.log('No refresh token provided');
            res.status(400).send("No refresh token provided");
            return;
        }
        const user = await verifyRefreshToken(refreshToken);
        if (!user) {
            console.log('User not found');
            res.status(400).send("User not found");
            return;
        }
        const tokens = generateToken(user._id);
        if (!tokens) {
            console.log('Failed to generate tokens');
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save(); // Save the new refresh token to the user document
        console.log('Tokens refreshed successfully for user:', user._id);
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id
        });
    } catch (err) {
        console.log('Error in refresh:', err); // Log the error
        res.status(400).send("fail");
    }
};

// Middleware to authenticate requests
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    console.log('Authorization header:', authorization); // Log the header
    console.log('Token:', token); // Log the token

    if (!token) {
        console.log('No token provided');
        res.status(401).send('Access Denied');
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        console.log('TOKEN_SECRET is missing');
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log('Token verification failed:', err); // Log the error
            res.status(401).send('Access Denied');
            return;
        }
        req.params.userId = (payload as { _id: string })._id;
        next(); // Pass the request to the next handler
    });
};
// Export the functions
export default {
    register,
    login,
    refresh,
    logout
};