require('dotenv').config();
const { dbConfig } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;
console.log(port, dbConfig);
// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ msg: 'Server online ok' });
});

app.get('/api/users', async(req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('connected to db'.bgGreen.bold);
        const sql = 'SELECT * FROM users';
        const [rows] = await connection.query(sql);
        console.log(rows);
        res.json(rows);
        connection.end();
    } catch (error) {
        console.log('error connecting to db'.bgRed.bold, error);
        res.status(500).json({ msg: 'something went wrong' });
    }
});

app.use((req, res) => {
    res.status(404).json({
        msg: 'Not found',
    });
});

app.listen(port, () => console.log(`server is running on port ${port}`.bgYellow.bold));