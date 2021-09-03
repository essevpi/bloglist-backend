const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helper = require('./blog_api_test_helper');

let userToken;

describe('blogs',  () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await User.deleteMany({});

        const testUser = new User ({
            username: 'Test_d00d',
            password: 'testpw'
        });

        await testUser.save();

        const userForToken = {
            username: testUser.username,
            id: testUser._id
        };

        userToken = jwt.sign(userForToken, process.env.SECRET);

        await Promise.all(
            helper.initialBlogs.map((blog) => {
                blog.user = testUser.id;
                return new Blog(blog).save();
            })
        );
    });
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
            .set('Authorization', `bearer ${userToken}`)
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
            .set('Authorization', `bearer ${userToken}`)
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
            .set('Authorization', `bearer ${userToken}`)
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
        const returnedBlog = await api
            .get(`/api/blogs/${blogToTest.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const parsedBlog = JSON.parse(JSON.stringify(blogToTest));
        expect(returnedBlog.body).toEqual(parsedBlog);
    });
});

describe('users', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({ username: 'root', passwordHash });

        await user.save();
    });

    test('can be created', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'test_user',
            name: 'Test User',
            password: 'testpassword'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });

    test('are not created if username already exists', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Test User',
            password: 'testpassword'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` to be unique');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('are not created if username is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            name: 'Test User',
            password: 'testpassword'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` is required');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('are not created if password is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'test_user',
            name: 'Test User'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('password must be given');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('are not created if password length is < 3', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'test_user',
            name: 'Test User',
            password: 'pw'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('password must be at least 3 characters long');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});

afterAll(() => {
    mongoose.connection.close();
});