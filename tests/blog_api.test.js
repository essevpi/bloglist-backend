const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./blog_api_test_helper');

beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs
        .map(b => new Blog(b));

    const promiseArray = blogObjects.map(b => b.save());
    await Promise.all(promiseArray);
});

describe('blogs',  () => {
    test('are in JSON format', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('are all returned', async () => {
        const response = await helper.blogsInDb();

        expect(response).toHaveLength(helper.initialBlogs.length);
    });

    test('identifier is defined as id', async () => {
        const blogs = await helper.blogsInDb();
        const isDef = Object.prototype.hasOwnProperty.call(blogs[0], 'id');
        //console.log('isDef ? ', isDef);
        expect(isDef).toBeDefined();
    });

    test('can be posted', async () => {
        const blogToAdd = {
            title: 'Test Title',
            author: 'Test Author',
            url: 'test_url',
            likes: 5
        };

        await api
            .post('/api/blogs')
            .send(blogToAdd)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();

        const blogTitles = blogsAtEnd.map(b => b.title);

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
        expect(blogTitles).toContain('Test Title');
    });

    test('posted without likes get likes default to 0', async () => {
        const blogToAdd = {
            title: 'Blog with no likes',
            author: 'Author no one likes',
            url: 'test_url'
        };

        await api
            .post('/api/blogs')
            .send(blogToAdd)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();

        const blogTitles = blogsAtEnd.map(b => b.title);

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
        expect(blogTitles).toContain('Blog with no likes');
        expect(blogsAtEnd[blogsAtEnd.length-1].likes).toBe(0);
    });

    test('posted without title and url are rejected', async () => {
        const blogToAdd = {
            author: 'Test Author',
            likes: 7
        };

        await api
            .post('/api/blogs')
            .send(blogToAdd)
            .expect(400);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test('can be deleted', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDel = blogsAtStart[0];

        await api
            .delete(`/api/blogs/${blogToDel.id}`)
            .expect(204);

        const blogsAtEnd = await helper.blogsInDb();
        const ids = blogsAtEnd.map(b => b.id);

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);
        expect(ids).not.toContain(blogToDel.id);
    });

    test('likes can be updated', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToUpdate = { ...blogsAtStart[0], likes: 100 };

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(200);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd[0].likes).toBe(100);
    });

    test('can get a single blog', async () =>  {
        const blogs = await helper.blogsInDb();
        const blogToTest = blogs[0];
        //console.log(blogToTest.id);
        const returnedBlog = await api
            .get(`/api/blogs/${blogToTest.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);
        console.log(returnedBlog.id);
        const parsedBlog = JSON.parse(JSON.stringify(blogToTest));

        expect(returnedBlog.body).toEqual(parsedBlog);
    });
});

afterAll(() => {
    mongoose.connection.close();
});