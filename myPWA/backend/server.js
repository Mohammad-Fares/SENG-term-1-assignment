const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Set up SQLite database
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
            priority INTEGER,
            completed INTEGER DEFAULT 0
        )`);
    }
});

// Create a new task
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

// Get all tasks or tasks by date
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


// Get a single task by ID
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

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { name, date, priority, completed } = req.body;
    db.run(`UPDATE tasks SET name = ?, date = ?, priority = ?, completed = ? WHERE id = ?`,
        [name, date, priority, completed, id],
        function (err) {
            if (err) {
                res.status(500).send('Error updating data');
            } else {
                res.status(200).send('Updated successfully');
            }
        });
});

// Delete a task
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

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
