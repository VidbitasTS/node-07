const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

const w_table = [
    process.env.WORK_TABLE1,
    process.env.WORK_TABLE2
];

module.exports = {
    dbConfig,
    w_table,
};