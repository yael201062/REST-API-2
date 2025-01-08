const express = require('express');
const postController = require('../controllers/post_controller');
const router = express.Router();

router.post('/', postController.addPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/sender/:senderId', postController.getPostsBySender);
router.put('/:id', postController.updatePost);

module.exports = router;
