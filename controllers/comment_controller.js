const Comment = require('../models/comment_model');

//add a comment
exports.addComment = async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// get all comments
exports.getAllComments = async (req, res) => {
    const comments = await Comment.find();
    res.json(comments);
};

// get comments by post ID
exports.getCommentsByPost = async (req, res) => {
    const comments = await Comment.find({ postId: req.params.postId });
    res.json(comments);
};

// update a comment
exports.updateComment = async (req, res) => {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
};


// Delete a Comment
exports.deleteComment = async (req, res) => {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully' });
};