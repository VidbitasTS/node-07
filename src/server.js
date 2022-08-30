require('dotenv').config();
const { dbConfig } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ msg: 'Server online ok' });
});

// Visi users
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

// Visi posts
app.get('/api/articles', async(req, res) => {

    console.log('req.query ===', req.query);

    try {
        const connection = await mysql.createConnection(dbConfig);
        let sql = 'SELECT * FROM posts';
        if (req.query.id) {
            sql += ' WHERE id = ?';
        }
        if (req.query.order) {
            sql += ` ORDER BY ${connection.escapeId(req.query.order)}`;
        }
        if (req.query.limit) {
            sql += ` LIMIT ${connection.escape(+req.query.limit)}`;
        }

        console.log(sql);
        const [rows] = await connection.execute(sql, [req.query.id || null]);

        console.log(rows);
        res.status(200).json(rows);
        connection.end();
    } catch (error) {
        console.log('error connecting to db'.bgRed.bold, error);
        res.status(500).json({ msg: 'something went wrong' });
    }
});

// Post id
app.get('/api/articles/:aid', async(req, res) => {
    try {
        const aid = +req.params.aid;
        const connection = await mysql.createConnection(dbConfig);
        console.log('connected to db'.bgGreen.bold);
        const sql = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await connection.execute(sql, [aid]);
        console.log(rows);
        if (rows.length !== 0) {
            res.json(rows);
        } else {
            res.status(404).json({ msg: 'Articls id not found' });
        }
        connection.end();
    } catch (error) {
        console.log('error connecting to db'.bgRed.bold, error);
        res.status(500).json({ msg: 'something went wrong' });
    }
});

// GET /api/articles/2 - grazina straipsni kurio id lygus 2 (dinaminis routes)
app.get('/api/articles/:aId', async(req, res) => {
    const id = req.params.aId;
    try {
        const conn = await mysql.createConnection(dbConfig);
        const sql = 'SELECT * FROM posts WHERE id = ?';
        const [rows] = await conn.execute(sql, [id]);
        // res.status(200).json(rows[0]);
        if (rows.length !== 0) {
            res.json(rows);
        } else {
            res.status(404).json({ msg: 'Articls id not found' });
        }
        await conn.end();
    } catch (error) {
        console.log('error ', error);
        res.status(500).json({
            msg: 'Something went wrong',
        });
    }
});

// DELETE /api/articles/:aId
app.delete('/api/articles/:aId', async(req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const sql = 'DELETE FROM posts WHERE id = ?';
        const [rows] = await conn.execute(sql, [req.params.aId]);
        if (rows.affectedRows === 1) {
            res.json({
                msg: 'deleted success',
            });
        } else {
            res.status(400).json({
                msg: 'nothing deleted',
            });
        }
        await conn.end();
    } catch (error) {
        console.log('error ', error);
        res.status(500).json({
            msg: 'Something went wrong',
        });
    }
});

// 404 
app.use((req, res) => {
    res.status(404).json({
        msg: 'Page not found',
    });
});

// Test DB SQL connecting
async function testDbConnection() {
    try {
        const conn = await mysql.createConnection(dbConfig)
        const [rows] = await conn.query('SELECT 1')
        console.log('Connected DB SQL'.bgCyan.bold)
        await conn.end()
    } catch (error) {
        console.log(`Error DB connecting ${error.message}`.bgRed.bold)
        if (error.code === 'ECONNREFUSED') {
            console.log('Is XAMPP running?'.bgYellow)
        }
    }
}
testDbConnection();

app.listen(port, () => console.log(`server is running on port ${port}`.bgYellow.bold));