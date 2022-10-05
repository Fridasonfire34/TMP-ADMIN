import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT as any,
  database: process.env.PGDATABASE,
});

module.exports = pool;
