import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../controllers/comment_controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createComment);
router.get('/:postId', authenticate, getCommentsByPost);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;