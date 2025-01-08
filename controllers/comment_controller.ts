import { Request, Response } from 'express';
import Comment from '../models/comment_model';
import Post from '../models/post_model';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  const { content, postId } = req.body;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = new Comment({ content, post: postId, user: userId });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getCommentsByPost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: postId }).populate('user', 'username');
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
  const commentId = req.params.id;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};