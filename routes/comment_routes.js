const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment_controller');

router.post('/', commentController.addComment);
router.get('/:postId', commentController.getCommentsByPost);
router.get('/', commentController.getAllComments); 
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
