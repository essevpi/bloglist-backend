const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 });
        res.status(200).json(users);
    } catch (exception) {
        next(exception);
    }
});

usersRouter.post('/', async (req, res, next) => {
    try {
        if (!req.body.password) {
            return res.status(400).json({ error: 'password must be given' });
        } else if (req.body.password.length < 3) {
            return res.status(400).json({ error: 'password must be at least 3 characters long' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

        const user = new User ({
            username: req.body.username,
            name: req.body.name,
            passwordHash,
        });

        const savedUser = await user.save();
        res.json(savedUser);
    } catch (exception) {
        next(exception);
    }
});

module.exports = usersRouter;