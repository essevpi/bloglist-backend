const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

//Get all blogs
blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({});

        response.json(blogs);
    } catch (exception) {
        next(exception);
    }
});

//Get specific blog
blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id);
        if (blog) {
            response.json(blog);
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

//Create a blog
blogsRouter.post('/', async (request, response, next) => {
    if(!request.body.title || !request.body.url){
        response.status(400).json({
            error: 'the blog must have a title and an url'
        });
        return;
    }
    const blog = new Blog ({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes || 0
    });

    try {
        await blog.save();
        response.status(200).json(blog);
    } catch (exception) {
        next(exception);
    }
});

//Delete specific blog
blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        await Blog.findByIdAndRemove(request.params.id);
        response.status(204).end();
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