require('dotenv').config();
const { dbConfig, w_table } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;
console.log(w_table[0]);
// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ msg: 'Server online ok' });
});

// Routes
// GET /api/articles - grazina visus postus
app.get('/api/articles', async(req, res) => {
    // gauti query parametrus
    console.log('req.query ==='.bgGreen, req.query);

    try {
        const conn = await mysql.createConnection(dbConfig);
        let sql = `SELECT * FROM ${w_table[0]}`;

        // if query params id
        if (req.query.id) {
            sql += ' WHERE id = ?';
            const [rows] = await conn.execute(sql, [req.query.id]);
            res.status(200).json(rows);
            conn.end();
            return;
        }

        // http://localhost:3000/api/articles?orderBy=author
        // isrikiuoti pagal gauta parametra
        // if query params limit
        if (req.query.orderBy) {
            sql += ` ORDER BY ${conn.escapeId(req.query.orderBy)}`;
        }
        // if query params limit
        if (req.query.limit) {
            sql += ` LIMIT ${conn.escape(+req.query.limit)}`;
        }

        console.log('sql ===', sql);
        const [rows] = await conn.query(sql);
        res.status(200).json(rows);
        conn.end();
    } catch (error) {
        console.log('error ', error);
        res.status(500).json({
            msg: 'Something went wrong',
        });
    }
});

// GET /api/articles/2 - grazina straipsni kurio id lygus 2 (dinaminis routes)
// app.get('/api/articles/:aId', async(req, res) => {
//     const id = req.params.aId;
//     try {
//         const conn = await mysql.createConnection(dbConfig);
//         const sql = 'SELECT * FROM posts WHERE id = ?';
//         const [rows] = await conn.execute(sql, [id]);
//         // res.status(200).json(rows[0]);
//         if (rows.length !== 0) {
//             res.json(rows);
//         } else {
//             res.status(404).json({ msg: 'Articls id not found' });
//         }
//         await conn.end();
//     } catch (error) {
//         console.log('error ', error);
//         res.status(500).json({
//             msg: 'Something went wrong',
//         });
//     }
// });

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
        const conn = await mysql.createConnection(dbConfig);
        // eslint-disable-next-line no-unused-vars
        const [rows] = await conn.query('SELECT 1');
        console.log('Connected DB SQL'.bgCyan.bold);
        await conn.end();
    } catch (error) {
        console.log(`Error DB connecting ${error.message}`.bgRed.bold);
        if (error.code === 'ECONNREFUSED') {
            console.log('Is XAMPP running?'.bgYellow);
        }
    }
}
testDbConnection();

app.listen(port, () => console.log(`server is running on port ${port}`.bgYellow.bold));