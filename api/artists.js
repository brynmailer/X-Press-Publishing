const artistsRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

artistsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Artist
    WHERE is_currently_employed = 1`,
    (err, rows) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ artists: rows });
      }
    }
  );
});

artistsRouter.post('/', (req, res, next) => {
  if (!req.body.artist.name
    || !req.body.artist.dateOfBirth
    || !req.body.artist.biography
  ) {
    res.sendStatus(400);
  }
  const isCurrentlyEmployed =
    req.body.artist.isCurrentlyEmployed === 0
      ? 0 : 1;
  db.run(
    `INSERT INTO Artist(
      name,
      date_of_birth,
      biography,
      is_currently_employed
    ) VALUES (
      $name,
      $dateOfBirth,
      $biography,
      $isCurrentlyEmployed
    )`,
    {
      $name: req.body.artist.name,
      $dateOfBirth: req.body.artist.dateOfBirth,
      $biography: req.body.artist.biography,
      $isCurrentlyEmployed: isCurrentlyEmployed
    },
    function (err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Artist
        WHERE id = $lastId`,
        {
          $lastId: this.lastID
        },
        (err, row) => {
          res.status(201).json({ artist: row });
        }
      );
    }
  );
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get(
    `SELECT *
    FROM Artist
    WHERE id = $artistId`,
    {
      $artistId: artistId,
    },
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.sendStatus(404);
      }
      req.artist = row;
      next();
    }
  );
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

artistsRouter.put('/:artistId', (req, res, next) => {
  const name = req.body.artist.name,
        dateOfBirth = req.body.artist.dateOfBirth,
        biography = req.body.artist.biography,
        isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Artist SET
      name = $name,
      date_of_birth = $dateOfBirth,
      biography = $biography,
      is_currently_employed = $isCurrentlyEmployed
    WHERE Artist.id = $artistId`,
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: req.params.artistId
    },
    (error) => {
    if (error) {
      next(error);
    } else {
      db.get(
        `SELECT * FROM Artist
        WHERE Artist.id = ${req.params.artistId}`,
        (error, artist) => {
          res.status(200).json({artist: artist});
        });
    }
  });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run(
    `UPDATE Artist
    SET is_currently_employed = 0
    WHERE Artist.id = $artistId`,
    {
      $artistId: req.params.artistId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Artist
        WHERE Artist.id = $artistId`,
        {
          $artistId: req.params.artistId
        },
        (err, row) => {
          res.status(200).json({artist: row});
        }
      );
    }
  );
});

module.exports = artistsRouter;