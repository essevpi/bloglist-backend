const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require ('cors');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require ('./utils/middleware');
const blogsRouter = require('./controllers/blogs');

logger.info(`Connecting to ${config.MONGODB_URI}`);

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch(error => {
        logger.error('Could not connect to MongoDB:', error.message);
    });


app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;