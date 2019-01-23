const seriesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

seriesRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Series`,
    (err, rows) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ series: rows });
    }
  );
});

module.exports = seriesRouter;