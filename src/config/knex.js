const knex = require("knex");

const conn = knex({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    password: "",
    database: "sdm_25_2",
  },
});

module.exports = conn;
