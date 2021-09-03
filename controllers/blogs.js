const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const auth = require('../utils/middleware').userExtractor;

//Get all blogs
blogsRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
        res.json(blogs);
    } catch (exception) {
        next(exception);
    }
});

//Get specific blog
blogsRouter.get('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            res.json(blog);
        } else {
            res.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

//Create a blog
blogsRouter.post('/', auth, async (req, res, next) => {
    if(!req.body.title || !req.body.url){
        res.status(400).json({
            error: 'the blog must have a title and an url'
        });
        return;
    }

    try {
        if (!req.token || !req.user.id) {
            return res.status(401).json({
                error: 'token missing or invalid'
            });
        }

        const blog = new Blog ({
            title: req.body.title,
            author: req.body.author,
            url: req.body.url,
            likes: req.body.likes || 0,
            user: req.user.id
        });

        const savedBlog = await blog.save();
        req.user.blogs = req.user.blogs.concat(savedBlog._id);
        await req.user.save();

        res.status(200).json(blog);
    } catch (exception) {
        next(exception);
    }
});

//Delete specific blog
blogsRouter.delete('/:id', auth, async (req, res, next) => {
    try {
        if (!req.token || !req.user.id) {
            return res.status(401).json({
                error: 'token missing or invalid'
            });
        }
        const blogToDelete = await Blog.findById(req.params.id);

        if (blogToDelete.user.toString() !== req.user.id) {
            return res.status(401).json({
                error: 'you are not authorized to delete this blog'
            });
        }
        await Blog.findByIdAndRemove(req.params.id);
        res.status(204).end();
    } catch (exception) {
        next(exception);
    }
});

//Update specific blog likes
blogsRouter.put('/:id', async (request, response, next) => {
    const blog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
    };

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
        return response.json(updatedBlog);
    } catch (exception) {
        next(exception);
    }
});

module.exports = blogsRouter;