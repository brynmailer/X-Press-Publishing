const issuesRouter = require('express').Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

const checkArtist = (req, res, next) => {
  db.get(
    `SELECT *
    FROM Artist
    WHERE Artist.id = $artistId`,
    {
      $artistId: req.body.issue.artistId
    },
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.sendStatus(400);
      }
      next();
    }
  );
}

issuesRouter.get('/', (req, res, next) => {
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
      res.status(200).json({ Issue: rows });
    }
  );
});

issuesRouter.post('/', checkArtist, (req, res, next) => {
  if (!req.body.issue.name
    || !req.body.issue.issueNumber
    || !req.body.issue.publicationDate
    || !req.body.issue.artistId
  ) {
    res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Issue (
      name,
      issue_number,
      publication_date,
      artist_id
    ) VALUES (
      $name,
      $issueNumber,
      $publicationDate,
      $artistId
    )`,
    {
      $name: req.body.issue.name,
      $issueNumber: req.body.issue.issueNumber,
      $publicationDate: req.body.issue.publicationDate,
      $artistId: req.body.issue.artistId
    },
    function (err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Issue
        WHERE Issue.id = $lastId`,
        {
          $lastId: this.lastID
        },
        (err, row) => {
          res.status(201).json({ issue: row });
        }
      );
    }
  );
});

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(
    `SELECT *
    FROM Issue
    WHERE id = $issueId`,
    {
      $issueId: issueId,
    },
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.sendStatus(404);
      }
      req.issue = row;
      next();
    }
  );
});

issuesRouter.put('/:issueId', checkArtist, (req, res, next) => {
  const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId;
  if (
    !name
    || !issueNumber
    || !publicationDate
    || !artistId
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Issue SET
      name = $name,
      issue_number = $issueNumber,
      publication_date = $publicationDate,
      artist_id = $artistId
    WHERE Issue.id = $issueId`,
    {
      $name: name,
      $issueNumber: issueNumber,
      $publicationDate: publicationDate,
      $artistId: artistId,
      $issueId: req.params.issueId
    },
    (error) => {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * 
        FROM Issue
        WHERE Issue.id = ${req.params.issueId}`,
        (error, issue) => {
          res.status(200).json({series: issue});
        });
    }
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run(
    `DELETE
    FROM Issue
    WHERE Issue.id = $issueId`,
    {
      $issueId: req.params.issueId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    }
  );
});

module.exports = issuesRouter;