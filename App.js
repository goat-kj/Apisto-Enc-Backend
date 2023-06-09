const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 4000;
const db = new sqlite3.Database('./apisto.db');
const loginDB = new sqlite3.Database('./login.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS apisto (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, origin TEXT, size TEXT, pH TEXT, image TEXT)');
});

loginDB.serialize(() => {
  loginDB.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, password TEXT)');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/all', (req, res) => {
    db.all('SELECT * FROM apisto', [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.json(rows);
    });
  });

  app.post('/signup', (req, res) => {
    const { account, password } = req.body;
    loginDB.run(`INSERT INTO users (account, password) VALUES (?, ?)`, [account, password], function(err) {
      if (err) {
        return console.log(err.message);
      };
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send('Created Successfully');
    });
  });
  

  app.post('/login', (req, res) => {
    const { account, password } = req.body;
    loginDB.get(`SELECT * FROM users WHERE account = ? AND password = ?`, [account, password], function(err, row) {
      if (err) {
        return console.log(err.message);
      }
      if (row) {
        console.log(`User with account ${account} has logged in`);
        res.status(200).send('Login successful');
      } else {
        console.log(`Invalid account or password`);
        res.status(401).send('Invalid account or password');
      }
    });
  });
  

  app.post('/create', (req,res) => {
    const fish = req.body;
    db.run(`INSERT INTO apisto (name, origin, size, pH, image) VALUES (?, ?, ?, ?, ?)`, [fish.name, fish.origin, fish.size, fish.pH, fish.image], function(err) {
      if (err) {
        return console.log(err.message);
      };
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.status(201).send('Created Successfully');
    });
  });

app.put('/update/:id', (req, res) => {
    const fishId = req.params.id;
    const updatedFish = req.body;
  
    db.run(
      `UPDATE apisto SET name = ?, origin = ?, size = ?, pH = ?, image = ? WHERE rowid = ?`,
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
    db.run(`DELETE FROM apisto WHERE rowid=?`, id, function(err) {
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
