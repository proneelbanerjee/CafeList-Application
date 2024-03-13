const knex = require('knex');

const db = knex({
  client: process.env.CLIENT,
  connection: {
    host: process.env.HOST,
    user: process.env.USER,
    password: '',
    database: process.env.DATABASE,
  },
});

module.exports = db;