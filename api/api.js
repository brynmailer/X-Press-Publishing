const apiRouter = require('express').Router();
const artistsRouter = require('./artists');
const seriesRouter = require('./series');

apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;