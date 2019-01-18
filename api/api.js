const apiRouter = require('express').Router();
const artistsRouter = require('./artists');

apiRouter.use('/artists', artistsRouter);

module.exports = apiRouter;