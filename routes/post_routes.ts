import express from 'express';
import {createPost,getAllPosts,getPostById,updatePost,deletePost,} from '../controllers/post_controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;