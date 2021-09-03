const loginRouter = require('express').Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

loginRouter.post('/', async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        const passwordCorrect = user === null
            ? false
            : await bcrypt.compare(req.body.password, user.passwordHash);

        if(!(user && passwordCorrect)){
            return res.status(401).json({
                error: 'invalid username or password'
            });
        }

        const userForToken = {
            username: user.username,
            id: user._id
        };

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60*60 }
        );

        res
            .status(200)
            .send({ token, username: user.username, name: user.name });
    } catch (exception) {
        next(exception);
    }
});

module.exports = loginRouter;
