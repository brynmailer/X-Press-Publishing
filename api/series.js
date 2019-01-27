const seriesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const issuesRouter = require('./issues');

seriesRouter.use('/:seriesId/issues', issuesRouter);

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

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get(
    `SELECT *
    FROM Series
    WHERE id = $seriesId`,
    {
      $seriesId: seriesId,
    },
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.sendStatus(404);
      }
      req.series = row;
      next();
    }
  );
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
  if (!req.body.series.name
    || !req.body.series.description
  ) {
    res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Series(
      name,
      description
    ) VALUES (
      $name,
      $description
    )`,
    {
      $name: req.body.series.name,
      $description: req.body.series.description
    },
    function (err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Series
        WHERE id = $lastId`,
        {
          $lastId: this.lastID
        },
        (err, row) => {
          res.status(201).json({ series: row });
        }
      );
    }
  );
});

seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name,
        description = req.body.series.description;
  if (!name || !description) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Series SET
      name = $name,
      description = $description
    WHERE Series.id = $seriesId`,
    {
      $name: name,
      $description: description,
      $seriesId: req.params.seriesId
    },
    (error) => {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * 
        FROM Series WHERE Series.id = ${req.params.seriesId}`,
        (error, series) => {
          res.status(200).json({series: series});
        });
    }
  });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Issue
    WHERE series_id = $seriesId`,
    {
      $seriesId: req.params.seriesId
    },
    (err, rows) => {
      if (err) {
        return next(err);
      }
      if (rows) {
        return res.sendStatus(400);
      }
      db.run(
        `DELETE
        FROM Series
        WHERE Series.id = $seriesId`,
        {
          $seriesId: req.params.seriesId
        },
        (err) => {
          if (err) {
            return next(err);
          }
          res.sendStatus(204);
        }
      );
    }
  );
});

module.exports = seriesRouter;