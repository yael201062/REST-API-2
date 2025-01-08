const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    body: { type: String, required: true },
    author: { type: String, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
