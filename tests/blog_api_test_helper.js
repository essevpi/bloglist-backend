const Blog = require('../models/blog');

const initialBlogs = [
    {
        title: 'Example blog 1',
        author: 'Author 1',
        url: 'url_1',
        likes: 2
    },
    {
        title: 'Example blog 2',
        author: 'Author 2',
        url: 'url_2',
        likes: 4
    },
    {
        title: 'Example blog 3',
        author: 'Author 1',
        url: 'url_3',
        likes: 8
    },
    {
        title: 'Example blog 4',
        author: 'Author 3',
        url: 'url_4',
        likes: 16
    },
];

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map(note => note.toJSON());
};

module.exports = {
    initialBlogs,
    blogsInDb
};