require('dotenv').config();
const { dbConfig, w_table } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const mysql = require('mysql2/promise');
const tableName = w_table[1];

const app = express();
const port = process.env.PORT || 5000;

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
    console.log('req.query ==='.bgGreen, req.query);
    try {
        const conn = await mysql.createConnection(dbConfig);
        //       let sql = `SELECT * FROM ${tableName} WHERE archive = 0`;
        let sql = `SELECT * FROM ${tableName} WHERE archive `;
        if (req.query.fields === 'archive') {
            sql += req.query.values;
        } else {
            sql += '0';
        }

        let numId = [];
        if (req.query.id) {
            numId = req.query.id.split(',');
            let str = numId.reduce((rez) => rez += '?,', '').substring(0, numId.length * 2 - 1);
            sql += ` AND id IN (${str})`;
        }

        if (req.query.fields !== 'archive') {
            if (req.query.fields) {
                if (req.query.values) {
                    sql += ` AND ${req.query.fields} ${req.query.values}`;
                }
            }
        }

        if (req.query.orderBy) {
            sql += ` ORDER BY ${conn.escapeId(req.query.orderBy)} `;
            if (req.query.ordered) {
                sql += req.query.ordered === 'desc' ? 'DESC' : 'ASC';
            }
        }

        if (req.query.limit) {
            sql += ` LIMIT ${conn.escape(+req.query.limit)}`;
        }

        console.log('sql ===', sql);
        const [rows] = await conn.execute(sql, numId);
        res.status(200).json(rows);
        await conn.end();
    } catch (error) {
        console.log('error ', error);
        res.status(500).json({
            msg: 'Something went wrong',
        });
    }
});

// DELETE /api/articles/:aId
app.delete('/api/articles', async(req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const sql = `UPDATE ${tableName} SET archive = ? WHERE id = ?`;
        const [rows] = await conn.execute(sql, [req.query.val, req.query.id]);
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