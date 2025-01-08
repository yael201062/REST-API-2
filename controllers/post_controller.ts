import { Request, Response } from 'express';
import Post from '../models/post_model';
import User from '../models/user_model';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  const { title, content } = req.body;
  const sender = req.userId;

  try {
    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPost = new Post({ title, content, sender });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate('sender', 'username');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId).populate('sender', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};