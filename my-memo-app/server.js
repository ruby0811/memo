const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend

// Initialize SQLite DB
const db = new sqlite3.Database('./memo.db', (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.run(`CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Save Memo API
app.post('/api/save', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).send("Content is required");
    
    db.run("INSERT INTO memos (content) VALUES (?)", [content], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID, message: "Memo saved successfully!" });
    });
});

// Load Memo API (gets the most recent memo)
app.get('/api/load', (req, res) => {
    db.get("SELECT * FROM memos ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json(row || { content: "" });
    });
});

// Delete Memo API (Deletes all memos)
app.delete('/api/delete', (req, res) => {
    db.run("DELETE FROM memos", (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: "All memos deleted successfully." });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
