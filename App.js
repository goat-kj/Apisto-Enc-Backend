const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 4000;
const db = new sqlite3.Database('./apistogramma.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS fish (name TEXT, origin TEXT, size REAL, pH REAL, image TEXT)');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/all', (req, res) => {
    db.all('SELECT * FROM fish', [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.json(rows);
    });
  });

app.post('/create', (req,res) => {
    const fish = req.body;
    db.run(`INSERT INTO fish (name, origin, size, pH, image) VALUES (?, ?, ?, ?, ?)`, [fish.name, fish.origin, fish.size, fish.pH, fish.image], function(err) {
        if (err) {
          return console.log(err.message);
        };
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.status(201).send('Created Sucessfully');
  });
});

app.put('/update/:id', (req, res) => {
    const fishId = req.params.id;
    const updatedFish = req.body;
  
    db.run(
      `UPDATE fish SET name = ?, origin = ?, size = ?, pH = ?, image = ? WHERE rowid = ?`,
      [updatedFish.name, updatedFish.origin, updatedFish.size, updatedFish.pH, updatedFish.image, fishId],
      function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log(`Fish with ID ${fishId} has been updated`);
        res.status(200).send(`Fish with ID ${fishId} has been updated`);
      }
    );
  });

app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM fish WHERE rowid=?`, id, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Row(s) deleted ${this.changes}`);
      res.status(200).send(`Row(s) deleted: ${this.changes}`);
    });
  });
  

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
