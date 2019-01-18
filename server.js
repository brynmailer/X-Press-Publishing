const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const cors = require('cors');

const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

module.exports = app;