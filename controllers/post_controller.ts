const Post = require('../models/post_model');

//create post
exports.addPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//get all post
exports.getAllPosts = async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
};

//get post by id
exports.getPostById = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
};

//get post by sender
exports.getPostsBySender = async (req, res) => {
    const posts = await Post.find({ sender: req.query.sender });
    res.json(posts);
};

//update post
exports.updatePost = async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
};
