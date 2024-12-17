const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const dbPath = path.join(__dirname, 'database', 'todo_list.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            date TEXT,
            priority INTEGER
        )`);
    }
});

app.post('/api/tasks', (req, res) => {
    const { name, date, priority } = req.body;
    db.run(`INSERT INTO tasks (name, date, priority) VALUES (?, ?, ?)`,
        [name, date, priority],
        function (err) {
            if (err) {
                res.status(500).send('Error inserting data');
            } else {
                res.status(201).json({ id: this.lastID });
            }
        });
});

app.get('/api/tasks', (req, res) => {
    const { date } = req.query;
    let query = 'SELECT * FROM tasks';
    let params = [];
    if (date) {
        query += ' WHERE date = ?';
        params.push(date);
    }
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else {
            res.status(200).json(rows);
        }
    });
});


app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else if (!row) {
            res.status(404).send('Task not found');
        } else {
            res.status(200).json(row);
        }
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { name, date, priority} = req.body;
    db.run(`UPDATE tasks SET name = ?, date = ?, priority = ? WHERE id = ?`,
        [name, date, priority, id],
        function (err) {
            if (err) {
                res.status(500).send('Error updating data');
            } else {
                res.status(200).send('Updated successfully');
            }
        });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(500).send('Error deleting data');
        } else {
            res.status(200).send('Deleted successfully');
        }
    });
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
