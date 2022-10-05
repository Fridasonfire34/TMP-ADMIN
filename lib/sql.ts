import sql from "mssql";

const config = {
  user: "sa",
  password: "M0nd4y$44",
  server: "localhost",
  database: "sqledge",
};

const connection = sql.connect(config);
module.exports = connection;
